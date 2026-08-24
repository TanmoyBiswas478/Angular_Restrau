<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\Employee;
use App\Models\Inventory;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;
use Exception;

/**
 * 🏪 STORE MANAGER PORTAL
 *
 * Store Manager teen cheezein manage karta hai:
 *   1. Inventory  -> existing /api/inventory endpoints reuse hote hain (frontend se)
 *   2. Staff      -> existing /api/employees endpoints reuse hote hain (frontend se)
 *   3. Sales/Ops summary -> yahan ka summary() endpoint
 *
 * Plus optional multi-branch foundation: stores() / createStore().
 * NOTE: App abhi single-store hai; ye branch layer optional hai.
 */
class StoreManagerController extends Controller
{
    // 📊 One-shot dashboard summary for the Store Manager
    public function summary()
    {
        try {
            $today = Carbon::today();

            // Sales (deliverys table = orders)
            $totalRevenue  = (float) (Delivery::sum('total') ?? 0);
            $todaysRevenue = (float) (Delivery::whereDate('created_at', $today)->sum('total') ?? 0);
            $totalOrders   = (int) Delivery::count();
            $todaysOrders  = (int) Delivery::whereDate('created_at', $today)->count();

            // Operations
            $pendingDeliveries = (int) Delivery::whereIn('status', ['Preparing', 'Pending', 'Out for Delivery'])->count();
            $deliveredToday    = (int) Delivery::whereDate('created_at', $today)->where('status', 'Delivered')->count();

            // Staff
            $totalStaff  = (int) Employee::count();
            $activeStaff = (int) Employee::where('status', 'Active')->count();

            // Inventory health
            $totalInventory = (int) Inventory::count();
            $lowStockItems  = (int) Inventory::whereColumn('quantity', '<=', 'min_stock_level')->count();
            $outOfStock     = (int) Inventory::where('quantity', '<=', 0)->count();

            // Recent orders (latest 8)
            $recentOrders = Delivery::latest()->take(8)->get()->map(function ($o) {
                return [
                    'id'       => $o->order_number ?? ('ORD-' . $o->id),
                    'customer' => $o->customer_name ?? 'Customer',
                    'amount'   => (float) ($o->total ?? 0),
                    'status'   => ucfirst($o->status ?? 'Pending'),
                    'date'     => $o->created_at ? $o->created_at->format('Y-m-d H:i') : date('Y-m-d'),
                ];
            });

            // Items that need attention (lowest stock first)
            $lowStockList = Inventory::orderBy('quantity', 'asc')->take(6)->get()->map(function ($i) {
                return [
                    'id'          => $i->id,
                    'item_name'   => $i->item_name,
                    'quantity'    => (int) $i->quantity,
                    'unit'        => $i->unit,
                    'min_level'   => (int) $i->min_stock_level,
                    'status'      => $i->quantity <= 0
                        ? 'Out of Stock'
                        : ($i->quantity <= $i->min_stock_level ? 'Low Stock' : 'In Stock'),
                ];
            });

            return response()->json([
                'sales' => [
                    'totalRevenue'  => $totalRevenue,
                    'todaysRevenue' => $todaysRevenue,
                    'totalOrders'   => $totalOrders,
                    'todaysOrders'  => $todaysOrders,
                ],
                'operations' => [
                    'pendingDeliveries' => $pendingDeliveries,
                    'deliveredToday'    => $deliveredToday,
                ],
                'staff' => [
                    'total'  => $totalStaff,
                    'active' => $activeStaff,
                ],
                'inventory' => [
                    'total'      => $totalInventory,
                    'lowStock'   => $lowStockItems,
                    'outOfStock' => $outOfStock,
                ],
                'recentOrders' => $recentOrders,
                'lowStockList' => $lowStockList,
            ], 200);

        } catch (Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    // 🏬 List all stores/branches
    public function stores()
    {
        try {
            return response()->json(Store::orderBy('id', 'asc')->get(), 200);
        } catch (Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    // 🏬 Create a new store/branch (optional multi-branch support)
    public function createStore(Request $request)
    {
        try {
            $validated = $request->validate([
                'name'        => 'required|string|max:255',
                'code'        => 'nullable|string|max:50',
                'address'     => 'nullable|string|max:255',
                'phone'       => 'nullable|string|max:50',
                'manager_eid' => 'nullable|string|max:50',
                'status'      => 'nullable|string|max:50',
            ]);

            $validated['status'] = $validated['status'] ?? 'Active';
            $store = Store::create($validated);

            return response()->json([
                'message' => 'Store created successfully.',
                'store'   => $store,
            ], 201);

        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation Error', 'errors' => $e->errors()], 422);
        } catch (Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
}
