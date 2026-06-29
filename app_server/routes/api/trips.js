const express = require("express");
const router = express.Router();

const ctrlTrips = require("../../controllers/trips");

// Original endpoint - all trips sorted by start date
router.get("/", ctrlTrips.tripsList);

// Get trip by code (uses binary search algorithm)
router.get("/code/:code", ctrlTrips.getTripByCode);

// Filter trips by multiple criteria (price range, date range, resort)
router.get("/filter/search", ctrlTrips.filterTrips);

// Group trips by resort with aggregated statistics
router.get("/group/resorts", ctrlTrips.groupByResort);

// Find trips within date range
router.get("/range/dates", ctrlTrips.getTripsByDateRange);

// Cache management
router.delete("/cache/clear", ctrlTrips.clearCache);

module.exports = router;
