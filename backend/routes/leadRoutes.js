const express = require('express');
const router = express.Router();
const {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  updateLeadStatus,
  deleteLead,
} = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All lead routes require authentication

router.route('/')
  .get(getLeads)
  .post(createLead);

router.route('/:id')
  .get(getLeadById)
  .put(updateLead)
  .delete(deleteLead); // Soft delete

router.patch('/:id/status', updateLeadStatus);

module.exports = router;
