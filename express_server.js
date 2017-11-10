const express = require("express");

const app = express();
app.set("view engine", "ejs");

const PORT = process.env.PORT || 8080; // default is 8080

// allows us to access POST request parameters
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require('cookie-session');
app.use(cookieSession( {
  name: 'session',
  keys: ["october-delta-elephant"]
}));

const bcrypt = require('bcrypt');


// url database
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://lighthouselabs.ca",
    userID: ""
  },
  "9sm5xk": {
    longURL: "http://www.google.com",
    userID: ""
  },
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "user3@example.com",
    password: "lighthouse-labs"
  }
};

// generate random url id
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}


// returns the subset of the URL database that belongs to the user with ID id
function urlsForUser(userID) {
  let usersUrls = {};
  for (urlID in urlDatabase) {
    if (userID === urlDatabase[urlID].userID) {
      usersUrls[urlID] = urlDatabase[urlID];
    }
  }
  return usersUrls;
}

function currentUser(userID) {
  // let userID = request.session["userID"]
  let currentUser = null
    Object.keys(users).forEach(function(email) {
      if (users[email].id === userID) {
        currentUser = email;
        }

      });
        return currentUser;
    };



// page for input of new urls.  Passes URL data to urls_new
app.get("/urls/new", (request, response) => {
  if (!request.session["userID"]) {
    response.redirect("/urls/login");
    return;
  }

  let userID = request.session["userID"];
  let templateVars = {
      user: currentUser(userID)
  };
  response.render("urls_new", templateVars);
});

// GET route that passes data to urls/login
// should allow for creation of a new user
app.get("/urls/register", (request, response) => {
  response.render("urls_register");
});

// LOGIN PAGE
app.get("/urls/login", (request, response) => {
  let userID = request.session["userID"];
  let templateVars = {
      user: users[userID]
  };

  response.render("login", templateVars);
});

// registration page
app.post("/urls/register", (request, response) => {
  if ((!request.body.email) || (!request.body.password)) {
    response.status(400);
    response.send("Nothing Entered");
    return;
  }
  for (user in users) {
    if (users[user].email === request.body.email) {
      response.status(400)
      response.send("Email already exists");
      return;
    }
  }
  let newUserID = generateRandomString();
  const hashedPassword = bcrypt.hashSync(request.body.password, 10);

  users[request.body.email] = {
    id: newUserID,
    email: request.body.email,
    password: hashedPassword
    };
  // once we register the user, we get redirected to a new page with the info
  // request.session["userID"] = newUserID;
  response.redirect("/urls/login");
});

// take in url from the urls/new page and then generate a random ID
app.post("/urls", (request, response) => {
 // console.log(request.body); // debug statement to see POST parameters
  let id = generateRandomString();
  urlDatabase[id] = request.body;
  urlDatabase[id].userID = request.session["userID"];
  // once we input the new URL, we get redirected to a new page with the info
  response.redirect("/urls/" + id);
});

// used to handle shortURL requests
// purpose of this is to provide a link to the long URL page
app.get("/u/:shortURL", (request, response) => {
   let shortURL = request.params.shortURL;
   let longURL = urlDatabase[shortURL].longURL;
   response.redirect(longURL);
});

// passes URL data to the template urls_index.ejs
// done with res.render
app.get("/urls", (request, response) => {
  let userID = request.session["userID"];


  let templateVars = {
      urls: urlsForUser(userID),
      user: currentUser(userID)
  }
  response.render("urls_index", templateVars);
});

// passes URL data to template urls_show.
app.get("/urls/:id", (request, response) => {
  let userID = request.session["userID"];
  let templateVars = {
    user: currentUser(userID),
    shortURL: request.params.id,
    longURL: urlDatabase[request.params.id].longURL,
    userID : urlDatabase[request.params.id].userID
  };
  response.render("urls_show", templateVars);
});

// POST route to remove a URL resource
// id always needs to be passed as request.params.id
app.post("/urls/:id/delete", (request, response) => {
  if (request.session["userID"] !== urlDatabase[request.params.id].userID) {
    response.status(403)
    response.send("HAL 9000: I'm sorry Dave, I'm afraid I can't do that");
    return;
  }
  let id = request.params.id;
  delete urlDatabase[id];
  response.redirect("/urls");
})



// POST route to update a URL resource
app.post("/urls/:id", (request, response) => {
  if (request.session["userID"] !== urlDatabase[request.params.id].userID) {
    response.status(403)
    response.send("HAL 9000: I'm sorry Dave, I'm afraid I can't do that");
    return;
  }
  let id = request.params.id;
  let longURL = request.body.longURL;
  urlDatabase[request.params.id].longURL = longURL;
  response.redirect("/urls");
});

// POST route to handle username cookies
// request.body.username is refering to the input name in header.ejs
app.post("/login", (request, response) => {
   const hashedPassword = bcrypt.hashSync(request.body.password, 10);
    let templateVars = {
      user: users[request.body.email]
  };

if (request.body.user === ""){
    response.session("userID", "");
    response.redirect("/urls");
    return;
  }

  for(user in users){
    if (users[user].email === request.body.email && bcrypt.compareSync(request.body.password, users[user].password)) {
      request.session.userID = users[request.body.email].id
      response.redirect("/urls");
      console.log(`users DB is : ${users}`)
      return;
    }
  }
  response.status(403)
  response.send("Login Failed. Please register an account");
});

// POST route to handle username logout
app.post("/logout", (request, response) => {
  request.session = null
  response.redirect("/urls");
})




// gives me a JSON output of my main page.
app.get("/urls.json", (request, response) => {
  response.json(urlDatabase);
  response.json(users)
});

// sends a Hello World message when I redirect to /hello.
// app.get("/hello", (request, response) => {
//   response.end("<html><body>Hello <b>World</b></body></html>\n")
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

generateRandomString();

