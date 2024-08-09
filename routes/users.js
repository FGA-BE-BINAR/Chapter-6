const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const userController = require("../controllers/user.controller");

router.get("/", userController.index);
router.post("/", userController.create);
router.put("/:id", authMiddleware.cekAuth, userController.update);
router.get("/:id", authMiddleware.cekAuth, userController.detail);
router.delete("/:id", authMiddleware.cekAuth, userController.delete);

module.exports = router;
