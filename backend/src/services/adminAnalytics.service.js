import User from '../models/users.model.js';
import Job from '../models/jobs.model.js';
import Application from '../models/applications.model.js';
import StudentProfile from '../models/studentProfile.model.js';

const JOB_STATUS = { OPEN: 'OPEN' };
const APP_STATUS = {
  APPLIED: 'APPLIED',
  SHORTLISTED: 'SHORTLISTED',
  INTERVIEW: 'INTERVIEW',
  SELECTED: 'SELECTED',
  HIRED: 'HIRED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN'
};
const ROLES = { STUDENT: 'STUDENT' };

class AdminAnalyticsService {
  
  /**
   * Main entry point: Fetches all dashboard stats in parallel
   */
  async getStats() {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Parallel execution for maximum performance
    const [
      studentStats,
      jobStats,
      appStats,
      placementStats,
      chartData
    ] = await Promise.all([
      this._getStudentStats(startOfCurrentMonth),
      this._getJobStats(startOfCurrentMonth, startOfPreviousMonth, now),
      this._getApplicationStats(startOfCurrentMonth),
      this._getPlacementRateStats(startOfCurrentMonth),
      this._getPlacementChartData()
    ]);

    return {
      summary: {
        students: studentStats,
        activeJobs: jobStats,
        applications: appStats,
        placementRate: placementStats
      },
      chartData
    };
  }

  // ----------------------------------------------------------------
  // SECTION 1: Summary Card Helpers
  // ----------------------------------------------------------------

  async _getStudentStats(startOfCurrentMonth) {
    const [total, totalLastMonth] = await Promise.all([
      User.countDocuments({ role: ROLES.STUDENT }),
      User.countDocuments({ role: ROLES.STUDENT, createdAt: { $lt: startOfCurrentMonth } })
    ]);

    const change = this._calculateChange(total, totalLastMonth);
    return { value: total, change, trend: this._getTrend(change) };
  }

  async _getJobStats(startOfCurrentMonth, startOfPreviousMonth, now) {
    const [activeCount, createdThisMonth, createdLastMonth] = await Promise.all([
      Job.countDocuments({ status: JOB_STATUS.OPEN, deadline: { $gte: now } }),
      Job.countDocuments({ createdAt: { $gte: startOfCurrentMonth } }),
      Job.countDocuments({ createdAt: { $gte: startOfPreviousMonth, $lt: startOfCurrentMonth } })
    ]);

    const change = this._calculateChange(createdThisMonth, createdLastMonth);
    return { value: activeCount, change, trend: this._getTrend(change) };
  }

  async _getApplicationStats(startOfCurrentMonth) {
    const [total, totalLastMonth] = await Promise.all([
      Application.countDocuments(),
      Application.countDocuments({ createdAt: { $lt: startOfCurrentMonth } })
    ]);

    const change = this._calculateChange(total, totalLastMonth);
    return { value: total, change, trend: this._getTrend(change) };
  }

  async _getPlacementRateStats(startOfCurrentMonth) {
    const [hiredTotal, studentsTotal, hiredLastMonth, studentsLastMonth] = await Promise.all([
      this._countUniqueHiredStudents(), 
      User.countDocuments({ role: ROLES.STUDENT }),
      this._countUniqueHiredStudents(startOfCurrentMonth),
      User.countDocuments({ role: ROLES.STUDENT, createdAt: { $lt: startOfCurrentMonth } })
    ]);

    const currentRate = studentsTotal === 0 ? 0 : (hiredTotal / studentsTotal) * 100;
    const lastMonthRate = studentsLastMonth === 0 ? 0 : (hiredLastMonth / studentsLastMonth) * 100;
    
    const diff = Number((currentRate - lastMonthRate).toFixed(1));

    return { value: Number(currentRate.toFixed(1)), change: diff, trend: this._getTrend(diff) };
  }

  // Optimized Helper: Counts unique students using Aggregation (Fast)
  async _countUniqueHiredStudents(dateLimit = null) {
    const matchStage = { status: { $in: [APP_STATUS.SELECTED, APP_STATUS.HIRED] } };
    if (dateLimit) matchStage.updatedAt = { $lt: dateLimit };

    const result = await Application.aggregate([
      { $match: matchStage },
      { $group: { _id: "$studentId" } }, // Deduplicate by Student ID
      { $count: "count" }
    ]);
    return result.length > 0 ? result[0].count : 0;
  }

  // ----------------------------------------------------------------
  // SECTION 2: Chart Data (Zero-Filled)
  // ----------------------------------------------------------------

