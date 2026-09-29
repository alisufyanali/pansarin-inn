<?php

namespace App\Services;

use App\Helpers\PhoneHelper;
use App\Models\City;
use App\Models\Customer;
use App\Models\CustomerGroup;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;

class CustomerLegacyImportService
{
    // ── Lists used by classifyBucket() ────────────────────────────

    private const PK_CITIES = [
        'karachi', 'lahore', 'islamabad', 'rawalpindi', 'faisalabad', 'multan', 'peshawar',
        'quetta', 'hyderabad', 'sialkot', 'gujranwala', 'sukkur', 'abbottabad', 'mardan',
        'bahawalpur', 'arifwala', 'hafizabad', 'sargodha', 'mirpur', 'gujrat',
    ];

    private const FOREIGN_MARKERS = [
        'india', 'uk', 'united kingdom', 'norway', 'norge', 'usa', 'united states', 'spain',
        'barcelona', 'mumbai', 'oslo', 'oldbury', 'lucknow', 'deoria', 'sitapur', 'amroha',
        'srinagar', 'birmingham', 'punganur', 'new york', 'iran', 'saudia', 'saudi', 'madina',
    ];

    /**
     * Email patterns that mark a row as demo/junk — merged set used by both
     * isDemo() and isRescuePk(). Any row matching these is never rescue_pk.
     */
    private const JUNK_EMAIL_PATTERNS = [
        '@shop.com', '@example.com', '@test.com', 'mailinator.com',
        '@demo.', '@gok.com',
        'guerrillamail', 'sharklasers', 'spam4.me', 'yopmail.com',
        'trashmail', 'throwam.com', 'maildrop.cc',
        'customer1@', 'customer2@', 'customer3@', 'customer4@',
    ];

    /**
     * Raw-phone digit-strings ending with these 2-digit suffixes are known
     * shared test numbers (e.g. 09xxxxxxxx01). Exclude from rescue_pk.
     */
    private const TEST_PHONE_DIGIT_SUFFIXES = ['01'];

    // ── Main entry point ──────────────────────────────────────────

