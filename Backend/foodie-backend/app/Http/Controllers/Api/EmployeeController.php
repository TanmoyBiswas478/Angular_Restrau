<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Hash;
use Exception;
use App\Models\Employee;
use  App\Models\User;

class EmployeeController extends Controller
{
    // 1. GET ALL EMPLOYEES
    public function index()
    {
        try {
            $employees = Employee::orderBy('id', 'desc')->get();
            return response()->json($employees, 200);
        } catch (Exception $e) {
            return response()->json(['message' => 'Error fetching data', 'error' => $e->getMessage()], 500);
        }
    }

    // 2. CREATE NEW EMPLOYEE
    public function store(Request $request)
    {
        try {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'role'       => 'required|string|max:255',
            'email'      => 'required|email|unique:employees,email|unique:users,email',
            'phone'      => 'required|string|max:50',
            'avatar_url' => 'nullable|string',
            'status'     => 'required|string|in:Active,On Leave,Resigned,Suspended',
        ]);

        // Generate EID
        $lastEmployee = Employee::latest('id')->first();

        if ($lastEmployee) {
            $number = (int) str_replace('EID', '', $lastEmployee->eid);
            $validated['eid'] = 'EID' . ($number + 1);
        } else {
            $validated['eid'] = 'EID1';
        }

        // Create Employee
        $employee = Employee::create($validated);

        // Create User
        $user = User::create([
            'eid'      => $validated['eid'],
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'role'    => $validated['role'],
            'password' => Hash::make('1234'),
        ]);

        return response()->json([
            'message'  => 'Employee created successfully.',
            'employee' => $employee,
            'user'     => $user,
        ], 201);

    } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors'  => $e->errors()
            ], 422);

        } catch (Exception $e) {
            return response()->json([
                'message' => 'Server Error: ' . $e->getMessage()
            ], 500);
        }
    }

    // 3. UPDATE EMPLOYEE DETAILS OR STATUS
    public function update(Request $request, int $id)
    {
        try {
            $employee = Employee::find($id);

            if (!$employee) {
                return response()->json(['message' => 'Employee not found'], 404);
            }

            $validated = $request->validate([
                'name'       => 'sometimes|required|string|max:255',
                'role'       => 'sometimes|required|string|max:255',
                'email'      => 'sometimes|required|email|unique:employees,email,'.$id,
                'phone'      => 'sometimes|required|string|max:50',
                'avatar_url' => 'nullable|string',
                'status'     => 'sometimes|required|string|in:Active,On Leave,Resigned,Suspended',
            ]);

            $employee->update($validated);
            return response()->json($employee, 200);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors'  => $e->errors()
            ], 422);

        } catch (Exception $e) {
            return response()->json([
                'message' => 'Server Error: ' . $e->getMessage()
            ], 500);
        }
    }

    // 4. DELETE EMPLOYEE
    public function destroy(int $id)
    {
        try {
            $employee = Employee::find($id);

            if (!$employee) {
                return response()->json(['message' => 'Employee not found'], 404);
            }

            $employee->delete();
            return response()->json(['message' => 'Staff deleted successfully'], 200);

        } catch (Exception $e) {
            return response()->json([
                'message' => 'Server Error: ' . $e->getMessage()
            ], 500);
        }
    }

    
    // 5. SHOW EMPLOYEE PROFILE (By id or eid)
    public function show($id)
    {
        try {
            $employee = Employee::where('id', $id)->orWhere('eid', $id)->first();
            
            if (!$employee) {
                return response()->json(['message' => 'Employee not found'], 404);
            }

            // 🔍 Smart Avatar Logic: Check if avatar_url is already a full URL (Google/FB link) or local path
            $rawAvatar = $employee->avatar_url;
            $resolvedAvatar = null;

            if ($rawAvatar) {
                if (preg_match('/^https?:\/\//i', $rawAvatar)) {
                    // Agar pehle se http/https link hai (External URL), toh as-is bhejo
                    $resolvedAvatar = $rawAvatar;
                } else {
                    // Agar local file path hai, toh storage link generate karo
                    $resolvedAvatar = asset('storage/' . ltrim($rawAvatar, '/'));
                }
            }

            return response()->json([
                'id' => $employee->id,
                'customer_id' => $employee->eid, 
                'name' => $employee->name,
                'email' => $employee->email,
                'phone' => $employee->phone,
                'address' => $employee->address ?? '',
                'membership' => 'Staff Member', 
                'avatar_url' => $resolvedAvatar, // 👈 Ab yeh 100% sahi URL bhejega
                'role' => $employee->role
            ], 200);
        } catch (Exception $e) {
            return response()->json(['message' => 'Server Error: ' . $e->getMessage()], 500);
        }
    }
    // 6. UPLOAD EMPLOYEE AVATAR PHOTO
    public function uploadAvatar(Request $request, $id)
    {
        try {
            $request->validate([
                'avatar' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
            ]);

            $employee = Employee::where('id', $id)->orWhere('eid', $id)->first();
            if (!$employee) {
                return response()->json(['message' => 'Employee not found'], 404);
            }

            // Local folder mein store karein
            $path = $request->file('avatar')->store('employees', 'public');
            
            // Database ke avatar_url field ko update kar rahe hain
            $employee->avatar_url = $path;
            $employee->save();

            return response()->json([
                'success' => true,
                'message' => 'Employee photo updated successfully.',
                'avatar_url' => asset('storage/' . $path)
            ], 200);
        } catch (Exception $e) {
            return response()->json(['message' => 'Server Error: ' . $e->getMessage()], 500);
        }
    }

    // 7. CHANGE EMPLOYEE PASSWORD
    public function changePassword(Request $request, $id)
    {
        try {
            $employee = Employee::where('id', $id)->orWhere('eid', $id)->first();
            if (!$employee) {
                return response()->json(['message' => 'Employee not found'], 404);
            }

            // User table mein bhi password update karne ke liye
            $user = User::where('eid', $employee->eid)->orWhere('email', $employee->email)->first();

            if ($request->has('current_password')) {
                if ($user && !Hash::check($request->current_password, $user->password)) {
                    return response()->json(['message' => 'Current password does not match'], 400);
                }
            }

            $newHash = Hash::make($request->new_password);
            
            if ($user) {
                $user->update(['password' => $newHash]);
            }

            return response()->json(['message' => 'Password changed successfully'], 200);
        } catch (Exception $e) {
            return response()->json(['message' => 'Server Error: ' . $e->getMessage()], 500);
        }
    }
}