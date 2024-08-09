const express = require("express");
const router = express.Router();

const accountController = require("../controllers/account.controller");

const authMiddleware = require("../middleware/auth.middleware");

router.get("/", authMiddleware.cekAuth, accountController.index);
router.post("/", authMiddleware.cekAuth, accountController.create);
router.put("/:id", authMiddleware.cekAuth, accountController.update);
router.get("/:id", authMiddleware.cekAuth, accountController.detail);
router.delete("/:id", authMiddleware.cekAuth, accountController.delete);

module.exports = router;
