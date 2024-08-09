const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");
const Validator = require("fastest-validator");
const v = new Validator();
const jwt = require("jsonwebtoken");

module.exports = {
  signin: async (req, res, next) => {
    const source = req.body;
    console.log("body:", source)
    const schema = {
      username: { type: "string", empty: false },
      password: { type: "string", empty: false },
    };

    const validate = v.compile(schema)(source);
    if (validate.length) {
      return res.status(400).json({
        status: "error",
        message: validate,
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username: source.username },
    });
    if (!existingUser)
      return res
        .status(401)
        .json({ status: "error", message: "Invalid Username / Password" });

    const isValidPassword = bcrypt.compareSync(
      source.password,
      existingUser.password
    );
    if (!isValidPassword)
      return res
        .status(404)
        .json({ status: "error", message: "Invalid Username / Password" });

    const payloadToken = {
      id: existingUser.id,
      name: existingUser.name,
      username: existingUser.username,
    };
    const token = jwt.sign(payloadToken, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return res.json({
      status: "success",
      data: token,
    });
  },

  signout: async (req, res, next) => {
    return res.json({ status: "success", message: "success logout" });
  },
};
