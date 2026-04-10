const express = require('express');
const transactionController = require('../controllers/transaction.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/:contractAddress/summary', requireAuth, transactionController.getSummary);
router.post('/:contractAddress/seller-sign', requireAuth, transactionController.sellerSignContract);
router.post('/:contractAddress/buyer-sign', requireAuth, transactionController.buyerSignAndPayDeposit);
router.post('/:contractAddress/realtor-review', requireAuth, transactionController.realtorReview);
router.post('/:contractAddress/buyer-finalize', requireAuth, transactionController.buyerFinalize);
router.post('/:contractAddress/withdraw', requireAuth, transactionController.withdraw);

module.exports = router;
