const prisma = require("../config/prisma");
const Validator = require("fastest-validator");
const v = new Validator();
const bcrypt = require("bcrypt");

module.exports = {
  index: async (req, res, next) => {
    try {
      let users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          phone: true,
          address: true,
          dob: true,
        },
      });
      return res.json({ status: "success", data: users });
    } catch (error) {
      return res
        .status(500)
        .json({ status: "error", message: "Internal Server Error :", error });
    }
  },

  create: async (req, res, next) => {
    try {
      const source = req.body;
      const schema = {
        name: { type: "string", empty: false },
        username: { type: "string", empty: false },
        password: { type: "string", min: 6, max: 6 },
        phone: { type: "string", empty: false, min: 9, max: 13 },
        address: { type: "string", empty: false },
        dob: { type: "date", convert: true },
      };

      const validate = v.compile(schema)(source);
      if (validate.length) {
        return res.status(400).json({
          status: "error",
          message: validate,
        });
      }
      // check username exist
      const existingUsername = await prisma.user.findUnique({
        where: { username: source.username },
      });

      if (existingUsername)
        return res.status(400).json({
          status: "error",
          message: "Username already in use",
        });

      let hashPassword = await bcrypt.hash(source.password, 10);

      let payload = {
        data: {
          name: source.name,
          username: source.username,
          password: hashPassword,
          phone: source.phone,
          address: source.address,
          dob: new Date(source.dob),
        },
      };

      await prisma.user.create(payload);
      return res.status(201).json({
        status: "succes",
        message: "Success Create User",
      });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
  },

  update: async (req, res, next) => {
    try {
      const user = req.user;
      const source = req.body;
      const id = parseInt(req.params.id);

      const schema = {
        name: { type: "string", empty: false },
        username: { type: "string", empty: false },
        password: { type: "string", min: 6, max: 6 },
        phone: { type: "string", empty: false, min: 9, max: 13 },
        address: { type: "string", empty: false },
        dob: { type: "date", convert: true },
      };

      const validate = v.compile(schema)(source);
      if (validate.length) {
        return res.status(400).json({
          status: "error",
          message: validate,
        });
      }

      if (id != user.id) {
        return res.status(400).json({
          status: "error",
          message: "You don't have access to this data",
        });
      }

      const existingUser = await prisma.user.findUnique({ where: { id: id } });
      if (!existingUser) {
        return res.status(404).json({
          status: "error",
          message: "User data not found",
        });
      }

      const existingUsername = await prisma.user.findUnique({
        where: { username: source.username },
      });
      if (existingUsername && existingUsername.id != existingUser.id)
        return res
          .status(400)
          .json({ status: "error", message: "Username already in use" });

      let hashPassword = await bcrypt.hash(source.password, 10);

      const payload = {
        name: source.name,
        username: source.username,
        password: hashPassword,
        phone: source.phone,
        address: source.address,
        dob: new Date(source.dob),
      };

      await prisma.user.update({
        where: { id: id },
        data: payload,
      });

      return res.status(200).json({
        status: "succes",
        message: "Success Update User",
      });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
  },

  detail: async (req, res, next) => {
    try {
      const id = req.params.id;
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
      });
      if (!user)
        return res.status(404).json({
          status: "error",
          message: "User data not found",
        });

      delete user.password;
      delete user.username;

      return res.json({ status: "success", data: user });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
  },

  delete: async (req, res, next) => {
    try {
      const user = req.user;
      const id = parseInt(req.params.id);

      if (id != user.id) {
        return res.status(400).json({
          status: "error",
          message: "You don't have access to this data",
        });
      }

      const exisingUser = await prisma.user.findUnique({
        where: { id: id },
      });
      if (!exisingUser)
        return res.status(404).json({
          status: "error",
          message: "User data not found",
        });

      await prisma.user.delete({ where: { id: id } });

      return res.json({ status: "success", message: "Success delete user" });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
  },
};
