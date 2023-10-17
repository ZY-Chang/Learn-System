require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");

// 自己的
const authRoute = require("./routes").auth;
const courseRoute = require("./routes").course;

const passport = require("passport");
require("./config/passport")(passport);

// 使用的資料庫記得修改
mongoose
  .connect(process.env.DB_CONNECT, {
    // useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to mongodb.");
  })
  .catch((e) => {
    console.log(e);
  });

// middlewares
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// 自己的
// 一定要加 /api React 跟 server 做連結會比較方便
// 任何人都可以註冊
app.use("/api/user", authRoute);
// 新增課程需要驗證身分
app.use(
  "/api/course",
  passport.authenticate("jwt", { session: false }),
  courseRoute
);

// error handling
app.get("/*", (req, res) => {
  res.status(404).send("404 not found.");
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500);
  res.send("Something is broken. We will fix it soon.");
});

// 不能用3000
app.listen(8080, () => {
  console.log("Server running on port 8080.");
});
