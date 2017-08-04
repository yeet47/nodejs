To get this set up, you will have to sign up for [Stripe](https://stripe.com) and [Twilio](https://twilio.com). Copy `index.html`, `index.js`, and `package.json` into a folder.

You will need to have Node.js installed on your computer. Once you've copied everything into a folder, `cd` into it and run `npm install`.

- In index.html, you need to change `pk_test_YOUR_STRIPE_KEY_HERE` to your Stripe public key.
- In index.js, you will need to change `TWILIO_APP_ID` and `TWILIO_API_KEY` to the app ID and API key provided by Twilio, and `sk_test_YOUR_STRIPE_SECRET_KEY` to the secret key given to you by Stripe, and `YOUR_TWILIO_PHONE` to the phone number provided to you by Twilio.
