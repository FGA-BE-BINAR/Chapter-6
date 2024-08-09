const express = require("express");
const router = express.Router();

const transactionController = require("../controllers/transaction.controller");

router.get("/", transactionController.index);
router.post("/", transactionController.create);
router.get("/:id", transactionController.detail);

module.exports = router;
