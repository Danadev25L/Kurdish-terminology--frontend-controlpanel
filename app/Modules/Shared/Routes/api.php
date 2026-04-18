<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Shared\Controllers\ApiController;
use App\Modules\Shared\Controllers\HealthController;

Route::prefix('v1')->group(function () {
    Route::prefix('api')->group(function () {
        Route::get('/openapi', [ApiController::class, 'openApi']);
        Route::get('/docs', [ApiController::class, 'documentation']);
    });
    Route::get('/health', [HealthController::class, 'index']);
    Route::get('/health/detailed', [HealthController::class, 'detailed']);
});
