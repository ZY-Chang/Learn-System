const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  // default max min
  username: {
    type: String,
    maxlength: 50,
    minLength: 2,
    required: true,
  },
  email: {
    type: String,
    required: true,
    minLength: 6,
    maxLength: 100,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
    maxLength: 1024,
  },
  role: {
    type: String,
    // 可以是誰
    enum: ["student", "instructor"],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// 確認是否是學生
// methods 要加 s
userSchema.methods.isStudent = function () {
  // true or false
  return this.role == "student";
};

// 確認是否是講師
userSchema.methods.isInstructor = function () {
  // true or false
  return this.role == "instructor";
};

// 確認是否是管理者
userSchema.method.isAdmin = function () {
  // true or false
  return this.role == "admin";
};

// mongoose schema middleware
// 在任何user被保存之前 會確認需不需要 hash
userSchema.pre("save", async function (next) {
  // 這筆資料有沒有被改過 或是 這筆資料是不是新的
  if (this.isModified("password") || this.isNew) {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
  } else {
    return next();
  }
});

// 比對密碼
// cb callback function是可以被當作參數的函數
// 在同步或是非同步的情況下都可以依序執行函式
userSchema.methods.comparePassword = function (password, cb) {
  // 使用者輸入的明碼、資料庫抓到的密碼
  bcrypt.compare(password, this.password, (err, isMatch) => {
    if (err) {
      return cb(err, isMatch);
    }
    cb(null, isMatch);
  });
};

module.exports = mongoose.model("User", userSchema);
