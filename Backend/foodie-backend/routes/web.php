use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Tumhare baaki ke web routes yahan honge (agar koi hain toh)

// Sabse last mein yeh catch-all route daalo
Route::get('/{any?}', function () {
    return File::get(public_path('index.html'));
})->where('any', '.*');