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



// generate random url id
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

// page for input of new urls.  Passes URL data to urls_new
app.get("/urls/new", (request, response) => {
  response.render("urls_new");
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
  let templateVars = {
      urls: urlDatabase,
      username: request.cookies["userID"]
  };
  response.render("urls_index", templateVars);
});

// passes URL data to template urls_show.
app.get("/urls/:id", (request, response) => {
  let templateVars = {
    username: request.cookies["userID"],
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
  urlDatabase[request.params.id].longURL = longURL;
  console.log(longURL);
  response.redirect("/urls");
});

// POST route to handle username cookies
// request.body.username is refering to the input name in header.ejs
app.post("/login", (request, response) => {
  console.log(request.body);
  response.cookie("userID", request.body.username);
  response.redirect("/urls");
});

// POST route to handle username logout
app.post("/logout", (request, response) => {
  console.log(request.body);
  response.clearCookie("userID", request.body.username);
  response.redirect("/urls");
});

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

