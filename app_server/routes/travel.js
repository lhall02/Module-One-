const express = require("express");
const router = express.Router();

const ctrlTravel = require("../controllers/travel");

router.get("/", ctrlTravel.travel);
router.get("/:code", ctrlTravel.travelDetail);

module.exports = router;