    public function run(bool $dryRun = false, ?string $dataPath = null): array
    {
        $dataPath ??= database_path('seeders/data/customers.json');
        $items = json_decode(file_get_contents($dataPath), true);
        if (! is_array($items)) {
            throw new \RuntimeException('Invalid customers.json');
        }

        $timestamp = now()->format('Ymd_His');
        $skipDir = storage_path('app/import-skipped');
        if (! $dryRun && ! File::isDirectory($skipDir)) {
            File::makeDirectory($skipDir, 0755, true);
        }

        $skipPath   = "{$skipDir}/customers_non_pk_phone_{$timestamp}.csv";
        $rescuePath = "{$skipDir}/customers_rescue_pk_{$timestamp}.csv";

        $stats = [
            'total'    => count($items),
            'imported' => 0,
            'skipped'  => 0,
            'bucket'   => ['rescue_pk' => 0, 'foreign' => 0, 'demo' => 0, 'other' => 0],
            'reason'   => [
                'empty_phone'       => 0,
                'not_pk_mobile'     => 0,
                'duplicate_in_json' => 0,   // duplicate of earlier row in same JSON
                'duplicate_in_db'   => 0,   // duplicate of row already in the DB
                'duplicate_email'   => 0,
                'phone_taken_by_user' => 0, // users.username / users.phone already hold this number
                'email_taken_by_user' => 0, // users.email already holds this email
                'import_error'      => 0,   // DB error on insert — row skipped, run continues
            ],
            'raw_formats' => ['03' => 0, '3' => 0, '92' => 0, '+92' => 0, '0092' => 0, 'other' => 0],
            'skip_path'    => $skipPath,
            'rescue_path'  => $rescuePath,
        ];

        $skipRows   = [];
        $rescueRows = [];
        $seenPhones = [];
        $seenEmails = [];
        $legacyMap  = [];

        // Read-only lookups — loaded in dry-run too so the dry-run report is accurate.
        $existingPhones = $this->existingCustomerPhones();

        $existingEmails = Customer::whereNotNull('email')
            ->pluck('id', 'email')
            ->mapWithKeys(fn ($id, $email) => [strtolower($email) => $id])
            ->all();

        [$userPhones, $userEmails] = $this->existingUserKeys();
        $existingUsernames = User::pluck('id', 'username')->all();

        $defaultGroupId = null;
        if (! $dryRun) {
            $defaultGroup = CustomerGroup::where('is_default', true)->first();
            if (! $defaultGroup) {
                $defaultGroup = CustomerGroup::create([
                    'name' => 'General',
                    'discount_percentage' => 0,
                    'is_default' => true,
                ]);
            }
            $defaultGroupId = $defaultGroup->id;
        }
        $cityMap = City::pluck('id', 'name')
            ->mapWithKeys(fn ($id, $name) => [strtolower(trim($name)) => $id])
            ->all();

        foreach ($items as $index => $item) {
            $legacyId     = (string) ($item['user_id'] ?? ($item['id'] ?? $index));
            $firstName    = trim((string) ($item['username'] ?? ($item['name']    ?? 'Customer')));
            $lastName     = trim((string) ($item['surname']  ?? '')) ?: null;
            $emailRaw     = trim((string) ($item['email']    ?? ''));
            $email        = ($emailRaw !== '' && filter_var($emailRaw, FILTER_VALIDATE_EMAIL))
                            ? strtolower($emailRaw) : null;
            $rawPhone     = trim((string) ($item['phone']    ?? ''));
            $city         = trim((string) ($item['city']     ?? ''));
            $country      = trim((string) ($item['country']  ?? ''));
            $lastLogin    = (string) ($item['last_login']    ?? '');
            $creationDate = (string) ($item['creation_date'] ?? '');
            $address1     = trim((string) ($item['address1'] ?? ($item['address'] ?? '')));

            if ($rawPhone !== '') {
                $stats['raw_formats'][$this->rawFormatBucket($rawPhone)]++;
            }

            // ── Empty phone ──────────────────────────────────────
            if ($rawPhone === '') {
                $stats['reason']['empty_phone']++;
                $stats['skipped']++;
                $skipRows[] = $this->skipRow(
                    $legacyId, $firstName, $lastName, $email, $rawPhone,
                    $city, $country, $lastLogin, $creationDate, $address1,
                    'empty_phone', 'other', ''
                );
                continue;
            }

            // ── Normalize phone ─────────────────────────────────
            $normalized = PhoneHelper::normalize($rawPhone);
            if ($normalized === null) {
                $stats['reason']['not_pk_mobile']++;
                $stats['skipped']++;
                $whyFailed = PhoneHelper::normalizeFailureReason($rawPhone);
                if ($whyFailed === 'empty_phone') {
                    $whyFailed = 'other';
                }
                $bucket = $this->classifyBucket($firstName, $email, $city, $country, $rawPhone);
                $stats['bucket'][$bucket]++;
                $skipRows[] = $this->skipRow(
                    $legacyId, $firstName, $lastName, $email, $rawPhone,
                    $city, $country, $lastLogin, $creationDate, $address1,
                    'not_pk_mobile', $bucket, $whyFailed
                );
                if ($bucket === 'rescue_pk') {
                    $rescueRows[] = [
                        $legacyId, $firstName, $lastName ?? '', $email ?? '', $rawPhone,
                        $city, $country, $lastLogin, $creationDate, $address1, $whyFailed,
                    ];
                }
                continue;
            }

            // ── Duplicate phone — split JSON vs DB ───────────────
            $inJson = isset($seenPhones[$normalized]);
            $inDb   = isset($existingPhones[$normalized]);

            if ($inJson || $inDb) {
                $reasonKey = $inJson ? 'duplicate_in_json' : 'duplicate_in_db';
                $stats['reason'][$reasonKey]++;
                $stats['skipped']++;
                $target = $seenPhones[$normalized] ?? $existingPhones[$normalized];
                $legacyMap[$legacyId] = is_numeric($target) ? (int) $target : $target;
                $skipRows[] = $this->skipRow(
                    $legacyId, $firstName, $lastName, $email, $rawPhone,
                    $city, $country, $lastLogin, $creationDate, $address1,
                    $reasonKey, 'other', ''
                );
                continue;
            }

            // ── Duplicate email ──────────────────────────────────
            if ($email !== null && (isset($seenEmails[$email]) || isset($existingEmails[$email]))) {
                $stats['reason']['duplicate_email']++;
                $stats['skipped']++;
                $target = $seenEmails[$email] ?? $existingEmails[$email];
                $legacyMap[$legacyId] = is_numeric($target) ? (int) $target : $target;
                $skipRows[] = $this->skipRow(
                    $legacyId, $firstName, $lastName, $email, $rawPhone,
                    $city, $country, $lastLogin, $creationDate, $address1,
                    'duplicate_email', 'other', ''
                );
                continue;
            }

            // ── Collision with users table (users.username/phone/email are UNIQUE) ──
            // A User can exist without a Customer (admin/staff, or half-created account).
            // Creating another User with the same key would throw and abort the run.
            $userHit = $userPhones[$normalized] ?? null;
            $reasonKey = 'phone_taken_by_user';
            if ($userHit === null && $email !== null && isset($userEmails[$email])) {
                $userHit   = $userEmails[$email];
                $reasonKey = 'email_taken_by_user';
            }
            if ($userHit !== null) {
                $stats['reason'][$reasonKey]++;
                $stats['skipped']++;
                if ($userHit['customer_id'] !== null) {
                    $legacyMap[$legacyId] = (int) $userHit['customer_id'];
                }
                $skipRows[] = $this->skipRow(
                    $legacyId, $firstName, $lastName, $email, $rawPhone,
                    $city, $country, $lastLogin, $creationDate, $address1,
                    $reasonKey, 'other', 'user_id=' . $userHit['user_id']
                );
                continue;
            }

            // ── Import ───────────────────────────────────────────
            if (! $dryRun) {
                try {
                    $customerId = $this->importOne(
                        $item, $normalized, $firstName, $lastName, $email,
                        $city, $country, $address1, $defaultGroupId, $cityMap, $existingUsernames
                    );
                } catch (\Throwable $e) {
                    // One bad row must not abort the whole import (and lose the ID map).
                    // importOne() runs in a transaction, so nothing partial is left behind.
                    Log::warning('Customer import row failed', [
                        'legacy_id' => $legacyId,
                        'phone'     => PhoneHelper::mask($normalized),
                        'error'     => $e->getMessage(),
                    ]);
                    $stats['reason']['import_error']++;
                    $stats['skipped']++;
                    $skipRows[] = $this->skipRow(
                        $legacyId, $firstName, $lastName, $email, $rawPhone,
                        $city, $country, $lastLogin, $creationDate, $address1,
                        'import_error', 'other', class_basename($e)
                    );
                    continue;
                }
                $seenPhones[$normalized] = $customerId;
                $legacyMap[$legacyId]    = $customerId;
                $userPhones[$normalized] = ['user_id' => null, 'customer_id' => $customerId];
                if ($email) {
                    $seenEmails[$email] = $customerId;
                }
            } else {
                $seenPhones[$normalized] = $legacyId;
                if ($email) {
                    $seenEmails[$email] = $legacyId;
                }
                $legacyMap[$legacyId] = $legacyId;
            }

            $stats['imported']++;
        }

        if (! $dryRun) {
            $this->writeCsv($skipPath, $skipRows, true);
            $this->writeRescueCsv($rescuePath, $rescueRows);
            file_put_contents(
                storage_path('app/legacy_customer_id_map.json'),
                json_encode($legacyMap, JSON_PRETTY_PRINT)
            );
        }

        $stats['rescue_samples'] = array_map(
            fn ($r) => PhoneHelper::mask($r[4] ?? ''),
            array_slice($rescueRows, 0, 10)
        );

        return $stats;
    }

