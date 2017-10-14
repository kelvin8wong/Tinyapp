///////////////
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");

///////////////MIDDLEWARE
app.set("view engine", "ejs")
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));
//middleware to pass user_id
app.use(function(req, res, next){
  let id = req.cookies.user_id;
  if (id){
    res.locals.user = users[id];
  } else { 
    res.locals.user = null;
  }
     next();
   });

//////////////DATABASE////////
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
///////////////FUNCTIONS

//to get random id
function generateRandomString() {
  return Math.random().toString(36).substr(2,6);
}

function checkPassword (inputPassword) {
  for (let user in users) {
    if (users[user].password === inputPassword) {
      return true;
    }
  }
  return false;
};

function checkUser(inputEmail) {
  for (let user in users) {
    if (inputEmail === users[user].email)
      return user;
   }
 }

//registration user page
app.get('/register', (req, res) => {
  res.render('urls_register');
});

//to add new registered user and set cookies
app.post('/register', (req,res) => {
  let id = generateRandomString();
  let password = req.body.password;
  let email = req.body.email;
//if the e-mail or password are empty strings, or email already existed, send 400
  if (!email || !password) {
    res.status(400).send('Email or password field cannot be empty!');
    return;
  } else {
    for (let user_id in users ){ 
      if (users[user_id].email === email) {
        res.status(400).send('Email is already in use!');
        return;
      }
    }
  }
  users[id] = { id, email, password };
  res.cookie("user_id", id);
  res.redirect("/urls")
});

//to log in and set cookies
app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  for (let user_id in users ) {
    if (email === users[user_id].email && password === users[user_id].password){
      res.cookie("user_id", user_id);
      res.redirect("/urls");
      return;
    } 
  }
  res.status(403).send("Wrong email or password!");
});

//login page
app.get('/login', (req, res) => {
  res.render('urls_login');
});
 
//home page
app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    user: req.cookies.user_id,
  };
  res.render("urls_index", templateVars);
});

// to add sumbmitted URL to database
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

// to log out
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

//new URL submission form
app.get("/urls/new", (req, res) => {
  let templateVars = { 
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: req.cookies.user_id
   };
  res.render("urls_new", templateVars);
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

//to update an url and rediect to the home page
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});