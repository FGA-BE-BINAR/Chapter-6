const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const authController = require("../controllers/auth.controller");

router.post("/signin", authController.signin);
router.post("/signout", authMiddleware.cekAuth, authController.signout);

module.exports = router;
