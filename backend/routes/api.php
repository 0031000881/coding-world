<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\SubmissionController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

// Public auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (any authenticated user)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Tasks - index/show shared by both roles (scoped inside controller)
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::get('/tasks/{task}', [TaskController::class, 'show']);

    // Teacher-only task management
    Route::middleware('role:teacher')->group(function () {
        Route::post('/tasks', [TaskController::class, 'store']);
        Route::put('/tasks/{task}', [TaskController::class, 'update']);
        Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);
        Route::post('/tasks/{task}/assign', [TaskController::class, 'assign']);
        Route::delete('/tasks/{task}/students/{student}', [TaskController::class, 'unassign']);

        Route::get('/students', [StudentController::class, 'index']);
        Route::get('/students/{student}', [StudentController::class, 'show']);

        Route::post('/submissions/{submission}/grade', [SubmissionController::class, 'grade']);
    });

    // Student-only workspace + submissions
    Route::middleware('role:student')->group(function () {
        Route::get('/projects', [ProjectController::class, 'index']);
        Route::get('/tasks/{task}/project', [ProjectController::class, 'forTask']);
        Route::put('/projects/{project}', [ProjectController::class, 'update']);
        Route::post('/projects/{project}/submit', [SubmissionController::class, 'store']);
    });

    // Shared: view a single project / a single submission (authorized inside controller)
    Route::get('/projects/{project}', [ProjectController::class, 'show']);
    Route::get('/submissions', [SubmissionController::class, 'index']);
    Route::get('/submissions/{submission}', [SubmissionController::class, 'show']);
});
