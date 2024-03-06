const express = require('express');
const fs = require('fs');
const app = express();
const users = require('./MOCK_DATA.json');
const PORT = 3000;

// middleware - Plugin
app.use(express.urlencoded({ extended: false }));

// custom middleware
app.use((req, res, next) => {
  fs.appendFile('./log.txt', `${Date.now()} : ${req.method} : ${req.path}\n`, (err, data) => {
    if (err) {
      res.send('Error occcurred!');
      return;
    } else {
      next();
    }
  });
});

// Routes

app.get('/users', (req, res) => {
  const html = `
  <ul>
    ${users.map((user) => `<li>${user.first_name}</li>`).join('')}
  </ul>
  `
  res.send(html);
})


app.get('/api/users', (req, res) => {
  res.setHeader('X-Name', 'Aryush Gupta');  // Custom header
  // Always add X to custom headers
  console.log(req.headers);
  return res.json(users);
});

// grouping the methods with same route
app
  .route('/api/users/:id')
  .get((req, res) => {
    const id = Number(req.params.id);

    const user = users.find((user) => user.id === id);
    if (user) {
      return res.status(200).json(user);
    } else {
      return res.status(404).json({error : "User not found!😶‍🌫️"});
    }

  })
  .patch((req, res) => {
    // Edit the user with id
    const id = Number(req.params.id);
    const body = req.body;
    const keys = Object.keys(body);

    const idExistIndex = users.findIndex((user) => user.id === id);

    if (idExistIndex !== -1) {

      keys.forEach(key => {
        users[idExistIndex][key] = body[key];
      });

      const updatedData = JSON.stringify(users, null, 2);
      fs.writeFile('./MOCK_DATA.json', updatedData, (err, data) => {
        if (err) {
          return res.json({ status: `${err}🐒` });
        } else {
          return res.status(201).json({ status: 'Done 👍🏽' });
        }
      });
    } else {
      return res.status(404).json({ status: `${id} doesn't exist` });
    }

  })
  .delete((req, res) => {
    // Delete the user with id
    const id = Number(req.params.id);

    const idToRemoveIndex = users.findIndex(user => user.id === id)

    if (idToRemoveIndex !== -1) {

      users.splice(idToRemoveIndex, 1);

      const updatedData = JSON.stringify(users, null, 2);

      fs.writeFile('./MOCK_DATA.json', updatedData, (err, data) => {
        if (err) {
          return res.json({ status: `${err} occurred!` })
        } else {
          return res.json({ id: `${idToRemoveIndex + 1} removed successfully` });
        }
      });

    } else {
      return res.json({ status: `${id} doesn't exist!` });
    }

  })


app.post('/api/users', (req, res) => {
  // Create new user

  const body = req.body;
  if (!body || !body.first_name || !body.last_name || !body.email || !body.gender || !body.job_title) {
    return res.status(400).json({ msg: "All fields are required!" });
  }

  users.push({ id: users.length + 1, ...body });

  fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err, data) => {
    if (err) {
      return res.json({ status: `${err} 🐒` });
    } else {
      return res.status(201).json({ status: `Done 🗿`, id: users.length });
    }
  });

})


app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
