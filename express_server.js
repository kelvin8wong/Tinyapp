///////////////
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

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
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userid1"
  },
  "9sm5xK": {
    longURL:"http://www.google.com",
    userID: "userid2"
  }
};

const users = { 
  "userid1": {
    id: "userid1", 
    email: "kelvin@gmail.com", 
    hashedPassword: "123456"
  },
  "userid2": {
    id: "userid2", 
    email: "wong@gmail.com", 
    hashedPassword: "123"
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

//to run data from user's database
function urlsForUser(id) {
  let obj = {};
  for (let key in urlDatabase) {
    if (id === urlDatabase[key].userID) {
      obj[key] = urlDatabase[key];
    }
  }
  return  obj;
}

//home page
app.get('/', (req, res) => {
  res.render('urls_login');
});

//registration user page
app.get('/register', (req, res) => {
  res.render('urls_register');
});

//to add new registered user and set cookies
app.post('/register', (req,res) => {
  let id = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === "" || hashedPassword === "") {
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
  users[id] = { id, email, hashedPassword };
  res.cookie("user_id", id);
  res.redirect("/urls")
});

//to log in and set cookies
app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  for (let user_id in users ) {
    const user = users[user_id];
    if (email === user.email) {
      if (bcrypt.compareSync(password, user.hashedPassword)){
        res.cookie("user_id", user.id);
        res.redirect("/urls");
        return;
      }
    } 
  }
  res.status(403).send("Wrong email or password!");
});

//login page
app.get('/login', (req, res) => {
  res.render('urls_login');
});
 
//to go to index page with user logged in
app.get("/urls", (req, res) => {
  let user_id = req.cookies["user_id"];
  let templateVars = { 
    urls: urlDatabase[req.cookies.id],
    userUrls : urlsForUser(user_id),
    user: user_id
  };
  if (!user_id) {
   res.status(401).render("401 ERROR: You are unauthorized!");
   return;
  }  
  res.render("urls_index", templateVars);
});

// to add sumbmitted URL to database
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
    urlDatabase[shortURL] = {
    userID: req.cookies["user_id"],
    shortURL: shortURL,
    longURL: longURL
  }
  res.redirect('/urls');
})

// to log out
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

//to go to new URL submission form
app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    res.status(400).send("Error 400: You have to log in first!");
  } else {
    let templateVars = { 
    urls: urlDatabase[req.cookies.id],
    user: req.cookies.user_id
    };
    res.render("urls_new", templateVars);
  }
});

//to show single URL and its shortened form
app.get("/urls/:id", (req, res) => {
  if (!req.cookies.user_id) {
    res.status(403).send("Error 403: You can't update other user's URLs!");
  } else {
    let templateVars = { 
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id].longURL,
      user: req.cookies.user_id
    };
    res.render("urls_show", templateVars);
  }
});

//to update an url and rediect to the index page
app.post("/urls/:id", (req, res) => {
  if ( req.cookies["user_id"] === urlDatabase[req.params.id].userID ) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect("/urls/");
  } else { 
    res.status(403).send("Error 403: You can't update other user's URLs!");}
});

// to redirect short URL
app.get("/u/:id", (req, res) => {
  if(!urlDatabase[req.params.id]){
    res.status(404).send("Error 404 : Page not found");
  } else {
    res.redirect(urlDatabase[req.params.id].longURL)
  }
});

//to delete an url and rediect to the index page
app.post("/urls/:id/delete", (req, res) => {
  if (!req.cookies.user_id) {
    res.status(403).send("Error 403: You can't delete other user's URLS!");
  } else {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});