    // ── Rescue row importer ───────────────────────────────────────

    public function importRescueRow(array $row): int
    {
        $phoneRaw = $row['phone'] ?? $row['raw_phone'] ?? '';
        $phone    = PhoneHelper::normalize($phoneRaw);
        if (! $phone) {
            throw new \InvalidArgumentException('Invalid phone in rescue row');
        }

        if (isset($this->existingCustomerPhones()[$phone])) {
            throw new \InvalidArgumentException('Duplicate phone: ' . PhoneHelper::mask($phone));
        }

        [$userPhones, $userEmails] = $this->existingUserKeys();
        $rescueEmail = ! empty($row['email']) ? strtolower(trim($row['email'])) : null;
        if (isset($userPhones[$phone])) {
            throw new \InvalidArgumentException('Phone already used by user #' . $userPhones[$phone]['user_id']);
        }
        if ($rescueEmail !== null && isset($userEmails[$rescueEmail])) {
            throw new \InvalidArgumentException('Email already used by user #' . $userEmails[$rescueEmail]['user_id']);
        }

        $defaultGroup = CustomerGroup::where('is_default', true)->first();
        if (! $defaultGroup) {
            $defaultGroup = CustomerGroup::create([
                'name' => 'General',
                'discount_percentage' => 0,
                'is_default' => true,
            ]);
        }
        $defaultGroupId    = $defaultGroup->id;
        $cityMap           = City::pluck('id', 'name')
            ->mapWithKeys(fn ($id, $name) => [strtolower(trim($name)) => $id])
            ->all();
        $existingUsernames = User::pluck('id', 'username')->all();

        return $this->importOne(
            [
                'address1' => $row['address1'] ?? '',
                'address2' => $row['address2'] ?? '',
                'city'     => $row['city']     ?? '',
                'country'  => $row['country']  ?? 'Pakistan',
            ],
            $phone,
            $row['name']    ?? 'Customer',
            $row['surname'] ?? null,
            ! empty($row['email']) ? strtolower($row['email']) : null,
            $row['city']    ?? '',
            $row['country'] ?? 'Pakistan',
            $row['address1'] ?? '',
            $defaultGroupId,
            $cityMap,
            $existingUsernames
        );
    }

