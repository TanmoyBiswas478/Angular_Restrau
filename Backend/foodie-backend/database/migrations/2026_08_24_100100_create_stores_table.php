<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * 🏬 Stores / Branches table.
 *
 * Answering the user's design question: "how many stores does this restaurant have —
 * separate branch / store manager?"  The current app is SINGLE-STORE, so this table is
 * an OPTIONAL foundation. Ek default store seed karke employees.store_id ko isse link
 * kiya ja sakta hai jab multi-branch chahiye ho. Abhi ke liye Store Manager bina store_id
 * ke bhi poora kaam karta hai.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('stores')) {
            Schema::create('stores', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('code')->nullable();       // e.g. "MAIN", "BR-02"
                $table->string('address')->nullable();
                $table->string('phone')->nullable();
                $table->string('manager_eid')->nullable(); // Store Manager EID (soft link)
                $table->string('status')->default('Active');
                $table->timestamps();
            });

            // Seed a default single store so existing setups have a valid branch to point at.
            \Illuminate\Support\Facades\DB::table('stores')->insert([
                'name'       => 'Main Branch',
                'code'       => 'MAIN',
                'address'    => 'Head Office',
                'phone'      => null,
                'manager_eid'=> null,
                'status'     => 'Active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('stores');
    }
};
