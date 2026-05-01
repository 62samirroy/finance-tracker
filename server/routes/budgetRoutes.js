const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');

router.get('/:month', budgetController.getBudget);
router.post('/', budgetController.setBudget);

module.exports = router;