    // ── Private: lookups ──────────────────────────────────────────

    /**
     * Existing customer phones keyed by CANONICAL (normalized) phone.
     * Older rows may be stored as +92…/03…/0092…; keying by raw value would
     * let those slip past duplicate detection.
     *
     * @return array<string,int> normalized phone => customer id
     */
    private function existingCustomerPhones(): array
    {
        $map = [];
        foreach (Customer::whereNotNull('phone')->pluck('phone', 'id') as $id => $phone) {
            $key = PhoneHelper::normalize($phone) ?? $phone;
            $map[$key] ??= $id;
        }

        return $map;
    }

    /**
     * Phones (from users.username + users.phone, normalized) and emails already
     * owned by a User — both columns are UNIQUE on users.
     *
     * @return array{0: array<string,array{user_id:int|null,customer_id:int|null}>, 1: array<string,array{user_id:int|null,customer_id:int|null}>}
     */
    private function existingUserKeys(): array
    {
        $customerByUser = Customer::whereNotNull('user_id')->pluck('id', 'user_id')->all();
        $phones = [];
        $emails = [];

        User::query()->select(['id', 'username', 'phone', 'email'])->orderBy('id')
            ->chunk(1000, function ($users) use (&$phones, &$emails, $customerByUser) {
                foreach ($users as $u) {
                    $hit = ['user_id' => $u->id, 'customer_id' => $customerByUser[$u->id] ?? null];
                    foreach ([$u->username, $u->phone] as $candidate) {
                        $n = PhoneHelper::normalize($candidate);
                        if ($n !== null) {
                            $phones[$n] ??= $hit;
                        }
                        if ($candidate !== null && $candidate !== '') {
                            $phones[$candidate] ??= $hit; // exact raw value is also unique-constrained
                        }
                    }
                    if ($u->email) {
                        $emails[strtolower($u->email)] ??= $hit;
                    }
                }
            });

        return [$phones, $emails];
    }

    // ── Private: single-row import ────────────────────────────────

    private function importOne(
        array $item,
        string $normalized,
        string $firstName,
        ?string $lastName,
        ?string $email,
        string $cityName,
        string $country,
        string $address1,
        ?int $defaultGroupId,
        array $cityMap,
        array &$existingUsernames
    ): int {
        return DB::transaction(function () use (
            $item, $normalized, $firstName, $lastName, $email,
            $cityName, $country, $address1, $defaultGroupId, $cityMap, &$existingUsernames
        ) {
            $fullName = trim($firstName . ' ' . ($lastName ?? ''));
            $cityId   = $cityMap[strtolower(trim($cityName))] ?? null;
            $address2 = trim((string) ($item['address2'] ?? '')) ?: null;

            $user = User::create([
                'name'                 => $fullName,
                'username'             => $normalized,
                'email'                => $email,
                'phone'                => $normalized,
                'password'             => Hash::make($normalized),
                'status'               => 1,
                'must_change_password' => true,
            ]);
            $user->assignRole('customer');
            $existingUsernames[$normalized] = $user->id;

            $customer = Customer::create([
                'user_id'           => $user->id,
                'customer_group_id' => $defaultGroupId,
                'first_name'        => $firstName,
                'last_name'         => $lastName,
                'email'             => $email,
                'phone'             => $normalized,
                'address'           => $address1 !== '' ? mb_substr($address1, 0, 255) : null,
                'address2'          => $address2 ? mb_substr($address2, 0, 255) : null,
                'city_id'           => $cityId,
                'country'           => $country !== '' ? $country : 'Pakistan',
                'status'            => 'active',
            ]);

            if (! $customer->wallet)       { $customer->wallet()->create(['balance' => 0]); }
            if (! $customer->loyaltyPoints) { $customer->loyaltyPoints()->create(['balance' => 0]); }

            return $customer->id;
        });
    }

    // ── Private: bucket classification ───────────────────────────

    /**
     * @param string      $rawPhone  The un-normalized raw phone string (used for test-number detection)
     */
    private function classifyBucket(
        string $name,
        ?string $email,
        string $city,
        string $country,
        string $rawPhone = ''
    ): string {
        if ($this->isDemo($name, $email))                              return 'demo';
        if ($this->isForeign($city, $country))                         return 'foreign';
        if ($this->isRescuePk($city, $country, $email, $name, $rawPhone)) return 'rescue_pk';
        return 'other';
    }

