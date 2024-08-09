const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");
const Validator = require("fastest-validator");
const generateRandom = require("../utils/random");
const v = new Validator();

module.exports = {
  index: async (req, res, next) => {
    try {
      let transaction = await prisma.transaction.findMany({
        select: {
          id: true,
          type: true,
          amount: true,
          date: true,
          information: true,
        },
      });

      return res.json({ status: "success", data: transaction });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
  },

  create: async (req, res, next) => {
    try {
      const source = req.body;
      const schema = {
        type: {
          type: "enum",
          empty: "false",
          values: ["CREDIT", "DEBIT", "TRANSFER", "PAYMENT", "FEE", "REFUND"],
        },
        amount: { type: "number", positive: true, integer: true },
        information: { type: "string", empty: "false" },
        accountId: { type: "number", empty: false },
        accountTargetId: { type: "number", optional: true },
      };

      const validate = v.compile(schema)(source);
      if (validate.length) {
        return res.status(400).json({
          status: "error",
          message: validate,
        });
      }

      // Use $transaction with an array of operations
      const result = await prisma.$transaction(async (prisma) => {
        // cek account
        const account = await prisma.account.findUnique({
          where: { id: parseInt(source.accountId) },
        });
        if (!account) {
          throw new Error("Account not found");
        }

        // cek account target
        if (source.accountTargetId) {
          const accountTarget = await prisma.account.findUnique({
            where: { id: parseInt(source.accountTargetId) },
          });

          if (!accountTarget) {
            throw new Error("Account target not found");
          }
        }

        // TRANSFER
        if (source.type === "TRANSFER") {
          if (!source.accountTargetId) {
            throw new Error(
              "Transaction Transfer must send the accountTargetId"
            );
          }

          // cek saldo account
          if (account.balance < source.amount) {
            throw new Error("Your balance too low");
          }

          // update balance accountId and accountTargetId
          await prisma.account.update({
            where: { id: parseInt(source.accountId) },
            data: { balance: { decrement: parseInt(source.amount) } },
          });

          // update balance account target
          await prisma.account.update({
            where: { id: parseInt(source.accountTargetId) },
            data: { balance: { increment: parseInt(source.amount) } },
          });
        }

        // SALDO MASUK
        if (source.type === "CREDIT") {
          // update balance accountId
          await prisma.account.update({
            where: { id: parseInt(source.accountId) },
            data: { balance: { increment: parseInt(source.amount) } },
          });
        }

        // Generate transaction code
        let trxCode;
        let transactionChecker = true;

        while (transactionChecker) {
          trxCode = generateRandom();
          const existingTrxCode = await prisma.transaction.findFirst({
            where: { trxCode },
          });
          transactionChecker = !!existingTrxCode;
        }

        // Create transaction
        const transaction = await prisma.transaction.create({
          data: {
            trxCode,
            type: source.type,
            amount: source.amount,
            date: new Date(),
            information: source.information,
            accountId: account.id,
            accountTargetId: source.accountTargetId || undefined,
          },
        });

        return transaction; // Return transaction for debugging or further use
      });

      return res.status(201).json({
        status: "success",
        message: "Success Create Transaction",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
  },

  detail: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await prisma.transaction.findUnique({
        where: { id },
        select: {
          id: true,
          type: true,
          amount: true,
          date: true,
          information: true,
          account: {
            select: {
              id: true,
              bankName: true,
              accountNumber: true,
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          accountTarget: {
            select: {
              id: true,
              bankName: true,
              accountNumber: true,
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!transaction)
        return res
          .status(404)
          .json({ status: "error", message: "Transaction data not found" });

      return res.json({ status: "success", data: transaction });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
  },
};
