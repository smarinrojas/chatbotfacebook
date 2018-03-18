var express = require("express");
var bodyParser = require("body-parser");

var app = express();
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.listen(process.env.PORT || 3000, function() {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

// Server index page
app.get("/", function(req, res) {
    res.send("Deployed!");
});

var VERIFY_TOKEN = "tourismbot";
var FACEBOOK_ACCESS_TOKEN = "a3578b2682bd9ed737a7bdfc1f5a273f";
var APP_SECRET_KEY = "0d7cb6bfaedc1250699525be7d7bec1a";
var APP_IDENTIFIER = "2038645103020167";


// Facebook Webhook
// Used for verification
app.get("/webhook", function(req, res) {
    if (req.query["hub.verify_token"] === "tourismbot") {
        console.log("Verified webhook");
        res.status(200).send(req.query["hub.challenge"]);
    } else {
        console.error("Verification failed. The tokens do not match.");
        res.sendStatus(403);
    }
});

app.post('/webhook', function(req, res)
{
    console.log(req);
    if (req.body.object === 'page') 
    {
        req.body.entry.forEach(entry => {
            entry.messaging.forEach(event => {
                if (event.message && event.message.text) {
                    sendMessage(event);
                }
            });
        });

        res.status(200).end();
    }
});



function sendMessage(event) {
  let sender = event.sender.id;
  let text = event.message.text;

  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: FACEBOOK_ACCESS_TOKEN},
    method: 'POST',
    json: {
      recipient: {id: sender},
      message: {text: text}
    }
  }, function (error, response) {
    if (error) {
        console.log('Error sending message: ', error);
    } else if (response.body.error) {
        console.log('Error: ', response.body.error);
    }
  });
}