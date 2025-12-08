// src/routes/v1/staff/financeRoutes.js
const express = require('express');
const router = express.Router();
const rentalController = require('../../../controllers/rentalController');
const invoiceController = require('../../../controllers/invoiceController');
const reportController = require('../../../controllers/reportController');

// Rental
router.get('/rentals/:id', rentalController.getRentalById);
router.put('/rentals/:id', rentalController.updateRental);

// Invoice
router.get('/invoices/:id', invoiceController.getInvoiceById);

// Report
router.get('/revenue', reportController.getRevenueReport);

module.exports = router;