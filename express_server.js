const express = require("express");

const app = express();
app.set("view engine", "ejs");

const PORT = process.env.PORT || 8080; // default is 8080

// allows us to access POST request parameters
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser())


// url database
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://lighthouselabs.ca"
  },
  "9sm5xk": {
    longURL: "http://www.google.com"
  },
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "hello123"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "hello456"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "user3@example.com",
    password: "hello789"
  }
};



// generate random url id
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

// page for input of new urls.  Passes URL data to urls_new
app.get("/urls/new", (request, response) => {
  console.log(`Request cookies: ${request.cookies["userID"]}`)
  let userID = request.cookies["userID"]
  console.log(users[userID])
  let templateVars = {
      user: users[userID]
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
  let userID = request.cookies["userID"]
  let templateVars = {
      user: users[userID]
  };

  response.render("login", templateVars)
});

// registration page
app.post("/urls/register", (request, response) => {
  console.log(`Request body email is : ${request.body.email}`)
  if ((!request.body.email) || (!request.body.password)) {
    response.status(400)
    response.send("Nothing Entered")
    return;
  }
  for (user in users) {
    console.log(users.userRandomID.email)
    if (users[user].email === request.body.email) {
      response.status(400)
      response.send("Email already exists")
      return
    }
  }

  let newUserID = generateRandomString();

  users[newUserID] = {
    id: newUserID,
    email: request.body.email,
    password: request.body.password,
    };



  // once we register the user, we get redirected to a new page with the info
  response.cookie("userID", newUserID);
  response.redirect("/urls");
});

// take in url from the urls/new page and then generate a random ID
app.post("/urls", (request, response) => {
  console.log(request.body); // debug statement to see POST parameters
  let id = generateRandomString();
  urlDatabase[id] = request.body
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
  let userID = request.cookies["userID"]
  let templateVars = {
      urls: urlDatabase,
      user: users[userID]
  };
  response.render("urls_index", templateVars);
});

// passes URL data to template urls_show.
app.get("/urls/:id", (request, response) => {
  let userID = request.cookies["userID"]
  let templateVars = {
    user: users[userID],
    shortURL: request.params.id,
    longURL: urlDatabase[request.params.id].longURL
  };
  response.render("urls_show", templateVars);
});

// POST route to remove a URL resource
// id always needs to be passed as request.params.id
app.post("/urls/:id/delete", (request, response) => {
  let id = request.params.id;
  delete urlDatabase[id];
  response.redirect("/urls");
});



// POST route to update a URL resource
app.post("/urls/:id", (request, response) => {
  console.log(request.body);
  let id = request.params.id;
  let longURL = request.body.longURL;
  console.log(`Request Params ID: ${request.params.id}`)
  urlDatabase[request.params.id].longURL = longURL;
  console.log(longURL);
  response.redirect("/urls");
});

// POST route to handle username cookies
// request.body.username is refering to the input name in header.ejs
app.post("/login", (request, response) => {
    let userID = request.cookies["userID"]
    let templateVars = {
      user: users[userID]
  };

if (request.body.user === ""){
    response.cookie("userID", "");
    response.redirect("/urls");
    return;
  }

  for(user in users){
    if (users[user].email === request.body.email && users[user].password === request.body.password){
      response.cookie("userID", user);
      response.redirect("/urls");
      return;
    }
  }
  response.status(403)
  response.send("login failed.");
});

// POST route to handle username logout
app.post("/logout", (request, response) => {
  let userID = request.cookies["userID"]
  let templateVars = {
      user: users[userID]
  };




// gives me a JSON output of my main page.
// app.get("/urls.json", (request, response) => {
//   response.json(urlDatabase);
// });

// sends a Hello World message when I redirect to /hello.
// app.get("/hello", (request, response) => {
//   response.end("<html><body>Hello <b>World</b></body></html>\n")
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

generateRandomString();

