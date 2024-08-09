const jwt = require("jsonwebtoken");

module.exports = {
  cekAuth: async (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
      return res
        .status(401)
        .json({ status: "error", message: "invalid token" });
    }

    try {
      const jwtToken = token.replace("Bearer ", "");
      const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);

      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ msg: "invalid token" });
    }
  },
};
