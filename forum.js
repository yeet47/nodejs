express = require('express')
fs = require('fs')
nunjucks = require('nunjucks')

server = express()
template = fs.readFileSync(__dirname + '/forum.html', 'utf-8')

data = {
  puppies: {
    topic: true,
    title: 'Puppies are cool!',
    message: [
      'nice pup',
      'cool dog dude'
    ]
  }
}

// Get the homepage
server.get('/', function(req, res) {
  res.send( nunjucks.renderString(template, { topics: data }) )
})
// Adding a new topic to the homepage
server.get('/add', function(req, res) {

})
// Getting a particular discussion
server.get('/page/:id', function(req, res) {
  id = req.params.id
  res.send( nunjucks.renderString(template, data[id]) )
})
// Add a new message to the discussion
server.get('/add/:id', function(req, res) {

})

server.listen(8888)
