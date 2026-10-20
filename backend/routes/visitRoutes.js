const express = require("express");
const { getVisits, recordVisit } = require("../controllers/visitController");

const router = express.Router();

router.get("/", getVisits);
router.post("/", recordVisit);

module.exports = router;
