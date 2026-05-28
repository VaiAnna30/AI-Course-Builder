require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');
const User = require('./models/User');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const courses = await Course.find();
  console.log("Total courses:", courses.length);
  if (courses.length > 0) {
     console.log("First course userId:", courses[0].userId);
  }
  const users = await User.find();
  if (users.length > 0) {
     console.log("First user id:", users[0]._id.toString());
  }
  mongoose.disconnect();
}
check();
