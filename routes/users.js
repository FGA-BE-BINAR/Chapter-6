const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");

router.get("/", userController.index);
router.post("/", userController.create);
router.put("/:id", userController.update);
router.get("/:id", userController.detail);
router.delete("/:id", userController.delete);

module.exports = router;
