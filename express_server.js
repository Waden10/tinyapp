var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
var users = require('./users');
var bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')
const hash = require('./hashing')

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['lighthouse']
}));


app.set("view engine", "ejs");


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



function generateRandomString() {

  let randomNumber = new Date().getTime().toString(36);

  return randomNumber;
}

app.get("/login", (req, res) => {
  res.render("login")
})

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(usr => (usr.email === email && usr.password === password));
  if(user) {
    res.cookie("user_id", user.id);
    res.redirect("/");
  } else {
    res.status(403);
    res.send("you goofed")
    res.redirect("/login")
  }
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
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
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

app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.post("/register", (req, res) => {
  const { user_id, email, password } = req.body;

    //if user_id or e-mail or password = '' then respond with '400'
  if (user_id === '' || email === '' || password === '') {
    res.redirect(400, "/register");
  } else {
    let hashedPassword = bcrypt.hashSync(req.body.password, 10)
    let password = hashedPassword;

    let randomID = generateRandomString();
    let newUser = {id: randomID, 
                  name: user_id, 
                  email,
                  password: hashedPassword 
                }
    console.log('newuser', newUser);
    users.push(newUser);
    res.cookie("user_id", newUser.id);

    // req.session.user_id = randomID;
    //   req.session.user_id = user_id;
    res.redirect("/urls");
  }

});

app.post("/logout", (req, res) => {
  delete req.session.user_id;
  res.redirect('/login');
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