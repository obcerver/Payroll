<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

Route::group([
    'middleware' => 'api',
    'prefix' => 'auth'
], function ($router) {
    Route::post('login', [AuthController::class, 'login']);
});

Route::group(['middleware' => 'auth:api'], function () {
    Route::group(['prefix' => 'auth'], function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::post('me', [AuthController::class, 'me']);
    });

    Route::apiResource('departments', \App\Http\Controllers\Api\DepartmentController::class);
    Route::apiResource('employees', \App\Http\Controllers\Api\EmployeeController::class);

    // Payroll Routes
    Route::get('payroll', [\App\Http\Controllers\Api\PayrollRecordController::class, 'index']);
    Route::post('payroll/run', [\App\Http\Controllers\Api\PayrollRecordController::class, 'runPayroll']);
    Route::get('payroll/export-csv', [\App\Http\Controllers\Api\PayrollRecordController::class, 'exportCsv']);
    Route::get('payroll/stats', [\App\Http\Controllers\Api\PayrollRecordController::class, 'getStats']);
    Route::get('payroll/{id}', [\App\Http\Controllers\Api\PayrollRecordController::class, 'show']);
    Route::get('payroll/{id}/pdf', [\App\Http\Controllers\Api\PayrollRecordController::class, 'exportPdf']);
});
