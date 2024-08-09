const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");
const Validator = require("fastest-validator");
const v = new Validator();
const jwt = require("jsonwebtoken");

module.exports = {
  signin: async (req, res, next) => {
    const source = req.body;
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
        .json({ status: "error", message: "Invalid Account / Password" });

    const isValidPassword = bcrypt.compareSync(
      source.password,
      existingUser.password
    );
    if (!isValidPassword)
      return res
        .status(404)
        .json({ status: "error", message: "Invalid Account / Password" });

    const payloadToken = {
      accountId: existingUser.id,
      userId: existingUser.userId,
      email: existingUser.email,
    };
    const token = jwt.sign(payloadToken, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return res.json({
      status: "success",
      data: token,
    });
  },
};
