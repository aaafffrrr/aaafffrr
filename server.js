const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the "public" directory

const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

app.post('/charge', async (req, res) => {
  try {
    const { first_name, last_name, email, address, city, state, postal_code, country, token } = req.body;

    // Create a customer
    const customer = await stripeClient.customers.create({
      name: `${first_name} ${last_name}`,
      email: email,
      address: {
        line1: address,
        city: city,
        state: state,
        postal_code: postal_code,
        country: country,
      },
      source: token,
    });

    // Create a charge
    const charge = await stripeClient.charges.create({
      amount: 36597, // Amount in cents
      currency: 'usd',
      customer: customer.id,
      description: 'Subscription payment',
    });

    res.json({ success: true, charge: charge });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
