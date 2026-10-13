const Lead = require('../models/Lead');
const Company = require('../models/Company');

// @desc    Get all leads (with search, status filter, and pagination)
// @route   GET /api/leads
// @access  Private
const getLeads = async (req, res, next) => {
  try {
    const { search, status, company, assignedTo, page = 1, limit = 10 } = req.query;

    const query = { isDeleted: false };

    // Search filter across name, email, or phone
    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Status filter
    if (status && status !== 'All') {
      query.status = status;
    }

    // Optional company filter
    if (company && company !== 'All') {
      query.company = company;
    }

    // Optional assignedTo filter
    if (assignedTo && assignedTo !== 'All') {
      query.assignedTo = assignedTo;
    }

    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * pageSize;

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .populate('company', 'name industry location')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    res.json({
      success: true,
      data: leads,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize) || 1,
        limit: pageSize,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single lead by ID
// @route   GET /api/leads/:id
// @access  Private
const getLeadById = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('company', 'name industry location website phone')
      .populate('assignedTo', 'name email role');

    if (!lead || lead.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    res.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Private
const createLead = async (req, res, next) => {
  try {
    const { name, email, phone, status, assignedTo, company, notes } = req.body;

    if (!name || !email || !phone || !assignedTo || !company) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields: name, email, phone, assignedTo, company',
      });
    }

    // Verify company exists
    const companyExists = await Company.findById(company);
    if (!companyExists) {
      return res.status(400).json({
        success: false,
        message: 'The selected company does not exist',
      });
    }

    const lead = await Lead.create({
      name,
      email,
      phone,
      status: status || 'New',
      assignedTo,
      company,
      notes: notes || '',
    });

    const populatedLead = await Lead.findById(lead._id)
      .populate('company', 'name industry location')
      .populate('assignedTo', 'name email');

    res.status(201).json({
      success: true,
      data: populatedLead,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a lead
// @route   PUT /api/leads/:id
// @access  Private
const updateLead = async (req, res, next) => {
  try {
    let lead = await Lead.findById(req.params.id);

    if (!lead || lead.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('company', 'name industry location')
      .populate('assignedTo', 'name email');

    res.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lead status
// @route   PATCH /api/leads/:id/status
// @access  Private
const updateLeadStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['New', 'Contacted', 'Qualified', 'Lost'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowedStatuses.join(', ')}`,
      });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead || lead.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    lead.status = status;
    await lead.save();

    const populatedLead = await Lead.findById(lead._id)
      .populate('company', 'name industry location')
      .populate('assignedTo', 'name email');

    res.json({
      success: true,
      data: populatedLead,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete a lead (must not appear in normal queries)
// @route   DELETE /api/leads/:id
// @access  Private
const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead || lead.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    lead.isDeleted = true;
    lead.deletedAt = new Date();
    await lead.save();

    res.json({
      success: true,
      message: 'Lead deleted successfully (soft-deleted)',
      id: lead._id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  updateLeadStatus,
  deleteLead,
};
