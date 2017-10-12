const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
app.set("view engine", "ejs")

//added body-parser to access POST request
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  return Math.random().toString(36).substr(2,6);
}

//home page
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//to show single URL and its shortened form
app.get("/urls/:id", (req, res) => {
  let templateVars = { 
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
   };
  res.render("urls_show", templateVars);
});

// to redirect short URL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//new URL submission form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// to add sumbmitted URL to database
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`http://localhost:8080/urls/${shortURL}`);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});