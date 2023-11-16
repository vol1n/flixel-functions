const { app } = require('@azure/functions');
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);


app.http('Stripe-checkout', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (req, context) => {
        context.log(process.env.STRIPE_PRIVATE_KEY)
        try {
            const body = await req.json();
            context.log("body", body)
            switch (body.level) {
              case 1:
                stripeLevel = process.env.STRIPE_LEVEL_1;
                break;
              case 2:
                stripeLevel = process.env.STRIPE_LEVEL_2;
                break;
              case 3:
                stripeLevel = process.env.STRIPE_LEVEL_3;
                break;
              default:
                stripeLevel = process.env.STRIPE_LEVEL_1;
                break;
            }
            
            const session = await stripe.checkout.sessions.create({
              payment_method_types: ['card'],
              line_items: [
                {
                  price: stripeLevel, // Replace with your product/price ID
                  quantity: 1,
                },
              ],
              client_reference_id: body.clientPrincipal.userId,
              mode: 'subscription',  
              success_url: 'http://localhost:4280/home',
              cancel_url: 'http://localhost:4280/home',
            });
        
            return {
              headers: {
                "Access-Control-Allow-Origin": "*", // Set this to the specific origin(s) allowed to access the function.
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Allow-Credentials": true // Enable credentials support
              },
              status: 200,
                sessionId: session.id,
                sessionUrl: session.url,
              
            };
          } catch (error) {
            context.log(error.message);
            return {
              headers: {
                "Access-Control-Allow-Origin": "*", // Set this to the specific origin(s) allowed to access the function.
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Allow-Credentials": true // Enable credentials support
              },
              status: 500,
              body: error.message + " " + process.env.STRIPE_PRIVATE_KEY,
            };
          }
        context.log(`Http function processed request for url "${request.url}"`);

        const name = request.query.get('name') || await request.text() || 'world';

        return { body: `Hello, ${name}!` };
    }
});
