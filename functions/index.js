require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
};

exports.handler = async (event, context) => {
  if (!event.body || event.httpMethod !== 'POST') {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        status: 'invalid http method'
      })
    }
  }

  const data = JSON.parse(event.body)
  console.log(data);

  if (!data.stripeToken || !data.stripeAmt || !data.stripeIdempotency) {
    console.error("Required information is missing.")

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        status: "missing information"
      })
    }
  }

  // stripe payment processing begins here
  try {
    let receipt_url;
    let customer;

    await stripe.customers
      .create({
        name: data.stripeName,
        email: data.stripeEmail,
        phone: data.stripePhone,
        address: data.stripeAddress,
        source: data.stripeToken
      })
      .then(result => {
        console.log(
          `starting the charges, amt: ${data.stripeAmt}, email: ${
            data.stripeEmail
          }`
        )

        console.log(`Your New Customer is: ${result}`);
        
        return stripe.charges
          .create(
            {
              currency: "usd",
              amount: data.stripeAmt,
              receipt_email: data.stripeEmail,
              customer: customer.id,
              description: "Sample Charge"
            },
            {
              idempotencyKey: data.stripeIdempotency
            }
          )
          .then(result => {
            console.log(`Your new payment charge is: ${result}`);
            receipt_url = result;
          })
      })

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: "it works! beep boop",
        customer: customer.id,
        receipt: receipt_url
      })
    }
  } catch (err) {
    console.log(err)

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        status: err
      })
    }
  }
}