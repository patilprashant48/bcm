const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');

const planController = require('../controllers/planController');

// Plan routes
router.get('/', planController.getPlans);

router.post('/', authenticateToken, isAdmin, async (req, res) => {
    // TODO: Create plan - Handled by Admin Controller? Or keep stub/delegate
    // AdminController handles createPlan?
    // Let's leave stub or delegate if adminController has it.
    // Admin routes are usually /admin/plans
    res.json({ success: true, message: 'Use /admin/plans for creation' });
});

router.post('/:planId/activate', authenticateToken, planController.activatePlan);

router.get('/my-plan', authenticateToken, planController.getActivePlan);

// Alias for business panel compatibility
// This route would be /api/plans/business/active-plan which is unusual.
// Better to rely on business.routes.js for /api/business/active-plan
// Removing alias to avoid confusion.

module.exports = router;
