// Load the express library
var fs = require('fs')
var express = require('express')
var bodyParser = require('body-parser')

// Use the express function to create a virtual
// server object
var server = express()

var alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
function createSecret(length) {
    var secret = ''
    for (var i = 0 ; i < length ; i++) {
        secret += alphabet.charAt( Math.floor(Math.random() * 36) )
    }
    return secret
}

// Login data for the users
var login = {}
var auth = {}
var todo = {}

function save() {
    fs.writeFileSync(__dirname + '/backup/login.json', JSON.stringify(login));
    fs.writeFileSync(__dirname + '/backup/auth.json', JSON.stringify(auth));
    fs.writeFileSync(__dirname + '/backup/todo.json', JSON.stringify(todo));
}

function load() {
    login = JSON.parse(fs.readFileSync(__dirname + '/backup/login.json', 'utf-8'))
    auth = JSON.parse(fs.readFileSync(__dirname + '/backup/auth.json', 'utf-8'))
    todo = JSON.parse(fs.readFileSync(__dirname + '/backup/todo.json', 'utf-8'))
}

// Load from the files
load()
// Every minute, save to the files
setInterval(save, 10000)

// The pages of my app that may need to be changed a bit
var signupPage = fs.readFileSync(__dirname + '/signup.html', 'utf-8')
var loginPage = fs.readFileSync(__dirname + '/login.html', 'utf-8')
var todoPage = fs.readFileSync(__dirname + '/todo.html', 'utf-8')

server.use( bodyParser.urlencoded({ extended: true }) )

server.get('/style.css', function(request, response) {
    response.sendFile(__dirname + '/style.css')
});

server.get('/', function(request, response) {
    response.sendFile(__dirname + '/home.html')
})

// Get the login page and the sign up page
server.get('/login', function(request, response) {
    response.send(loginPage)
})

server.get('/signup', function(request, response) {
    response.send(signupPage)
})

// Get the user's todo list
server.get('/user/:username', function(request, response) {
    var username = request.params.username
    var secret = request.query.secret

    todoPage = fs.readFileSync(__dirname + '/todo.html', 'utf-8')

    // If the username doesn't exist, show the sign up page
    if (login[username] == null) {
        response.redirect('/signup');
    }
    // If the user doesn't have any authenticated data stored
    else if (auth[username] == null) {
        response.redirect('/login');
    }
    else if (secret == null) {
        response.redirect('/login');
    }
    // If the secret sent in the query (after the ?) doesn't match the
    // secret that is stored by the server
    else if (auth[username].secret != secret) {
        response.redirect('/login');
    }
    else if (auth[username].expires < Date.now()) {
        response.redirect('/login');
    }
    else {
        var todoList = todo[username]

        var html = '<ul>'
        // go to every todo list item, create an li
        for (var i = 0 ; i < todoList.length ; i++) {
            html += '<li>' + todoList[i] +
                        // Appending a small form with a single button that does a post to
                        // the route /remove/:username/:index
                        '<form class="remove" method="post" action="/remove/' + username + '">' +
                            '<input name="index" type="hidden" value="' + i + '">' +
                            '<input name="secret" type="hidden" value="' + secret + '">' +
                            '<input type="submit" value="X">' +
                        '</form>' +
                    '</li>'
        }
        html = html + '</ul>'

        response.send(todoPage
            .replace(':username', username)
            .replace(':secret', secret)
            .replace('<!--todo-->', html))
    }
})

server.post('/remove/:username', function(request, response) {
    var username = request.params.username
    var index = request.body.index
    var secret = request.body.secret

    if (login[username] == null) {
        response.redirect('/signup')
    }
    else if (auth[username] == null ||
             auth[username].secret != secret ||
             auth[username].expires < Date.now()) {
        response.redirect('/login')
    }
    else {
        var todoList = todo[username]
        todoList.splice(parseInt(index), 1)
        response.redirect('/user/' + username + '?secret=' + secret)
    }
})

server.post('/add/:username', function(request, response) {
    var username = request.params.username
    var secret = request.body.secret

    if (login[username] == null) {
        response.redirect('/signup')
    }
    else if (auth[username] == null ||
             auth[username].secret != secret ||
             auth[username].expires < Date.now()) {
        response.redirect('/login')
    }
    else {
        var todoList = todo[username]
        todoList.push(request.body.item)
        response.redirect('/user/' + username + '?secret=' + secret)
    }
})

// Respond to POST requests made on the sign up and login page
server.post('/login', function(request, response) {
    var form = request.body

    // If the user doesn't exist
    if (login[form.username] == null) {
        response.send(loginPage.replace(
            '<!--message-->', '<p>No user with that username.</p>'));
    }
    // If the password doesn't match
    else if (login[form.username] != form.password) {
        response.send(loginPage.replace(
                '<!--message-->', '<p>Invalid password.</p>'));
    }
    else {
        var secret = createSecret(32)
        auth[form.username] = {
            secret: secret,
            expires: Date.now() + 3600000
        }
        response.redirect('/user/' + form.username + '?secret=' + secret)
    }
})

server.post('/signup', function(request, response) {
    var form = request.body

    // If the password was too short
    if (form.username.length == 0) {
        response.send( signupPage.replace('<!--message-->', '<p>Enter a username.</p>'))
    }
    else if (form.password.length < 6) {
        response.send( signupPage.replace('<!--message-->', '<p>Password must be at least 6 characters.</p>'))
    }
    // If the username does exist
    else if (login[form.username] != null) {
        response.send( signupPage.replace('<!--message-->', '<p>Username already in use.</p>'))
    }
    // If none of the errors above were caught
    else {
        // Save the password and create a new array for the todo items
        login[form.username] = form.password
        todo[form.username] = []

        // Create a secret and send it to them
        var secret = createSecret(32)
        auth[form.username] = {
            secret: secret,
            expires: Date.now() + 3600000
        }
        response.redirect('/user/' + form.username + '?secret=' + secret)
    }
})

server.listen(3000)
