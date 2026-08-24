<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * 🆕 Safe additive migration for the 3 new roles:
 *    - Delivery Executive  -> needs employees.availability (Online/Offline) + deliverys.driver_eid
 *    - Store Manager       -> needs employees.store_id (branch foundation)
 *    - Kitchen Assistant   -> reuses existing kitchenstocks table (no new column)
 *
 * Har column ko Schema::hasColumn se guard kiya gaya hai, isliye ye migration
 * existing data ko touch nahi karta aur multiple baar run karne par bhi safe hai.
 */
return new class extends Migration
{
    public function up(): void
    {
        // 1. EMPLOYEES TABLE — availability toggle + optional store/branch link
        Schema::table('employees', function (Blueprint $table) {
            if (!Schema::hasColumn('employees', 'availability')) {
                // Delivery Executive Online/Offline status. Baaki roles ke liye harmless default.
                $table->string('availability')->default('Offline')->after('status');
            }
            if (!Schema::hasColumn('employees', 'store_id')) {
                // Store Manager branch foundation (nullable = single-store setups unaffected).
                $table->unsignedBigInteger('store_id')->nullable()->after('availability');
            }
        });

        // 2. DELIVERYS TABLE — reliable partner assignment via EID (driver_name string ke bharose nahi)
        Schema::table('deliverys', function (Blueprint $table) {
            if (!Schema::hasColumn('deliverys', 'driver_eid')) {
                $table->string('driver_eid')->nullable()->after('driver_phone');
            }
            // Defensive: agar fresh migrate bina SQL dump ke chale, customer_id bhi ensure kar do.
            if (!Schema::hasColumn('deliverys', 'customer_id')) {
                $table->string('customer_id')->nullable()->after('id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            if (Schema::hasColumn('employees', 'store_id')) {
                $table->dropColumn('store_id');
            }
            if (Schema::hasColumn('employees', 'availability')) {
                $table->dropColumn('availability');
            }
        });

        Schema::table('deliverys', function (Blueprint $table) {
            if (Schema::hasColumn('deliverys', 'driver_eid')) {
                $table->dropColumn('driver_eid');
            }
        });
    }
};
