<?php

namespace App\Actions\Fortify;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'password' => $this->passwordRules(),
        ])->validate();

        return DB::transaction(function () use ($input) {
            $user = User::create([
                'name'     => $input['name'],
                'email'    => $input['email'],
                'password' => $input['password'],
            ]);

            // Assign customer role so the account has correct permissions
            $user->assignRole('customer');

            // Create customer profile — required for orders, wallet, and loyalty points
            $customer = Customer::create([
                'user_id'    => $user->id,
                'first_name' => $input['name'],
                'email'      => $input['email'],
                'status'     => 'active',
            ]);

            // Initialize wallet and loyalty points (same pattern as CustomerRepository::store)
            $customer->wallet()->create(['balance' => 0]);
            $customer->loyaltyPoints()->create(['balance' => 0]);

            return $user;
        });
    }
}
