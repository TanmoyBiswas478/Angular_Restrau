<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Exception;

/**
 * 🚚 DELIVERY EXECUTIVE (Delivery Partner) PORTAL
 *
 * Ye controller delivery partner ke portal ko power karta hai:
 *   - available()          : unassigned orders jo koi bhi partner accept kar sakta hai
 *   - assigned($eid)       : is partner ko assigned deliveries
 *   - accept($id)          : ek order khud ke naam (EID) par le lena
 *   - updateStatus($id)    : Out for Delivery / Delivered mark karna
 *   - toggleAvailability   : Online/Offline hona (employees.availability)
 *   - me($eid)             : partner ka apna availability + summary
 *
 * Assignment `driver_eid` par based hai (reliable), driver_name sirf display ke liye.
 */
class DeliveryPartnerController extends Controller
{
    // 1️⃣ Available (unassigned) deliveries — koi bhi online partner utha sakta hai
    public function available()
    {
        try {
            $orders = Delivery::where(function ($q) {
                    $q->whereNull('driver_eid')->orWhere('driver_eid', '');
                })
                ->whereNotIn('status', ['Delivered', 'Cancelled'])
                ->orderBy('id', 'asc')
                ->get();

            return response()->json($orders, 200);
        } catch (Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    // 2️⃣ Deliveries assigned to a specific partner (by EID)
    public function assigned(string $eid)
    {
        try {
            $orders = Delivery::where('driver_eid', $eid)
                ->orderBy('id', 'desc')
                ->get();

            return response()->json($orders, 200);
        } catch (Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    // 3️⃣ Accept / self-assign an available order
    public function accept(Request $request, int $id)
    {
        try {
            $validated = $request->validate([
                'driver_eid'   => 'required|string',
                'driver_name'  => 'nullable|string',
                'driver_phone' => 'nullable|string',
            ]);

            $delivery = Delivery::find($id);
            if (!$delivery) {
                return response()->json(['message' => 'Delivery not found'], 404);
            }

            // Guard: already kisi aur partner ke paas assigned toh dobara accept mat hone do
            if (!empty($delivery->driver_eid) && $delivery->driver_eid !== $validated['driver_eid']) {
                return response()->json([
                    'message' => 'This order is already assigned to another delivery partner.'
                ], 409);
            }

            $delivery->driver_eid   = $validated['driver_eid'];
            $delivery->driver_name  = $validated['driver_name'] ?? $delivery->driver_name ?? 'Assigned';
            $delivery->driver_phone = $validated['driver_phone'] ?? $delivery->driver_phone;

            // Preparing hai toh accept hote hi Out for Delivery par le jao
            if (in_array($delivery->status, ['Preparing', 'Pending', null])) {
                $delivery->status = 'Out for Delivery';
            }

            $delivery->save();

            return response()->json([
                'message'  => 'Delivery accepted successfully.',
                'delivery' => $delivery,
            ], 200);

        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation Error', 'errors' => $e->errors()], 422);
        } catch (Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    // 4️⃣ Update delivery status (Out for Delivery / Delivered)
    public function updateStatus(Request $request, int $id)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|string',
            ]);

            $delivery = Delivery::find($id);
            if (!$delivery) {
                return response()->json(['message' => 'Delivery not found'], 404);
            }

            $delivery->status = $validated['status'];
            $delivery->save();

            return response()->json([
                'message'  => 'Status updated successfully.',
                'delivery' => $delivery,
            ], 200);

        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation Error', 'errors' => $e->errors()], 422);
        } catch (Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    // 5️⃣ Toggle Online/Offline availability for a partner
    public function toggleAvailability(Request $request, string $eid)
    {
        try {
            $validated = $request->validate([
                'availability' => 'required|string|in:Online,Offline',
            ]);

            $employee = Employee::where('eid', $eid)->first();
            if (!$employee) {
                return response()->json(['message' => 'Delivery partner not found'], 404);
            }

            $employee->availability = $validated['availability'];
            $employee->save();

            return response()->json([
                'message'      => 'Availability updated.',
                'availability' => $employee->availability,
                'employee'     => $employee,
            ], 200);

        } catch (ValidationException $e) {
            return response()->json(['message' => 'Validation Error', 'errors' => $e->errors()], 422);
        } catch (Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    // 6️⃣ Partner self summary (availability + delivery counts)
    public function me(string $eid)
    {
        try {
            $employee = Employee::where('eid', $eid)->first();

            $assignedCount  = Delivery::where('driver_eid', $eid)->count();
            $deliveredCount = Delivery::where('driver_eid', $eid)->where('status', 'Delivered')->count();
            $activeCount    = Delivery::where('driver_eid', $eid)
                ->whereNotIn('status', ['Delivered', 'Cancelled'])->count();

            return response()->json([
                'eid'          => $eid,
                'name'         => $employee->name ?? 'Delivery Partner',
                'availability' => $employee->availability ?? 'Offline',
                'stats'        => [
                    'assigned'  => $assignedCount,
                    'active'    => $activeCount,
                    'delivered' => $deliveredCount,
                ],
            ], 200);

        } catch (Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
}
