<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Customer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class CustomerImportSeeder extends Seeder
{
    public function run(): void
    {
        $dataPath = database_path('seeders/data/customers.json');

        if (! file_exists($dataPath)) {
            $this->command->error("Data file not found: {$dataPath}");
            $this->command->warn("Please place the legacy export JSON at: database/seeders/data/customers.json");
            return;
        }

        $raw = file_get_contents($dataPath);
        $items = json_decode($raw, true);

        if (! is_array($items)) {
            $this->command->error('Failed to decode JSON file. Ensure it is a valid JSON array.');
            return;
        }

        $total = count($items);
        $this->command->info("Found {$total} records in JSON. Starting customer import...");

        // ── Pre-cache cities map for fast lookup ─────────────────────
        // Key: lowercase trimmed city name => city_id
        $cityMap = City::pluck('id', 'name')
            ->mapWithKeys(fn ($id, $name) => [strtolower(trim($name)) => $id])
            ->toArray();

        // ── Pre-load existing emails & phones for duplicate detection ─
        $existingEmails = Customer::whereNotNull('email')
            ->pluck('id', 'email')
            ->mapWithKeys(fn ($id, $email) => [strtolower(trim($email)) => $id])
            ->toArray();

        $existingPhones = Customer::whereNotNull('phone')
            ->pluck('id', 'phone')
            ->mapWithKeys(fn ($id, $phone) => [$this->sanitizePhone($phone) => $id])
            ->toArray();

        // ── Counters ──────────────────────────────────────────────────
        $createdCount    = 0;
        $skippedCount    = 0;
        $duplicateEmails = 0;
        $duplicatePhones = 0;
        $citiesMatched   = 0;
        $citiesNull      = 0;

        // legacy_id => new_customer_id map
        $legacyIdMap = [];
        $skippedLogs = []; // [identifier => reason]

        $bar = $this->command->getOutput()->createProgressBar($total);
        $bar->setFormat(" %current%/%max% [%bar%] %percent:3s%% -- %message%");
        $bar->setMessage('Initializing...');
        $bar->start();

        foreach ($items as $index => $item) {
            $legacyId   = $item['user_id'] ?? ($item['id'] ?? null);
            $recordRef  = $legacyId ? "Legacy ID #{$legacyId}" : "Record index #{$index}";

            // 1. Sanitize & prepare email / phone
            $rawEmail = isset($item['email']) ? trim($item['email']) : null;
            $email    = (! empty($rawEmail) && filter_var($rawEmail, FILTER_VALIDATE_EMAIL)) ? strtolower($rawEmail) : null;

            $rawPhone = $item['phone'] ?? null;
            $phone    = $rawPhone ? $this->sanitizePhone($rawPhone) : null;

            // 2. Duplicate Checks (Skip with reason)
            if ($email && isset($existingEmails[$email])) {
                $skippedLogs[$recordRef] = "Duplicate email: {$email}";
                $duplicateEmails++;
                $skippedCount++;
                $bar->advance();
                continue;
            }

            if ($phone && isset($existingPhones[$phone])) {
                $skippedLogs[$recordRef] = "Duplicate phone: {$phone}";
                $duplicatePhones++;
                $skippedCount++;
                $bar->advance();
                continue;
            }

            // 3. Name mapping
            $rawUsername = $item['username'] ?? ($item['name'] ?? null);
            $firstName   = ! empty(trim((string) $rawUsername)) ? trim((string) $rawUsername) : 'Customer';
            $lastName    = ! empty(trim((string) ($item['surname'] ?? ''))) ? trim((string) $item['surname']) : null;

            // 4. City Mapping (case-insensitive, fallback NULL)
            $legacyCityName = trim((string) ($item['city'] ?? ''));
            $cityId = null;
            if (! empty($legacyCityName)) {
                $lookupKey = strtolower($legacyCityName);
                if (isset($cityMap[$lookupKey])) {
                    $cityId = $cityMap[$lookupKey];
                    $citiesMatched++;
                } else {
                    $citiesNull++;
                }
            } else {
                $citiesNull++;
            }

            // 5. Country: legacy value if present, otherwise default 'Pakistan'
            $country = ! empty(trim((string) ($item['country'] ?? ''))) ? trim((string) $item['country']) : 'Pakistan';

            // 6. Address
            $address = ! empty(trim((string) ($item['address'] ?? ($item['address1'] ?? ''))))
                ? trim((string) ($item['address'] ?? ($item['address1'] ?? '')))
                : null;
            $address2 = ! empty(trim((string) ($item['address2'] ?? '')))
                ? trim((string) $item['address2'])
                : null;

            // 7. DB Transaction per record
            try {
                $newCustomer = DB::transaction(function () use (
                    $firstName,
                    $lastName,
                    $email,
                    $phone,
                    $address,
                    $address2,
                    $cityId,
                    $country
                ) {
                    return Customer::create([
                        'user_id'           => null,
                        'customer_group_id' => null,
                        'first_name'        => $firstName,
                        'last_name'         => $lastName,
                        'email'             => $email,
                        'phone'             => $phone,
                        'address'           => $address,
                        'address2'          => $address2,
                        'city_id'           => $cityId,
                        'country'           => $country,
                        'status'            => 'active',
                        'gender'            => null,
                        'dob'               => null,
                        'total_spent'       => 0,
                        'total_orders'      => 0,
                        'referred_by'       => null,
                    ]);
                });

                // Track newly created email/phone in local set
                if ($email) {
                    $existingEmails[$email] = $newCustomer->id;
                }
                if ($phone) {
                    $existingPhones[$phone] = $newCustomer->id;
                }

                // Map legacy ID to new Customer ID
                if ($legacyId) {
                    $legacyIdMap[(string) $legacyId] = $newCustomer->id;
                }

                $createdCount++;
                $bar->setMessage("Imported: {$firstName}");
            } catch (\Throwable $e) {
                $skippedLogs[$recordRef] = 'Exception: ' . $e->getMessage();
                $skippedCount++;
            }

            $bar->advance();
        }

        $bar->setMessage('Done');
        $bar->finish();
        $this->command->newLine(2);

        // ── Save legacy_customer_id_map.json ─────────────────────────
        $mapStoragePath = storage_path('app/legacy_customer_id_map.json');
        try {
            $mapDir = dirname($mapStoragePath);
            if (! File::exists($mapDir)) {
                File::makeDirectory($mapDir, 0755, true);
            }
            File::put($mapStoragePath, json_encode($legacyIdMap, JSON_PRETTY_PRINT));
            $this->command->info("Legacy ID map saved to: {$mapStoragePath}");
        } catch (\Throwable $e) {
            $this->command->error("Could not save legacy ID map file: " . $e->getMessage());
        }

        // ── Summary Table ────────────────────────────────────────────
        $this->command->info('═══════════════════════════════════════════════════════════');
        $this->command->info('           CUSTOMER IMPORT COMPLETE                       ');
        $this->command->info('═══════════════════════════════════════════════════════════');

        $this->command->table(
            ['Metric', 'Count'],
            [
                ['Total records processed',   $total],
                ['Customers created',         $createdCount],
                ['Customers skipped',         $skippedCount],
                ['Duplicate emails skipped',  $duplicateEmails],
                ['Duplicate phones skipped',  $duplicatePhones],
                ['Cities matched (FK linked)',$citiesMatched],
                ['Cities unmatched / NULL',   $citiesNull],
                ['Legacy ID mappings mapped', count($legacyIdMap)],
            ]
        );

        if (! empty($skippedLogs)) {
            $this->command->newLine();
            $this->command->warn('Skipped records summary (first 25 shown):');
            $slice = array_slice($skippedLogs, 0, 25, true);
            foreach ($slice as $ref => $reason) {
                $this->command->line("  • <fg=yellow>{$ref}</>: {$reason}");
            }
            if (count($skippedLogs) > 25) {
                $remaining = count($skippedLogs) - 25;
                $this->command->comment("  ... and {$remaining} more skipped records.");
            }
        }
    }

    /**
     * Standardize phone number for reliable duplicate detection.
     */
    private function sanitizePhone(string $phone): string
    {
        // Remove spaces, dashes, dots, brackets
        $clean = preg_replace('/[^\d+]/', '', trim($phone));

        // Normalize Pakistani 0092 to +92
        if (str_starts_with($clean, '0092')) {
            $clean = '+92' . substr($clean, 4);
        }

        return $clean ?: trim($phone);
    }
}
