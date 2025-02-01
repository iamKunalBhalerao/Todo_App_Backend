const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const model = mongoose.model;
const ObjectId = Schema.ObjectId;

const User = new Schema({
  email: { type: String, unique: true },
  password: String,
  name: String,
});

const Todo = new Schema({
  userId: ObjectId,
  title: String,
  description: String,
  done: Boolean,
});

const UserModel = model("users", User);
const TodoModel = model("todos", Todo);

module.exports = {
  UserModel,
  TodoModel,
};
