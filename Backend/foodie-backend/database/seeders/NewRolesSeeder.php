<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\User;
use App\Models\Store;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * 🌱 Demo accounts for the 3 new roles.
 *
 * Run:  php artisan db:seed --class=NewRolesSeeder
 *
 * Har role ke liye ek Employee + ek matching User (login ke liye) banata hai.
 * Default password sab ke liye: 1234   (EmployeeController convention jaisa)
 * updateOrCreate use kiya hai, isliye dobara run karne par duplicate nahi banega.
 *
 * Login credentials:
 *   Delivery Executive -> delivery@foodie.test  / 1234
 *   Store Manager      -> manager@foodie.test   / 1234
 *   Kitchen Assistant  -> kitchen@foodie.test   / 1234
 */
class NewRolesSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure at least one store/branch exists
        $store = Store::updateOrCreate(
            ['code' => 'MAIN'],
            [
                'name'    => 'Main Branch',
                'address' => 'Head Office',
                'status'  => 'Active',
            ]
        );

        $staff = [
            [
                'eid'   => 'EID201',
                'name'  => 'Ravi Kumar',
                'role'  => 'Delivery Executive',
                'email' => 'delivery@foodie.test',
                'phone' => '9000000201',
            ],
            [
                'eid'   => 'EID202',
                'name'  => 'Sunita Rao',
                'role'  => 'Store Manager',
                'email' => 'manager@foodie.test',
                'phone' => '9000000202',
            ],
            [
                'eid'   => 'EID203',
                'name'  => 'Amit Das',
                'role'  => 'Kitchen Assistant',
                'email' => 'kitchen@foodie.test',
                'phone' => '9000000203',
            ],
        ];

        foreach ($staff as $s) {
            Employee::updateOrCreate(
                ['email' => $s['email']],
                [
                    'eid'          => $s['eid'],
                    'name'         => $s['name'],
                    'role'         => $s['role'],
                    'phone'        => $s['phone'],
                    'status'       => 'Active',
                    'availability' => $s['role'] === 'Delivery Executive' ? 'Offline' : 'Online',
                    'store_id'     => $store->id,
                ]
            );

            User::updateOrCreate(
                ['email' => $s['email']],
                [
                    'eid'      => $s['eid'],
                    'name'     => $s['name'],
                    'role'     => $s['role'],
                    'password' => Hash::make('1234'),
                ]
            );
        }

        // Link the Store Manager as this branch's manager
        $store->update(['manager_eid' => 'EID202']);

        $this->command?->info('✅ NewRolesSeeder: delivery@ / manager@ / kitchen@foodie.test created (password: 1234)');
    }
}
