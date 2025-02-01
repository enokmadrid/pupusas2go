require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
};

exports.handler = async (event, context) => {
  // Handle CORS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Validate HTTP method and body
  if (!event.body || event.httpMethod !== 'POST') {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        status: 'invalid HTTP method'
      })
    };
  }

  // Parse the request body
  const data = JSON.parse(event.body);

  // Validate required fields
  if (!data.stripeToken || !data.stripeAmt || !data.stripeIdempotency) {
    console.error("Required information is missing.");
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        status: 'Missing required information'
      })
    };
  }

  // Stripe payment processing
  try {
    let receipt_url;
    let newCustomer;

        // Create a new Stripe customer
        await stripe.customers.create({
          name: data.stripeName,
          email: data.stripeEmail,
          phone: data.stripePhone,
          address: data.stripeAddress,
          source: data.stripeToken
        })
        .then(customer => {
          console.log(`Customer created: ${customer.id}`); // Log customer ID
          newCustomer = customer;
  
          console.log(
            `Starting the charges, amount: ${data.stripeAmt}, email: ${data.stripeEmail}`
          );
  
          // Create a charge for the customer
          return stripe.charges.create(
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
            console.log(`Charge successful: ${result.id}`); // Log charge ID
            console.log(`Receipt URL: ${result.receipt_url}`); // Log receipt URL
            receipt_url = result.receipt_url;
          });
        });
  
      // Return success response
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: "Payment successful",
          receipt_url: receipt_url,
          customer_id: newCustomer.id
        })
      };
    } catch (err) {
      console.error(`Payment failed: ${err.message}`); // Log the error
  
      // Return error response
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          status: "Payment failed",
          error: err.message // Include error message for debugging
        })
      };
    }
  };