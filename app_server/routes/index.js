const express = require("express");
const router = express.Router();

const ctrlMain = require("../controllers/main");

router.get("/", ctrlMain.index);
router.get("/news", ctrlMain.news);
router.get("/rooms", ctrlMain.rooms);
router.get("/dives", ctrlMain.dives);
router.get("/foods", ctrlMain.foods);
router.get("/meals", ctrlMain.meals);
router.get("/about", ctrlMain.about);
router.get("/contact", ctrlMain.contact);

module.exports = router;
