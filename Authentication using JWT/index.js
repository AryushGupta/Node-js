const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

const jwtPassword = "123456";
app.use(express.json());


// in memory database
const ALL_USERS = [
  {
    username: "harkirat@gmail.com",
    password: "123",
    name: "harkirat singh",
  },
  {
    username: "raman@gmail.com",
    password: "123321",
    name: "Raman singh",
  },
  {
    username: "priya@gmail.com",
    password: "123321",
    name: "Priya kumari",
  },
];


function userExist(username, password) {
  const userExist = ALL_USERS.find((user) => {
    return (user.username === username && user.password === password)
  })
  if (!userExist) {
    return false;
  }
  return true;
}


app.get('/users', (req, res) => {
  const token = req.headers.authorization;
  try {
    const decoded = jwt.verify(token, jwtPassword);
    const username = decoded.username;
    const otherUsers = ALL_USERS.filter((user) => {
      return (user.username !== username);
    });
    return res.status(200).json(otherUsers);

  } catch (err) {
    return res.status(403).json({
      msg: "Invalid token",
    })
  }
});


app.post('/signin', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!userExist(username, password)) {
    return res.status(403).json({
      msg: "User doesn't exist in our in memory db",
    })
  }

  let token = jwt.sign({ username: username }, jwtPassword);
  return res.status(200).json({
    token: token,
  })
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
