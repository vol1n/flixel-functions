const { app, input } = require('@azure/functions');

const sqlInput = input.sql({
    commandText: 'select [Id], [Subscription], [UserId], [Status], [EndDate], [StripeUserId],[StripeSubscriptionId] from dbo.users where UserId = @UserId',
    commandType: 'Text',
    parameters: '@UserId={Query.UserId}',
    connectionStringSetting: 'SqlConnectionString',
});

app.http('VerifyId', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    extraInputs: [sqlInput],
       

    handler: async (req, context) => {
        //  body = await req.json()
        context.log('JavaScript HTTP trigger function processed a request for VerifyId');
        //context.log(body.clientPrincipal)
        const toDoItem = context.extraInputs.get(sqlInput);
        context.log(toDoItem)
        

    async function newUser(userId) {//if the sql query returns no results, then the user is new
  
        const gql = `
            query getByUserId($userId: String!) {
              person_by_pk(UserId: $userId) {
                Id
                UserId
                Status
                EndDate
              }
            }`;
        
        const query = {
          query: gql,
          variables: {
            userId: userId,
          },
        };
      
        const endpoint = "http://127.0.0.1:4280/data-api/graphql";
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(query),
        });
        const result = await response.json();
        console.table(result.data.person_by_pk);
        if (result.data.person_by_pk) {
          console.log("User already exists")
          return result.data.person_by_pk;
        } else {
          console.log("User does not exist")
          return null;
        }
      
    }
    
    // const name = (req.query.name || (req.body && req.body.name));

    // const responseMessage = name
    //     ? "Hello, " + name + ". This HTTP triggered function executed successfully."
    //     : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";
    //context.log(await JSON.stringify(req))
    //context.log(Query.id)
    return {
        headers: {
            "Access-Control-Allow-Origin": "*", // Set this to the specific origin(s) allowed to access the function.
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Credentials": true // Enable credentials support
          },
        // status: 200, /* Defaults to 200 */
        status: (toDoItem.length > 0)? 200:444,
        
        body: JSON.stringify({
          user: (toDoItem.length > 0)? toDoItem[0]:null//(await newUser(body.userId))
        })
        };
    }
});
