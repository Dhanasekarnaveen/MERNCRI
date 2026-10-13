const Company = require('../models/Company');
const Lead = require('../models/Lead');

// @desc    Get all companies
// @route   GET /api/companies
// @access  Private
const getCompanies = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = {};

    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { industry: { $regex: search.trim(), $options: 'i' } },
        { location: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const companies = await Company.find(query).sort({ createdAt: -1 });

    // Include associated leads count for each company
    const companiesWithCount = await Promise.all(
      companies.map(async (company) => {
        const leadCount = await Lead.countDocuments({
          company: company._id,
          isDeleted: false,
        });
        return {
          ...company.toObject(),
          leadCount,
        };
      })
    );

    res.json({
      success: true,
      count: companiesWithCount.length,
      data: companiesWithCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single company by ID with associated leads
// @route   GET /api/companies/:id
// @access  Private
const getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    // Fetch associated leads (excluding soft-deleted)
    const associatedLeads = await Lead.find({
      company: company._id,
      isDeleted: false,
    }).populate('assignedTo', 'name email');

    res.json({
      success: true,
      data: {
        company,
        associatedLeads,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new company
// @route   POST /api/companies
// @access  Private
const createCompany = async (req, res, next) => {
  try {
    const { name, industry, location, website, phone, notes } = req.body;

    if (!name || !industry || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide company name, industry, and location',
      });
    }

    const company = await Company.create({
      name,
      industry,
      location,
      website: website || '',
      phone: phone || '',
      notes: notes || '',
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private
const updateCompany = async (req, res, next) => {
  try {
    let company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: company,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private
const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    await company.deleteOne();

    res.json({
      success: true,
      message: 'Company deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
};
