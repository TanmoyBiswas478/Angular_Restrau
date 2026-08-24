<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kitchenstock;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Exception;

/**
 * 🧑‍🍳 KITCHEN ASSISTANT PORTAL
 *
 * Kitchen Assistant, Chef se ALAG professional hai but wahi kitchen stock (kitchenstocks
 * table) par kaam karta hai. Uske sirf 3 kaam hain:
 *   - index()          : kitchen stock dekhna
 *   - deduct($id)       : use hui stock ghatana (quantity minus)
 *   - requestRestock()  : admin ko restock request bhejna (request_to_admin = 'Pending')
 *
 * Add/create nahi kar sakta (wo Chef/Admin ka kaam hai) — isliye alag controller.
 * Status recompute logic Chef dashboard jaisa hi rakha gaya hai (consistency ke liye).
 */
class KitchenAssistantController extends Controller
{
    // 1️⃣ View all kitchen stock
    public function index()
    {
        try {
            $stocks = Kitchenstock::orderBy('id', 'asc')->get();
            return response()->json($stocks, 200);
        } catch (Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    // 2️⃣ Deduct used stock
    public function deduct(Request $request, int $id)
    {
        try {
            $validated = $request->validate([
                'quantity' => 'required|integer|min:1', // kitni quantity use hui
                'eid'      => 'nullable|string',
                'user'     => 'nullable|string',
            ]);

            $stock = Kitchenstock::find($id);
            if (!$stock) {
                return response()->json(['message' => 'Kitchen stock item not found'], 404);
            }

            $deduct = (int) $validated['quantity'];
            if ($deduct > (int) $stock->quantity) {
                return response()->json([
                    'message' => "Cannot deduct {$deduct} {$stock->unit}. Only {$stock->quantity} {$stock->unit} available."
                ], 422);
            }

            $newQty = (int) $stock->quantity - $deduct;
            $stock->quantity = $newQty;
            $stock->status = $newQty <= 0
                ? 'Out of Stock'
                : ($newQty <= (int) $stock->minimum_stock_alert ? 'Low Stock' : 'In Stock');

            if (!empty($validated['eid']))  $stock->eid = $validated['eid'];
            if (!empty($validated['user'])) $stock->user = $validated['user'];

            $stock->save();

            return response()->json([
                'message'      => 'Stock deducted successfully.',
                'kitchenstock' => $stock,
            ], 200);

        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation Error', 'errors' => $e->errors()], 422);
        } catch (Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    // 3️⃣ Send restock request to Admin
    public function requestRestock(Request $request, int $id)
    {
        try {
            $validated = $request->validate([
                'request_item' => 'required|numeric|min:1',
                'eid'          => 'nullable|string',
                'user'         => 'nullable|string',
            ]);

            $stock = Kitchenstock::find($id);
            if (!$stock) {
                return response()->json(['message' => 'Kitchen stock item not found'], 404);
            }

            $stock->request_item     = $validated['request_item'];
            $stock->request_to_admin = 'Pending';
            $stock->status           = 'Already Requested'; // Chef flow ke saath consistent

            if (!empty($validated['eid']))  $stock->eid = $validated['eid'];
            if (!empty($validated['user'])) $stock->user = $validated['user'];

            $stock->save();

            return response()->json([
                'message'      => 'Restock request sent to admin.',
                'kitchenstock' => $stock,
            ], 200);

        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation Error', 'errors' => $e->errors()], 422);
        } catch (Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
}
