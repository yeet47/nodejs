express = require('express')
bodyParser = require('body-parser')
fs = require('fs')
nunjucks = require('nunjucks')

server = express()
server.use( bodyParser.urlencoded({ extended: false }) )

login = { keshav: 'monkey' }
data = { keshav: ['eat food', 'brush teeth'] }

// Take a username and generate the user's account
function generateUserAccount(username) {
  template = fs.readFileSync(__dirname + '/html/account.html', 'utf-8')
  //template = template.replace('{{username}}', username)
  template = nunjucks.renderString(template, {
    username: username,
    list: data[username]
  })

  return template
}

// Get the account page
server.get('/user/:username', function(request, response) {
  username = request.params.username

  // If the user doesn't exist
  if (login[username] == null) {
    response.redirect('/join')
  }
  else {
    page = generateUserAccount(username)
    response.send(page)
  }
})

// Serve the login page
server.get('/login', function(request, response) {
  response.sendFile(__dirname + '/html/login.html')
})
// Login attempt was made
server.post('/login', function(request, response) {
  username = request.body.username
  password = request.body.password

  // If the user doesn't have an account
  if (login[username] == null) {
    response.sendFile(__dirname + '/html/login-no-user.html')
  }
  // If the user's password didn't match
  else if (login[username] != password) {
    response.sendFile(__dirname + '/html/login-wrong-password.html')
  }
  // Correct!
  else {
    response.redirect('/user/' + username)
  }
})

// Serve the sign up page
server.get('/join', function(request, response) {
  response.sendFile(__dirname + '/html/join.html')
})

// Get a new user
server.post('/join', function(request, response) {
  username = request.body.username
  password = request.body.password

  // Does the user already exist?
  if (login[username] != null) {
    response.sendFile(__dirname + '/html/join-already-exists.html')
  }
  // Is the password too short?
  else if (password.length < 6) {
    response.sendFile(__dirname + '/html/join-password.html')
  }
  else {
    // Create a new key and value in the object
    login[username] = password
    response.redirect('/user/' + username)
  }
})

server.get('/css/style.css', function(request, response) {
  response.sendFile(__dirname + '/css/style.css')
})

server.listen(8000)
