var express = require("express");
var bodyParser = require("body-parser");
var request = require("request");
var apiai = require('apiai');



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
    console.log("facebook request");
    if (req.body.object === 'page') 
    {
        req.body.entry.forEach(entry => {
            entry.messaging.forEach(event => {
                if (event.message && event.message.text) 
                {
                    processMessage(event);
                }
            });
        });

        res.status(200).end();
    }
});


function SendMessageFacebookChat(event, message) 
{
  let sender = event.sender.id;

  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: FACEBOOK_ACCESS_TOKEN},
    method: 'POST',
    json: {
      recipient: {id: sender},
      message: message
    }
  }, function (error, response) {
    if (error) {
        console.log('Error sending message: ', error);
    } else if (response.body.error) {
        console.log('Error: ', response.body.error);
    }
  });
}


//APIAI integration
function processMessage(event)
{
    var apiaiapp = apiai("21cfd0e76ebf40eab3bf515b96984d90", { language: 'es' });
    console.log("processing message");
    var requestapiai = apiaiapp.textRequest(event.message.text, 
    {
        sessionId: 'sessionidprueba'
    });

    requestapiai.on('response', function(response) 
    {
        console.log(response);
        var text_response = response.result.fulfillment.speech;

        var message = GetTextMessage(text_response);

        var action = response.result.action; 
        var actionIncomplete  = response.result.actionIncomplete;

        //Action completed
        if(action == "search_availability_trip" && !actionIncomplete)
        {
            console.log("sending air message");
            message = GetAirMessage();
        }

        if(action == "search_availability_hotel" && !actionIncomplete)
        {
            console.log("sending hotel message");
            message = GetHotelMessage();

        }

        SendMessageFacebookChat(event, message);
        
    });

    requestapiai.on('error', function(error) {
        console.log(error);
    });

    requestapiai.end();

}

function GetTextMessage(text_response)
{
    return {text: text_response};
}

function GetHotelMessage()
{
    var hotel_message =
        {
            "attachment":{
              "type":"template",
              "payload":{
                "template_type":"generic",
                "elements":[
                   {
                    "title":"Welcome to Peter's Hats",
                    "image_url":"https://photos.mandarinoriental.com/is/image/MandarinOriental/santiago-hotel-exterior-pool?wid=720&hei=1080&fmt=jpeg&qlt=75,0&op_sharpen=0&resMode=sharp2&op_usm=0.8,0.8,5,0&iccEmbed=0&printRes=72&fit=crop",
                    "subtitle":"We've got the right hat for everyone.",
                    "default_action": {
                      "type": "web_url",
                      "url": "https://nodetestproject.herokuapp.com/",
                      "messenger_extensions": false,
                      "webview_height_ratio": "tall",
                      "fallback_url": "https://nodetestproject.herokuapp.com/"
                    },
                    "buttons":[
                      {
                        "type":"web_url",
                        "url":"https://nodetestproject.herokuapp.com/",
                        "title":"View Website"
                      },{
                        "type":"postback",
                        "title":"Start Chatting",
                        "payload":"DEVELOPER_DEFINED_PAYLOAD"
                      }              
                    ]      
                  }
                ]
              }
            }
      };

    return hotel_message;
}

function GetAirMessage()
{
    var flight_message = 
    {"message": {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "airline_boardingpass",
            "intro_message": "You are checked in.",
            "locale": "en_US",
            "boarding_pass": [
              {
                "passenger_name": "SMITH\/NICOLAS",
                "pnr_number": "CG4X7U",
                "seat": "74J",            
                "logo_image_url": "https:\/\/www.example.com\/en\/logo.png",
                "header_image_url": "https:\/\/www.example.com\/en\/fb\/header.png",
                "qr_code": "M1SMITH\/NICOLAS  CG4X7U nawouehgawgnapwi3jfa0wfh",
                "above_bar_code_image_url": "https:\/\/www.example.com\/en\/PLAT.png",
                "auxiliary_fields": [
                  {
                    "label": "Terminal",
                    "value": "T1"
                  },
                  {
                    "label": "Departure",
                    "value": "30OCT 19:05"
                  }
                ],
                "secondary_fields": [
                  {
                    "label": "Boarding",
                    "value": "18:30"
                  },
                  {
                    "label": "Gate",
                    "value": "D57"
                  },
                  {
                    "label": "Seat",
                    "value": "74J"
                  },
                  {
                    "label": "Sec.Nr.",
                    "value": "003"
                  }
                ],
                "flight_info": {
                  "flight_number": "KL0642",
                  "departure_airport": {
                    "airport_code": "JFK",
                    "city": "New York",
                    "terminal": "T1",
                    "gate": "D57"
                  },
                  "arrival_airport": {
                    "airport_code": "AMS",
                    "city": "Amsterdam"
                  },
                  "flight_schedule": {
                    "departure_time": "2016-01-02T19:05",
                    "arrival_time": "2016-01-05T17:30"
                  }
                }
              }
            ]
          }
        }
      }
    };

  return flight_message;

}