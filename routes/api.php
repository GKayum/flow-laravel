<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    Route::get('/users/search', [SearchController::class, 'users']);

    Route::prefix('/user')->group(function () {
        Route::get('/profile', [UserController::class, 'profile']);
        Route::post('/update', [UserController::class, 'update']);
    });
});
