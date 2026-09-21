<?php

namespace App\Services;

use App\Helpers\PhoneHelper;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CustomerIdentityService
{
    public function findCustomerByPhone(string $normalizedPhone): ?Customer
    {
        return Customer::where('phone', $normalizedPhone)->first();
    }

    public function findUserByUsername(string $normalizedPhone): ?User
    {
        return User::where('username', $normalizedPhone)->first();
    }

    /**
     * Find or create User + Customer for a PK phone. Phone is always stored on both username and customer.phone.
     *
     * @return array{0: User, 1: Customer, 2: bool} user, customer, wasCreated
     */
    public function findOrCreateByPhone(string $normalizedPhone, array $profile): array
    {
        $wasCreated = false;
        $customer = $this->findCustomerByPhone($normalizedPhone);

        if ($customer && $customer->user) {
            return [$customer->user, $customer, false];
        }

        $user = $this->findUserByUsername($normalizedPhone);

        if (! $user) {
            $user = User::create([
                'name'                 => trim(($profile['first_name'] ?? 'Customer') . ' ' . ($profile['last_name'] ?? '')),
                'username'             => $normalizedPhone,
                'email'                => $profile['email'] ?? null,
                'phone'                => $normalizedPhone,
                'password'             => Hash::make($normalizedPhone),
                'status'               => 1,
                'must_change_password' => true,
            ]);
            $user->assignRole('customer');
            $wasCreated = true;
        }

        if ($customer) {
            if ($customer->user_id === null) {
                $customer->update(['user_id' => $user->id]);
            }

            return [$user, $customer->fresh(), $wasCreated];
        }

        $customer = Customer::where('user_id', $user->id)->first();
        if ($customer) {
            return [$user, $customer, $wasCreated];
        }

        try {
            $customer = Customer::create([
                'user_id'    => $user->id,
                'first_name' => $profile['first_name'] ?? $user->name,
                'last_name'  => $profile['last_name'] ?? null,
                'phone'      => $normalizedPhone,
                'email'      => $profile['email'] ?? null,
                'address'    => $profile['address'] ?? null,
                'address2'   => $profile['address2'] ?? null,
                'city_id'    => $profile['city_id'] ?? null,
                'status'     => $profile['status'] ?? 'active',
            ]);
            if (! $customer->wallet) {
                $customer->wallet()->create(['balance' => 0]);
            }
            if (! $customer->loyaltyPoints) {
                $customer->loyaltyPoints()->create(['balance' => 0]);
            }
        } catch (UniqueConstraintViolationException) {
            $customer = Customer::where('phone', $normalizedPhone)->firstOrFail();
        }

        return [$user, $customer, $wasCreated];
    }

    public function buildOrderSnapshots(Customer $customer, ?string $shippingAddress = null): array
    {
        return [
            'customer_name'  => trim($customer->first_name . ' ' . ($customer->last_name ?? '')),
            'customer_phone' => $customer->phone,
            'customer_email' => $customer->email,
            'shipping_address' => $shippingAddress ?? $customer->address,
        ];
    }

    public static function uniqueUsernameForStaff(string $base): string
    {
        $candidate = Str::slug($base) ?: 'user';
        $original = $candidate;
        $i = 0;
        while (User::where('username', $candidate)->exists()) {
            $candidate = $original . '-' . (++$i);
        }

        return $candidate;
    }
}
