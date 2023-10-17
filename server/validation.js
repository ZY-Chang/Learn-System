const Joi = require("joi");

// 驗證註冊資料
const registerValidation = (data) => {
  const schema = Joi.object({
    // 按照user-model撰寫
    username: Joi.string().min(2).max(50).required(),
    // 一定要是email
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required(),
    role: Joi.string().required().valid("student", "instructor"),
  });

  // 使用schema 確認 Joi 送進來的data是否　valid
  return schema.validate(data);
};

// 驗證登入資料
const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(6).required(),
  });
  return schema.validate(data);
};

// 驗證課程輸入
const courseValidation = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(50).required(),
    description: Joi.string().min(3).required(),
    price: Joi.number().min(100).max(9999).required(),
  });
  return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.courseValidation = courseValidation;
