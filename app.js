var express = require("express");
var bodyParser = require("body-parser");
var request = require("request");

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
var FACEBOOK_ACCESS_TOKEN = "EAAcZBIw0wSIcBAFYodwZBq40CdQnZC2HzVoFcRKbQHWlLNbNwPPSZCEAvZAEYDSPO9fDY4CgwOHCrBCmlAyquNd4WZAGZBCWWCCebjfIQjhP4xfvTIZAiPZCOT9lq7j5aIYOuaXk18Epl6j5gYIkxe3UHX5PObcoItVjKZBboPqVaRvQZDZD";
var APP_SECRET_KEY = "0d7cb6bfaedc1250699525be7d7bec1a";
var APP_IDENTIFIER = "2038645103020167";


app.get('/terms', function(req, res)
{
  res.send("Terms and conditions!");
});


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
    if (req.body.object === 'page') 
    {
        req.body.entry.forEach(entry => {
            entry.messaging.forEach(event => {
                if (event.message && event.message.text) 
                {
                    console.log(req);
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