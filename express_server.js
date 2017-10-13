const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
app.set("view engine", "ejs")

//added cookie-parser 
var cookieParser = require('cookie-parser')
app.use(cookieParser())

//added body-parser to access POST request
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "b2xVn2": {
    id: "b2xVn2", 
    email: "kelvin@gmail.com", 
    password: "123456"
  },
 "9sm5xK": {
    id: "9sm5xK", 
    email: "wong@gmail.com", 
    password: "123456"
  }
};

//to get random id
function generateRandomString() {
  return Math.random().toString(36).substr(2,6);
}

//to check if user email exists
function checkEmail (inputEmail) {
  for (let user in userDatabase) {
    if (userDatabase[user].email === inputEmail) {
      return false;
    };
  };
}

//to set cookie to user_id
app.post('/login', (req, res) => {
  res.cookie('user_id', req.body.email);
  res.redirect('/urls');
})

//new registration user page
app.get('/urls/register', (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    user: req.cookies.user_id
  };
  res.render('urls_register', templateVars);
});

//to add new registered user and set cookies to userId
app.post('/urls/register', (req,res) => {
  let userId = generateRandomString();
  let userPassword = req.body.password;
  let userEmail = req.body.email;
//if the e-mail or password are empty strings, or email already existed, send 400
  if (!userEmail || !userPassword) {
    res.status(400);
    res.send('Email or password field cannot be empty')
    return;
  } else if (checkEmail(userEmail) === false) {
    res.status(400);
    res.send('Email already in use');
    return;
  } else {
    users[userId] = {
      id: userId,
      email: userEmail,
      password: userPassword
    }
    res.cookie('user_id', userId);
    res.redirect('/urls');
  }
});
 
//home page
app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    user: req.cookies.user_id
  };
  res.render("urls_index", templateVars);
});

// to log out
app.post('/logout', (req, res) => {
  res.clearCookie('user_id',req.cookies.user_id);
  res.redirect('/urls');
})

//new URL submission form
app.get("/urls/new", (req, res) => {
  res.render("urls_new", {user: req.cookies.user_id});
});

//to show single URL and its shortened form
app.get("/urls/:id", (req, res) => {
  let templateVars = { 
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: req.cookies.user_id
   };
  res.render("urls_show", templateVars);
});

// to redirect short URL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//to delete an url and rediect to the home page
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

//to update an url and rediect to the home page
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

// to add sumbmitted URL to database
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`http://localhost:8080/urls/${shortURL}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});