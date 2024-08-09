const prisma = require("../config/prisma");
const Validator = require("fastest-validator");
const generaetRandom = require("../utils/random");
const v = new Validator();

module.exports = {
  index: async (req, res, next) => {
    try {
      let user = req.user;
      let accounts = await prisma.account.findMany({
        select: {
          id: true,
          bankName: true,
          accountNumber: true,
          balance: true,
          createdAt: true,
          updatedAt: true,
        },
        where: {
          userId: user.id,
        },
      });
      return res.json({ status: "success", data: accounts });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
  },

  create: async (req, res, next) => {
    try {
      const user = req.user;
      const source = req.body;

      const schema = {
        bankName: { type: "string", empty: false },
        userId: { type: "number", empty: false },
      };

      const validate = v.compile(schema)(source);
      if (validate.length) {
        return res.status(400).json({
          status: "error",
          message: validate,
        });
      }

      if (user.id != source.userId)
        return res.status(400).json({
          status: "error",
          message: "Your userId not valid your own id",
        });

      let accountNumber;
      let accountChecker = true;

      // check account number exist
      while (accountChecker) {
        accountNumber = generaetRandom();
        const existingAccountNumber = await prisma.account.findUnique({
          where: { accountNumber },
        });
        accountChecker = !!existingAccountNumber;
      }

      // check user
      const existingUser = await prisma.user.findUnique({
        where: { id: parseInt(source.userId) },
      });
      if (!existingUser)
        return res
          .status(400)
          .json({ status: "error", message: "User not found" });

      let payload = {
        data: {
          balance: 0,
          bankName: source.bankName,
          accountNumber: accountNumber,
          userId: user.id,
        },
      };

      await prisma.account.create(payload);

      return res
        .status(201)
        .json({ status: "success", message: "Success Create Account" });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Internal Server Error :",
        error: error.message,
      });
    }
  },

  update: async (req, res, next) => {
    try {
      const source = req.body;
      const user = req.user;
      const id = parseInt(req.params.id);
      const schema = {
        bankName: { type: "string", empty: false },
      };

      const validate = v.compile(schema)(source);
      if (validate.length) {
        return res.status(400).json({
          status: "error",
          message: validate,
        });
      }

      const existingAccount = await prisma.account.findFirst({
        where: { id, userId: user.id },
      });
      if (!existingAccount)
        return res
          .status(404)
          .json({ status: "error", message: "Account data not found" });

      let payload = {
        bankName: source.bankName,
      };

      await prisma.account.update({
        where: { id },
        data: payload,
      });

      return res.json({ status: "success", message: "Sucess Update Account" });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
  },

  detail: async (req, res, next) => {
    try {
      const user = req.user;
      const id = parseInt(req.params.id);
      const account = await prisma.account.findFirst({
        where: { id, userId: user.id },
        select: {
          id: true,
          bankName: true,
          accountNumber: true,
          balance: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              phone: true,
              address: true,
              dob: true,
            },
          },
        },
      });
      if (!account)
        return res
          .status(404)
          .json({ status: "error", message: "Account data not found" });

      return res.json({ status: "success", data: account });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
  },

  delete: async (req, res, next) => {
    try {
      const user = req.user;
      const id = parseInt(req.params.id);
      const account = await prisma.account.findFirst({
        where: { id, userId: user.id },
      });
      if (!account)
        return res
          .status(404)
          .json({ status: "error", message: "Account data not found" });

      await prisma.account.delete({ where: { id } });
      return res.json({ status: "success", message: "Success delete account" });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
  },
};
