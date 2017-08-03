var express = require('express');
var stripeLibrary = require('stripe');

var app = express();
var stripe = stripeLibrary('sk_test_YOUR_STRIPE_SECRET_KEY');

var twilio = require('twilio');
var client = new twilio('TWILIO_APP_ID', 'TWILIO_API_KEY');

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded( { extended: false } ));

app.get('/', function(request, response) {
    response.sendFile(__dirname + '/index.html');
});

app.post('/charge', function(request, response) {
    var phone = request.body.phone;
    var token = request.body.stripeToken;

    // Create the charge for the customer
    stripe.charges.create({
        'amount': 100,
        'currency': 'usd',
        'description': 'Got some skrillah',
        'source': token
    })

    // If the charge is successful
    .then(function() {

        // Create a text message with twilio
        client.messages.create({
            body: 'Make JavaScript great again!',
            to: '+1' + phone,
            from: '+YOUR_TWILIO_PHONE',
            mediaUrl: 'https://blogs-images.forbes.com/robertwood/files/2016/02/Trump1.jpg'
        })
        .then(function() {
            response.sendFile(__dirname + '/thankyou.html');
        })
        .catch(function(error) {
            // TODO: if there is an error, send a message about it
            // TODO: refund the charge
        });

    })
    .catch(function(error) {
        console.log(error);
        response.send('put some real info in there!');
    });
});

app.listen(3000);
