var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
var users = require('./users');
var bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const hash = require('./hashing');

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

function urlsForUser(uid) {
  let userUrls = {};
  for (let url in urlDatabase) {
    let shorturl = urlDatabase[url].shortURL;
    if (urlDatabase[url].userID === uid)
      filtered[shorturl] = urlDatabase[url];
  }
  return userUrls;
}

app.get('/login', (req, res) => {
  let user = req.session.user_id;
  let templateVars = {user};
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.render('user_login', templateVars);
  }
});


app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(usr => (usr.email === email && usr.password === password));
  if(user) {
    res.session.user_id;
    res.redirect("/login");
  } else {
    res.status(403);
    res.send(403, "403: you goofed lol jk it means Forbidden");
    res.redirect("/login");
  }
});

app.post("/logout", (req, res) => {
  delete req.session.user_id;
  res.clearCookie('user_id');
  res.redirect('/login');
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
  if(req.session.user_id) {
    let templateVars = {};
    templateVars.username = req.session.user_id;
    res.status(200).render("urls_new", templateVars);
  } else {
      res.redirect("/login");
    
  }
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
    res.redirect('/urls');
});

app.get('/', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies ? req.cookies.username : undefined
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let longUrl = urlDatabase[shortURL];
  let templateVars = { shortURL: req.params.id, longUrl: longUrl };
  res.render("urls_show", templateVars);
});

app.get('/register', (req, res) => {
  let user = req.session.user_id;
  let templateVars = {user};
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.render('user_reg', templateVars);
  }
});



app.post("/register", (req, res) => {
  const {user_id, email, password} = req.body;
  if (user_id === '' || email === '' || password === '') {
    res.redirect(400, "/register");
  } else {
    let hashedPassword = bcrypt.hashSync(password, 10);
    let password = hashedPassword;
    let randomID = generateRandomString();
    let newUser = { id: randomID,
                    name: user_id,
                    email,
                    password: hashedPassword
                  };

    users.push(newUser);
    req.cookie("user_id", newUser.id);
    res.redirect("/urls");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello<b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});