  async _getPlacementChartData() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const rawData = await Application.aggregate([
      {
        $match: {
          status: { $in: [APP_STATUS.SELECTED, APP_STATUS.HIRED] },
          updatedAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { month: { $month: "$updatedAt" }, year: { $year: "$updatedAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Fill in missing months with 0
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const filledData = [];
    let iterDate = new Date(sixMonthsAgo);
    const now = new Date();

    while (iterDate <= now) {
      const m = iterDate.getMonth() + 1;
      const y = iterDate.getFullYear();
      const found = rawData.find(d => d._id.month === m && d._id.year === y);
      
      filledData.push({
        month: months[m - 1],
        placements: found ? found.count : 0
      });
      iterDate.setMonth(iterDate.getMonth() + 1);
    }
    return filledData;
  }

  // ----------------------------------------------------------------
  // SECTION 3: Recent Placements (NO POPULATE - USES $LOOKUP)
  // ----------------------------------------------------------------

  async getRecentPlacements() {
    // We use a single Aggregation Pipeline to Join Users and Jobs efficiently
    const recent = await Application.aggregate([
      // 1. Filter only Hired/Selected applications
      { 
        $match: { 
          status: { $in: [APP_STATUS.SELECTED, APP_STATUS.HIRED] } 
        } 
      },
      // 2. Sort by most recent first
      { $sort: { updatedAt: -1 } },
      // 3. Limit to 5 items (Crucial for performance)
      { $limit: 5 },
      // 4. Join with Users Collection (Get Student Data)
      {
        $lookup: {
          from: 'users',             // Physical collection name in MongoDB (usually lowercase plural)
          localField: 'studentId',
          foreignField: '_id',
          as: 'studentInfo'          // Results come back as an array
        }
      },
      // 5. Unwind Student Array (Convert array to single object)
      { 
        $unwind: { 
          path: '$studentInfo', 
          preserveNullAndEmptyArrays: true // Don't discard if student is deleted
        } 
      },
      // 6. Join with Jobs Collection
      {
        $lookup: {
          from: 'jobs',              // Physical collection name
          localField: 'jobId',
          foreignField: '_id',
          as: 'jobInfo'
        }
      },
      // 7. Unwind Job Array
      { 
        $unwind: { 
          path: '$jobInfo', 
          preserveNullAndEmptyArrays: true 
        } 
      },
      // 8. Project (Select & Rename Fields)
      {
        $project: {
          _id: 1,
          hiredAt: '$updatedAt',
          // Concatenate First + Last Name
          studentName: { 
            $concat: [
              { $ifNull: ['$studentInfo.firstName', 'Unknown'] }, 
              ' ', 
              { $ifNull: ['$studentInfo.lastName', ''] }
            ] 
          },
          avatar: '$studentInfo.avatar',
          // Access nested company name inside Job
          company: { $ifNull: ['$jobInfo.company.name', 'Unknown Company'] }, 
          role: { $ifNull: ['$jobInfo.title', 'Unknown Role'] },
          package: { $ifNull: ['$jobInfo.packageLPA', 0] }
        }
      }
    ]);

    return recent;
  }

  // ----------------------------------------------------------------
  // SECTION 4: New Dashboard Analytics Endpoints
  // ----------------------------------------------------------------

  async getDepartmentPlacementRates() {
    const [departmentTotals, departmentPlaced] = await Promise.all([
      StudentProfile.aggregate([
        { $match: { department: { $exists: true, $ne: '' } } },
        { $group: { _id: '$department', totalStudents: { $sum: 1 } } },
        { $project: { _id: 0, department: '$_id', totalStudents: 1 } }
      ]),
      Application.aggregate([
        { $match: { status: { $in: [APP_STATUS.SELECTED, APP_STATUS.HIRED] } } },
        { $sort: { updatedAt: -1 } },
        {
          $group: {
            _id: '$studentId',
            department: { $first: '$eligibilitySnapshot.department' }
          }
        },
        { $match: { department: { $exists: true, $ne: '' } } },
        { $group: { _id: '$department', placedStudents: { $sum: 1 } } },
        { $project: { _id: 0, department: '$_id', placedStudents: 1 } }
      ])
    ]);

    const totalsByDepartment = new Map(
      departmentTotals.map((item) => [item.department, item.totalStudents])
    );
    const placedByDepartment = new Map(
      departmentPlaced.map((item) => [item.department, item.placedStudents])
    );

    const departments = new Set([
      ...totalsByDepartment.keys(),
      ...placedByDepartment.keys()
    ]);

    const data = Array.from(departments)
      .map((department) => {
        const totalStudents = totalsByDepartment.get(department) || 0;
        const placedStudents = placedByDepartment.get(department) || 0;
        const rate = totalStudents === 0 ? 0 : Number(((placedStudents / totalStudents) * 100).toFixed(1));

        return {
          department,
          totalStudents,
          placedStudents,
          placementRate: rate
        };
      })
      .sort((a, b) => a.department.localeCompare(b.department));

    return {
      departments: data,
      generatedAt: new Date().toISOString()
    };
  }

  async getApplicationStageCounts() {
    const statuses = [
      APP_STATUS.APPLIED,
      APP_STATUS.SHORTLISTED,
      APP_STATUS.INTERVIEW,
      APP_STATUS.SELECTED,
      APP_STATUS.HIRED,
      APP_STATUS.REJECTED,
      APP_STATUS.WITHDRAWN
    ];

    const grouped = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusBreakdown = statuses.reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {});

    grouped.forEach((item) => {
      if (statusBreakdown[item._id] !== undefined) {
        statusBreakdown[item._id] = item.count;
      }
    });

    return {
      interviewCount: statusBreakdown[APP_STATUS.INTERVIEW],
      statusBreakdown,
      generatedAt: new Date().toISOString()
    };
  }

  async getProfileAndVerificationCounts(minCompleteness = 80) {
    const [
      totalStudentUsers,
      totalStudentProfiles,
      incompleteProfiles,
      pendingVerificationStudents,
      pendingVerificationAccounts
    ] = await Promise.all([
      User.countDocuments({ role: ROLES.STUDENT }),
      StudentProfile.countDocuments(),
      StudentProfile.countDocuments({ profileCompleteness: { $lt: minCompleteness } }),
      User.countDocuments({ role: ROLES.STUDENT, isVerified: false }),
      User.countDocuments({ isVerified: false })
    ]);

    const studentsWithoutProfile = Math.max(totalStudentUsers - totalStudentProfiles, 0);

    return {
      profileCompletenessThreshold: minCompleteness,
      studentsWithIncompleteProfiles: incompleteProfiles,
      studentsWithoutProfile,
      studentsNeedingProfileAttention: incompleteProfiles + studentsWithoutProfile,
      accountsPendingVerification: pendingVerificationAccounts,
      studentAccountsPendingVerification: pendingVerificationStudents,
      generatedAt: new Date().toISOString()
    };
  }

  async getPackageComparison() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const previousYear = currentYear - 1;

    const startOfPreviousYear = new Date(previousYear, 0, 1);
    const startOfNextYear = new Date(currentYear + 1, 0, 1);

    const packageData = await Application.aggregate([
      {
        $match: {
          status: { $in: [APP_STATUS.SELECTED, APP_STATUS.HIRED] },
          updatedAt: { $gte: startOfPreviousYear, $lt: startOfNextYear }
        }
      },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'jobInfo'
        }
      },
      {
        $unwind: {
          path: '$jobInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          resolvedPackage: {
            $ifNull: ['$offerDetails.packageLPA', '$jobInfo.packageLPA']
          }
        }
      },
      { $match: { resolvedPackage: { $gt: 0 } } },
      {
        $group: {
          _id: { year: { $year: '$updatedAt' } },
          averagePackageLPA: { $avg: '$resolvedPackage' },
          highestPackageLPA: { $max: '$resolvedPackage' },
          offersCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          averagePackageLPA: { $round: ['$averagePackageLPA', 2] },
          highestPackageLPA: { $round: ['$highestPackageLPA', 2] },
          offersCount: 1
        }
      }
    ]);

    const byYear = new Map(packageData.map((item) => [item.year, item]));
    const current = byYear.get(currentYear) || {
      year: currentYear,
      averagePackageLPA: 0,
      highestPackageLPA: 0,
      offersCount: 0
    };
    const previous = byYear.get(previousYear) || {
      year: previousYear,
      averagePackageLPA: 0,
      highestPackageLPA: 0,
      offersCount: 0
    };

    const avgChange = this._calculateChange(current.averagePackageLPA, previous.averagePackageLPA);
    const highestChange = this._calculateChange(current.highestPackageLPA, previous.highestPackageLPA);

    return {
      comparisonLabel: 'vs last year',
      previousYear,
      currentYear,
      averagePackage: {
        currentYear: current.averagePackageLPA,
        previousYear: previous.averagePackageLPA,
        change: avgChange,
        trend: this._getTrend(avgChange),
        offersCountCurrentYear: current.offersCount,
        offersCountPreviousYear: previous.offersCount,
        label: 'vs last year'
      },
      highestPackage: {
        currentYear: current.highestPackageLPA,
        previousYear: previous.highestPackageLPA,
        change: highestChange,
        trend: this._getTrend(highestChange),
        label: 'vs last year'
      },
      generatedAt: now.toISOString()
    };
  }

  // ----------------------------------------------------------------
  // SECTION 5: Utilities
  // ----------------------------------------------------------------

  _calculateChange(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    const change = ((current - previous) / previous) * 100;
    return Number(change.toFixed(1));
  }

  _getTrend(change) {
    if (change > 0) return 'up';
    if (change < 0) return 'down';
    return 'neutral';
  }
}

export default new AdminAnalyticsService();