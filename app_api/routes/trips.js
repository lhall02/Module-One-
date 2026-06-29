const express = require("express");
const router = express.Router();
const ctrlTrips = require("../controllers/trips");

router.get("/", ctrlTrips.tripsList);
router.post("/", ctrlTrips.tripsAddTrip);

router.get("/code/:code", ctrlTrips.getTripByCode);
router.get("/filter/search", ctrlTrips.filterTrips);
router.get("/group/resorts", ctrlTrips.groupByResort);
router.get("/range/dates", ctrlTrips.getTripsByDateRange);
router.delete("/cache/clear", ctrlTrips.clearCache);

router.get("/:tripId", ctrlTrips.tripsFindById);
router.put("/:tripId", ctrlTrips.tripsUpdateTrip);
router.delete("/:tripId", ctrlTrips.tripsDeleteTrip);

module.exports = router;