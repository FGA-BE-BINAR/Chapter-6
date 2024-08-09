require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const swaggerJSON = require("./swagger.json");
const swaggerUI = require("swagger-ui-express");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const accountRouter = require("./routes/accounts");
const transactionRouter = require("./routes/transactions");
const authRouter = require("./routes/auth");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerJSON));
app.use("/users", usersRouter);
app.use("/accounts", accountRouter);
app.use("/transactions", transactionRouter);
app.use("/auth", authRouter);

module.exports = app;