    private function isDemo(string $name, ?string $email): bool
    {
        if (preg_match('/^(demo|guest|customer|test|user)$/i', trim($name))) {
            return true;
        }
        if ($email) {
            foreach (self::JUNK_EMAIL_PATTERNS as $p) {
                if (str_contains(strtolower($email), $p)) {
                    return true;
                }
            }
        }
        return false;
    }

    private function isForeign(string $city, string $country): bool
    {
        $hay = strtolower($city . ' ' . $country);
        foreach (self::FOREIGN_MARKERS as $m) {
            if ($m !== '' && str_contains($hay, $m)) {
                return true;
            }
        }
        return false;
    }

    /**
     * A row is rescue_pk only when:
     * 1. Not demo (name or email).
     * 2. Country is Pakistan / PK / empty AND city is a known PK city,
     *    OR country explicitly contains "pakistan".
     * 3. Phone does NOT end with a known test-number suffix.
     * 4. Email (if present) is not from a junk domain.
     */
    private function isRescuePk(
        string $city,
        string $country,
        ?string $email,
        string $name,
        string $rawPhone = ''
    ): bool {
        if ($this->isDemo($name, $email)) {
            return false;
        }

        // Junk email domains that don't belong to real customers
        if ($email) {
            foreach (self::JUNK_EMAIL_PATTERNS as $p) {
                if (str_contains(strtolower($email), $p)) {
                    return false;
                }
            }
        }

        // Shared test-phone numbers (digits end with known test suffix)
        $digits = preg_replace('/\D/', '', $rawPhone);
        foreach (self::TEST_PHONE_DIGIT_SUFFIXES as $suffix) {
            if (strlen($digits) >= strlen($suffix) && str_ends_with($digits, $suffix)) {
                return false;
            }
        }

        $countryL = strtolower($country);
        $isPkCountry = str_contains($countryL, 'pakistan') || $countryL === 'pk';
        $isEmptyCountry = $countryL === '';

        // Require an explicit PK city when country is empty
        if ($isPkCountry || $isEmptyCountry) {
            $cityL = strtolower($city);
            if ($cityL !== '') {
                foreach (self::PK_CITIES as $c) {
                    if (str_contains($cityL, $c)) {
                        return $isPkCountry || $isEmptyCountry; // city matched
                    }
                }
            }
            // Country explicitly says Pakistan — accept even without a city match
            if ($isPkCountry) {
                return true;
            }
        }

        return false;
    }

    // ── Private: phone format detection ──────────────────────────

    private function rawFormatBucket(string $raw): string
    {
        $t = trim($raw);
        if (str_starts_with($t, '03'))   return '03';
        if (str_starts_with($t, '+92'))  return '+92';
        if (str_starts_with($t, '0092')) return '0092';
        $d = preg_replace('/\D/', '', $t);
        if (str_starts_with($d, '92'))   return '92';
        if (preg_match('/^3\d{9}$/', $d)) return '3';
        return 'other';
    }

    // ── Private: CSV building ─────────────────────────────────────

    private function skipRow(
        string $legacyId, string $name, ?string $surname, ?string $email,
        string $rawPhone, string $city, string $country,
        string $lastLogin, string $creationDate, string $address1,
        string $reason, string $bucket, string $whyFailed
    ): array {
        return [
            $legacyId, $name, $surname ?? '', $email ?? '',
            PhoneHelper::mask($rawPhone), $rawPhone,
            $city, $country, $lastLogin, $creationDate, $address1,
            $reason, $bucket, $whyFailed,
        ];
    }

    private function writeCsv(string $path, array $rows, bool $maskedPrimary): void
    {
        $fp = fopen($path, 'w');
        fputcsv($fp, [
            'legacy_id', 'name', 'surname', 'email',
            'raw_phone_masked', 'raw_phone',
            'city', 'country', 'last_login', 'creation_date', 'address1',
            'reason', 'bucket', 'why_failed',
        ]);
        foreach ($rows as $row) {
            fputcsv($fp, $row);
        }
        fclose($fp);
    }

    private function writeRescueCsv(string $path, array $rows): void
    {
        $fp = fopen($path, 'w');
        fputcsv($fp, [
            'legacy_id', 'name', 'surname', 'email', 'raw_phone',
            'city', 'country', 'last_login', 'creation_date', 'address1',
            'why_failed',
        ]);
        foreach ($rows as $row) {
            fputcsv($fp, $row);
        }
        fclose($fp);
    }
}
