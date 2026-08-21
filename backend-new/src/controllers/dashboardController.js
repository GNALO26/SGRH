const AppDataSource = require('../config/typeorm');
const User = require('../entities/User');
const Attendance = require('../entities/Attendance');
const Leave = require('../entities/Leave');
const RetardAuthorization = require('../entities/RetardAuthorization');
const UnjustifiedAbsence = require('../entities/UnjustifiedAbsence');
const Holiday = require('../entities/Holiday');
const ActivityLog = require('../entities/ActivityLog');
const Notification = require('../entities/Notification');
const attendanceService = require('../services/attendanceService');

async function getAdminDashboard(req, res, next) {
  const userRepository = AppDataSource.getRepository(User);
  const attendanceRepository = AppDataSource.getRepository(Attendance);
  const leaveRepository = AppDataSource.getRepository(Leave);
  const retardRepository = AppDataSource.getRepository(RetardAuthorization);
  const absenceRepository = AppDataSource.getRepository(UnjustifiedAbsence);
  const activityRepository = AppDataSource.getRepository(ActivityLog);

  try {
    const companyId = req.company_id;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setUTCHours(24, 0, 0, 0);

    const totalEmployees = await userRepository.count({
      where: { company_id: companyId, role: 'employee' }
    });

    const todayAttendances = await attendanceRepository.find({
      where: {
        company_id: companyId,
        date: { $gte: today, $lt: tomorrow }
      }
    });

    const presentToday = todayAttendances.filter(a => a.check_in_time).length;
    const lateToday = todayAttendances.filter(a => a.status === 'late').length;

    const employeesOnLeave = await leaveRepository.find({
      where: {
        company_id: companyId,
        status: 'approved',
        start_date: { $lte: tomorrow },
        end_date: { $gte: today }
      }
    });
    const leaveEmployeeIds = employeesOnLeave.map(l => l.employee_id.toString());

    const presentEmployeeIds = todayAttendances
      .filter(a => a.check_in_time)
      .map(a => a.employee_id.toString());

    const absentToday = await userRepository.count({
      where: {
        company_id: companyId,
        role: 'employee',
        _id: { $nin: [...presentEmployeeIds, ...leaveEmployeeIds] }
      }
    });

    const pendingLeaves = await leaveRepository.count({
      where: { company_id: companyId, status: 'pending' }
    });

    const pendingRetardAuthorizations = await retardRepository.count({
      where: { company_id: companyId, status: 'pending' }
    });

    const unjustifiedAbsences = await absenceRepository.count({
      where: {
        company_id: companyId,
        status: { $in: ['unexplained', 'explained'] }
      }
    });

    const recentActivities = await activityRepository.find({
      where: { company_id: companyId },
      order: { createdAt: 'DESC' },
      take: 5
    });

    return res.status(200).json({
      stats: {
        total_employees: totalEmployees,
        present_today: presentToday,
        late_today: lateToday,
        absent_today: absentToday,
        pending_leaves: pendingLeaves,
        pending_retard_authorizations: pendingRetardAuthorizations,
        unjustified_absences: unjustifiedAbsences
      },
      recent_activities: recentActivities
    });
  } catch (error) {
    next(error);
  }
}

async function getEmployeeDashboard(req, res, next) {
  const leaveRepository = AppDataSource.getRepository(Leave);
  const holidayRepository = AppDataSource.getRepository(Holiday);
  const notificationRepository = AppDataSource.getRepository(Notification);

  try {
    const user = req.user;
    const companyId = req.company_id;

    const todayAttendance = await attendanceService.getTodayAttendance(user);

    const pendingLeaves = await leaveRepository.count({
      where: { company_id: companyId, employee_id: user._id, status: 'pending' }
    });

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(`${currentYear}-01-01T00:00:00Z`);
    const endOfYear = new Date(`${currentYear + 1}-01-01T00:00:00Z`);

    const approvedLeaves = await leaveRepository.find({
      where: {
        company_id: companyId,
        employee_id: user._id,
        status: 'approved',
        start_date: { $gte: startOfYear },
        end_date: { $lt: endOfYear }
      }
    });

    let totalApprovedLeaveDays = 0;
    approvedLeaves.forEach(leave => {
      const start = new Date(leave.start_date);
      const end = new Date(leave.end_date);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      totalApprovedLeaveDays += diffDays;
    });

    const upcomingHolidays = await holidayRepository.find({
      where: { company_id: companyId, date: { $gte: new Date() } },
      order: { date: 'ASC' },
      take: 5
    });

    const recentNotifications = await notificationRepository.find({
      where: { company_id: companyId, recipient_id: user._id },
      order: { createdAt: 'DESC' },
      take: 5
    });

    return res.status(200).json({
      today_attendance: todayAttendance,
      pending_leaves: pendingLeaves,
      total_approved_leave_days: totalApprovedLeaveDays,
      upcoming_holidays: upcomingHolidays,
      recent_notifications: recentNotifications
    });
  } catch (error) {
    next(error);
  }
}

async function getCalendarEvents(req, res, next) {
  const holidayRepository = AppDataSource.getRepository(Holiday);
  const leaveRepository = AppDataSource.getRepository(Leave);
  const attendanceRepository = AppDataSource.getRepository(Attendance);

  try {
    const user = req.user;
    const companyId = req.company_id;

    let startDate, endDate;
    if (req.query.start_date && req.query.end_date) {
      startDate = new Date(req.query.start_date);
      endDate = new Date(req.query.end_date);
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const holidays = await holidayRepository.find({
      where: { company_id: companyId, date: { $gte: startDate, $lte: endDate } }
    });

    const leaves = await leaveRepository.find({
      where: {
        company_id: companyId,
        employee_id: user._id,
        status: 'approved',
        start_date: { $lte: endDate },
        end_date: { $gte: startDate }
      }
    });

    const attendances = await attendanceRepository.find({
      where: {
        company_id: companyId,
        employee_id: user._id,
        date: { $gte: startDate, $lte: endDate }
      }
    });

    const events = [];

    holidays.forEach(holiday => {
      events.push({
        id: holiday._id,
        type: 'holiday',
        title: holiday.name,
        start: holiday.date,
        end: holiday.date,
        allDay: true,
        color: '#f59e0b'
      });
    });

    leaves.forEach(leave => {
      events.push({
        id: leave._id,
        type: 'leave',
        title: `Congé ${leave.leave_type}`,
        start: leave.start_date,
        end: leave.end_date,
        allDay: true,
        color: '#10b981'
      });
    });

    attendances.forEach(attendance => {
      if (attendance.check_in_time) {
        events.push({
          id: attendance._id,
          type: 'attendance',
          title: 'Pointage',
          start: attendance.check_in_time,
          end: attendance.check_out_time || attendance.check_in_time,
          allDay: false,
          color: attendance.status === 'late' ? '#ef4444' : '#3b82f6'
        });
      }
    });

    return res.status(200).json({ events });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAdminDashboard,
  getEmployeeDashboard,
  getCalendarEvents
};