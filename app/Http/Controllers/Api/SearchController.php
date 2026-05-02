<?php

namespace App\Http\Controllers\Api;

use App\Helpers\Search;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function users(Request $request) {
        $search = Search::normalize($request->input('q', ''));
        
        $users = User::query()
            ->whereNot('id', $request->user()->id)
            ->where(function ($query) use ($search) {
            $query->where('name', 'like', "%$search%")
                    ->orWhere('email', 'like', "%$search%");
        })->get();

        return response()->json(UserResource::collection($users));
    }
}
