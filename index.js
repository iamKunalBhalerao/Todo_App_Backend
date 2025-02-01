const { z } = require("zod");
const bcrypt = require("bcrypt");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const { UserModel, TodoModel } = require("./db");
const mongoose = require("mongoose");
const { auth, jwt_password } = require("./auth");
app.use(express.json());

mongoose.connect(
  "mongodb+srv://kunalbhalerao789:kunal%400987654321@cluster01.hm8ab.mongodb.net/my-todo-app"
);

app.post("/signup", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  // Input Validation
  const requireBody = z.object({
    email: z.string().min(5).max(100).email(),
    name: z.string().min(3).max(100),
    password: z
      .string()
      .min(3)
      .max(100)
      .refine((value) => /[A-Z]/.test(value), {
        message: "Password must contain at least one uppercase letter",
      })
      .refine((value) => /[a-z]/.test(value), {
        message: "Password must contain at least one lowercase letter",
      })
      .refine((value) => /\d/.test(value), {
        message: "Password must contain at least one digit",
      })
      .refine((value) => /[!@#$%^&*(),.?":{}|<>]/.test(value), {
        message: "Password must contain at least one special character",
      }),
  });

  // const parsedData = requireBody.parse(req.body);
  const parsedDatawithSuccess = requireBody.safeParse(req.body);

  if (!parsedDatawithSuccess.success) {
    res.status(403).json({
      message: "Invalid email or password 🤬",
      error: parsedDatawithSuccess.error.errors,
    });
    return;
  }

  // Hashing the password using bcrypt and error handling (server crash) usign try and chatch
  let errorthrown = false;
  try {
    const hashedPassword = await bcrypt.hash(password, 5);

    await UserModel.create({
      email: email,
      password: hashedPassword,
      name: name,
    });
  } catch (e) {
    res.status(403).json({
      message: "User Alerdy Exists 🤬",
    });
    errorthrown = true;
    return;
  }

  res.status(200).json({
    message: "You are Signed Up 👏",
  });
});

app.post("/signin", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await UserModel.findOne({
    email: email,
  });

  if (!user) {
    res.status(403).json({
      message: "Your credentials are Invalid 🤬",
    });
  }

  const passwordCompare = await bcrypt.compare(password, user.password);

  if (passwordCompare) {
    const token = jwt.sign({ id: user._id.toString() }, jwt_password);
    res.status(200).json({
      token,
    });
  } else {
    res.status(403).json({
      message: "Invalid Credintials 🤬",
    });
  }
});

app.post("/todo", auth, async (req, res) => {
  const userId = req.userId;
  const title = req.body.title;
  const description = req.body.description;
  const done = req.body.done;

  const todo = await TodoModel.create({
    userId: userId,
    title: title,
    description: description,
    done: done,
  });

  res.status(200).json({
    message: "Todo created successfuly 👏",
    todo,
  });
});

app.get("/todos", auth, async (req, res) => {
  const userId = req.userId;

  const todos = await TodoModel.find({
    userId,
  });

  res.status(200).json({
    todos,
  });
});

app.put("/update-todo", auth, async (req, res) => {
  const findTodo = req.body.findTodo;
  const title = req.body.title;
  const description = req.body.description;
  const done = req.body.done;

  try {
    await TodoModel.findOneAndUpdate(
      { title: findTodo },
      {
        $set: {
          title: title,
          description: description,
          done: done,
        },
      },
      { new: true },
      res.status(200).json({
        message: "Todo Updateed Successfully ✅",
      })
    );
  } catch (e) {
    res.status(200).json({
      message: "Something is Wrong 🤬!!!",
    });
  }
});

app.delete("/delete-todo", auth, async (req, res) => {
  const title = req.body.title;

  try {
    const deleteTodo = await TodoModel.findOneAndDelete({ title: title });

    if (!deleteTodo) {
      res.status(403).json({
        message: "Todo Not Found 🤬!!!",
      });
    } else {
      res.status(200).json({
        message: "Todo Deleted Successfully 👏",
      });
    }
  } catch (e) {
    res.status(403).json({
      message: "Something went WRONG 🤬!!!",
    });
  }
});

app.listen(3000, () => {
  console.log("server is on PORT:3000");
});
