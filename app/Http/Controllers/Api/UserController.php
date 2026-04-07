<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function profile(Request $request) {
        return response()->json($request->user());
    }

    // public function profile(Request $request) {
    //     return response()->json(
    //         new UserResource($request->user())
    //     );
    // }
}
