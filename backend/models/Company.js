const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a company name'],
      trim: true,
    },
    industry: {
      type: String,
      required: [true, 'Please specify an industry'],
      trim: true,
      default: 'Technology',
    },
    location: {
      type: String,
      required: [true, 'Please specify a location'],
      trim: true,
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field for associated leads
companySchema.virtual('leads', {
  ref: 'Lead',
  localField: '_id',
  foreignField: 'company',
  match: { isDeleted: false },
});

module.exports = mongoose.model('Company', companySchema);
