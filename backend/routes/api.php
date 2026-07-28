<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\{
    DashboardController,
    EmployeeController,
    LeaveController as AdminLeaveController,
    RetardAuthorizationController as AdminRetardAuthorizationController,
    CompanySettingController,
    AttendanceController as AdminAttendanceController,
    UserController,
    ActivityLogController,
    StatisticsController,
    DocumentController as AdminDocumentController,
    UnjustifiedAbsenceController as AdminUnjustifiedAbsenceController,
    HolidayController as AdminHolidayController,
    AssistanceController as AdminAssistanceController,
    AdminNotificationController,
};
use App\Http\Controllers\Employee\{
    AttendanceController,
    LeaveRequestController,
    RetardAuthorizationController,
    DashboardController as EmployeeDashboardController,
    DocumentController as EmployeeDocumentController,
    NotificationController,
    AssistanceController as EmployeeAssistanceController,
    UnjustifiedAbsenceController as EmployeeUnjustifiedAbsenceController,
};

// Authentification publique
Route::post('/login', [LoginController::class, 'login'])->middleware('throttle:10,1');

// Routes protégées par token Sanctum
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [LoginController::class, 'me']);
    Route::post('/logout', [LoginController::class, 'logout']);
    Route::post('/user/avatar', [ProfileController::class, 'updateAvatar']);

    // Jours fériés (accessibles aux deux rôles)
    Route::get('/holidays', [AdminHolidayController::class, 'index']);

    // ===================== ADMIN =====================
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::get('/company-settings', [CompanySettingController::class, 'show']);
        Route::put('/company-settings', [CompanySettingController::class, 'update']);
        Route::apiResource('employees', EmployeeController::class);
        Route::patch('/employees/{user}/password', [EmployeeController::class, 'updatePassword']);
        Route::apiResource('leaves', AdminLeaveController::class)->only(['index', 'update']);
        Route::apiResource('retard-authorizations', AdminRetardAuthorizationController::class)->only(['index', 'update']);
        Route::get('/attendances', [AdminAttendanceController::class, 'index']);
        Route::apiResource('documents', AdminDocumentController::class);
        Route::apiResource('unjustified-absences', AdminUnjustifiedAbsenceController::class)->only(['index', 'show']);
        Route::apiResource('holidays', AdminHolidayController::class)->except(['edit', 'update']);
        Route::apiResource('users', UserController::class)->only(['index', 'store', 'destroy']);
        Route::get('/logs', [ActivityLogController::class, 'index']);
        Route::get('/statistics/monthly-late', [StatisticsController::class, 'monthlyLate']);
        Route::get('/statistics/top-late', [StatisticsController::class, 'topLate']);
        Route::get('/assistance-requests', [AdminAssistanceController::class, 'index']);
        Route::patch('/assistance-requests/{assistanceRequest}/respond', [AdminAssistanceController::class, 'respond']);
        Route::get('/notifications', [AdminNotificationController::class, 'index']);
        Route::post('/notifications/read', [AdminNotificationController::class, 'markAsRead']);
    });

    // ===================== EMPLOYÉ =====================
    Route::middleware('role:employee')->prefix('employee')->group(function () {
        Route::get('/dashboard', [EmployeeDashboardController::class, 'index']);
        Route::post('/attendance', [AttendanceController::class, 'store']);
        Route::get('/attendance/today', [AttendanceController::class, 'today']);
        Route::get('/attendance/history', [AttendanceController::class, 'history']);
        Route::get('/attendance/export', [AttendanceController::class, 'export']);
        Route::apiResource('leaves', LeaveRequestController::class)->only(['index', 'store', 'destroy']);
        Route::apiResource('retard-authorizations', RetardAuthorizationController::class)->only(['index', 'store', 'destroy']);
        Route::get('/documents', [EmployeeDocumentController::class, 'index']);
        Route::get('/unjustified-absences', [EmployeeUnjustifiedAbsenceController::class, 'index']);
        Route::post('/unjustified-absences/{absence}/explain', [EmployeeUnjustifiedAbsenceController::class, 'explain']);
        Route::apiResource('assistance', EmployeeAssistanceController::class)->only(['index', 'store']);
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::post('/notifications/read', [NotificationController::class, 'markAsRead']);
    });
});