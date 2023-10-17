const router = require("express").Router();
const Course = require("../Models").courseModel;
const courseValidation = require("../validation").courseValidation;

// middleware
router.use((req, res, next) => {
  console.log("A request to course-route");
  next();
});

// 獲得課程資訊
router.get("/", (req, res) => {
  // Course 資料中包含講師（user），是 mongoose中的資料
  // populate 可以找到並印出資料連結的另一筆資料的內容
  Course.find({})
    .populate("instructor", ["username", "email"])
    .then((course) => {
      res.send(course);
    })
    .catch(() => {
      res.status(500).send("找不到課程");
    });
});

//搜尋課程 根據 課程id
router.get("/:_id", (req, res) => {
  let { _id } = req.params;
  Course.findOne({ _id })
    .populate("instructor", ["email"])
    .then((course) => {
      res.send(course);
    })
    .catch((e) => {
      res.send(e);
    });
});

//搜尋課程 根據 學生id
router.get("/student/:_student_id", (req, res) => {
  let { _student_id } = req.params;
  // 找到課程屬性中的students 與_student_id相符的課程
  Course.find({ students: _student_id })
    .populate("instructor", ["username", "email"])
    .then((course) => {
      res.status(200).send(course);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

//搜尋課程 根據 講師id
router.get("/instructor/:_instructor_id", (req, res) => {
  let { _instructor_id } = req.params;
  Course.find({ instructor: _instructor_id })
    .populate("instructor", ["username", "email"])
    .then((course) => {
      res.status(200).send(course);
    })
    .catch((e) => {
      res.status(500).send("找不到課程資料");
    });
});

// 搜尋課程，根據課程名稱
router.get("/find/:name", (req, res) => {
  let { name } = req.params;
  Course.find({ title: name })
    .populate("instructor", ["username", "email"])
    .then((course) => {
      res.status(200).send(course);
    })
    .catch((e) => {
      res.status(500).send("找不到課程資料");
    });
});

// 新增課程
router.post("/", async (req, res) => {
  // 驗證輸入
  const { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let { title, description, price } = req.body;
  // 確認身分
  if (req.user.isStudent()) {
    return res.status(400).send("您不是講師");
  }
  // 建立課程

  let newCourse = new Course({
    title,
    description,
    price,
    instructor: req.user._id,
  });
  try {
    await newCourse.save();
    res.status(200).send("課程建立成功");
  } catch (err) {
    res.status(400).send("建立失敗");
  }
});

// 更新課程
router.patch("/:_id", async (req, res) => {
  // 驗證輸入
  const { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //尋找課程
  let { _id } = req.params;
  let course = await Course.findOne({ _id });
  if (!course) {
    res.status(404);
    return res.json({
      success: false,
      message: "該課程不存在",
    });
  }
  // 確認是否為開課講師
  if (course.instructor.equals(req.user._id) || req.user.isAdmin()) {
    Course.findOneAndUpdate({ _id }, req.body, {
      new: true,
      runValidators: true,
    })
      .then(() => {
        res.send(" 課程已成功修改 ");
      })
      .catch((e) => {
        res.send({
          success: false,
          message: e,
        });
      });
  } else {
    //不是課程講師
    res.status(403);
    return res.json({
      success: false,
      message: "您沒有權限修改該課程",
    });
  }
});

// 刪除課程
router.delete("/:_id", async (req, res) => {
  //尋找課程
  let { _id } = req.params;
  let course = await Course.findOne({ _id });
  if (!course) {
    res.status(404);
    return res.json({
      success: false,
      message: "該課程不存在",
    });
  }
  // 確認是否為開課講師
  if (course.instructor.equals(req.user._id) || req.user.isAdmin()) {
    Course.deleteOne({ _id })
      .then(() => {
        res.send(" 課程已成功刪除 ");
      })
      .catch((e) => {
        res.send({
          success: false,
          message: e,
        });
      });
  } else {
    //不是課程講師
    res.status(403);
    return res.json({
      success: false,
      message: "您沒有權限刪除該課程",
    });
  }
});

// 報名課程
router.post("/enroll/:_id", async (req, res) => {
  let { _id } = req.params;
  let { user_id } = req.body;
  try {
    let course = await Course.findOne({ _id });
    course.students.push(user_id);
    await course.save();
    res.send("報名成功");
  } catch (err) {
    res.send(err);
  }
});

module.exports = router;
