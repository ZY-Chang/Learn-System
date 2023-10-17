// 註冊、登入

const router = require("express").Router();
const registerValidation = require("../validation").registerValidation;
const loginValidation = require("../validation").loginValidation;
const courseValidation = require("../validation").courseValidation;
const User = require("../Models").userModel;
const jwt = require("jsonwebtoken");

// middleware
router.use((req, res, next) => {
  console.log("A request is coming in to auth.js");
  next();
});

// route
// 使用postman確認根伺服器是否連結
router.get("/testAPI", (req, res) => {
  const msgObj = {
    message: "Test API is working.",
  };
  // return res.json(msgObj);
  return res.send(msgObj);
});

// 用戶註冊
router.post("/signup", async (req, res) => {
  // 確認使用者輸入值是否有效
  // 使用postman查看回傳內容
  console.log("---Register---");
  console.log(registerValidation(req.body));
  const { error } = registerValidation(req.body);
  // console.log(error.details);
  if (error) return res.status(400).send(error.details[0].message);

  // 確認email 是否註冊過
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("Email 已註冊過");

  // 註冊新用戶
  const newUser = new User({
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    role: req.body.role,
  });

  try {
    const saveUser = await newUser.save();
    res.status(200).send({
      msg: "註冊成功",
      savedObject: saveUser,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send("註冊失敗");
  }
});

// 用戶登入
router.post("/login", (req, res) => {
  // 驗證使用者輸入
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // 確認使用者是否存在
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) {
      res.status(400).send(err);
    }
    if (!user) {
      //找不到用戶
      res.status(401).send("帳號或密碼錯誤");
    } else {
      //驗證密碼 (user-nodel.js)
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (err) return res.status(400).send(err);
        if (isMatch) {
          //密碼正確
          // 使用jsonwebtoken 製作 JWT
          // .env 加密
          const tokenObject = { _id: user._id, email: user.email };
          const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
          // 回傳給使用者
          res.send({ success: true, token: "JWT " + token, user });
        } else {
          res.status(401).send("帳號或密碼錯誤");
        }
      });
    }
  });
});

module.exports = router;
