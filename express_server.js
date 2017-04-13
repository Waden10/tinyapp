var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};




function generateRandomString() {

  var randomNumber = new Date().getTime().toString(36);

  return randomNumber;
}

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/");
});

app.post("/urls/:shortURL/update", (req, res) => {
  let longUrl = req.body.longUrl;
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = longUrl;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
    delete urlDatabase[req.params.shortURL];
  console.log("Url has been Deleted");
  res.redirect('/urls');
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  var shortURL = generateRandomString();
  var longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  // console.log(req.body);  // debug statement to see POST parameters
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
  res.redirect('/urls');
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
    let templateVars = { 
      urls : urlDatabase,
      username: req.cookies ? req.cookies.username : undefined
      
      // username: req.cookies["username"],
      // urls: result,
      // myVar: 'christian'
    };
    res.render("urls_index", templateVars);
  });

app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let longUrl = urlDatabase[shortURL];
  let templateVars = { shortURL: req.params.id, longUrl: longUrl };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/");
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});