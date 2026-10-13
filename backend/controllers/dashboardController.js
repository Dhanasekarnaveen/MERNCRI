const Lead = require('../models/Lead');
const Task = require('../models/Task');

// @desc    Get dashboard metrics via MongoDB aggregation pipelines
// @route   GET /api/dashboard/metrics
// @access  Private
const getDashboardMetrics = async (req, res, next) => {
  try {
    // Lead Aggregation Pipeline (strictly excluding soft-deleted leads)
    const leadAggregation = await Lead.aggregate([
      {
        $match: {
          isDeleted: { $ne: true },
        },
      },
      {
        $group: {
          _id: null,
          totalLeads: { $sum: 1 },
          qualifiedLeads: {
            $sum: { $cond: [{ $eq: ['$status', 'Qualified'] }, 1, 0] },
          },
          newLeads: {
            $sum: { $cond: [{ $eq: ['$status', 'New'] }, 1, 0] },
          },
          contactedLeads: {
            $sum: { $cond: [{ $eq: ['$status', 'Contacted'] }, 1, 0] },
          },
          lostLeads: {
            $sum: { $cond: [{ $eq: ['$status', 'Lost'] }, 1, 0] },
          },
        },
      },
    ]);

    const leadMetrics = leadAggregation[0] || {
      totalLeads: 0,
      qualifiedLeads: 0,
      newLeads: 0,
      contactedLeads: 0,
      lostLeads: 0,
    };

    // Calculate start and end of today in local time
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Task Aggregation Pipeline
    const taskAggregation = await Task.aggregate([
      {
        $facet: {
          tasksDueToday: [
            {
              $match: {
                dueDate: { $gte: startOfToday, $lte: endOfToday },
              },
            },
            { $count: 'count' },
          ],
          completedTasks: [
            {
              $match: {
                status: 'Completed',
              },
            },
            { $count: 'count' },
          ],
          pendingTasks: [
            {
              $match: {
                status: 'Pending',
              },
            },
            { $count: 'count' },
          ],
          totalTasks: [{ $count: 'count' }],
        },
      },
    ]);

    const taskFacet = taskAggregation[0] || {};
    const tasksDueToday = taskFacet.tasksDueToday?.[0]?.count || 0;
    const completedTasks = taskFacet.completedTasks?.[0]?.count || 0;
    const pendingTasks = taskFacet.pendingTasks?.[0]?.count || 0;
    const totalTasks = taskFacet.totalTasks?.[0]?.count || 0;

    res.json({
      success: true,
      data: {
        totalLeads: leadMetrics.totalLeads,
        qualifiedLeads: leadMetrics.qualifiedLeads,
        newLeads: leadMetrics.newLeads,
        contactedLeads: leadMetrics.contactedLeads,
        lostLeads: leadMetrics.lostLeads,
        tasksDueToday,
        completedTasks,
        pendingTasks,
        totalTasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardMetrics,
};
