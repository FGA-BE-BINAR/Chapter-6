const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");

const transactionController = require("../controllers/transaction.controller");

router.get("/", authMiddleware.cekAuth, transactionController.index);
router.post("/", authMiddleware.cekAuth, transactionController.create);
router.get("/:id", authMiddleware.cekAuth, transactionController.detail);

module.exports = router;
