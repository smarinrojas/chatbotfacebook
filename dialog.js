var apiai = require('apiai');

var apiaiapp = apiai("21cfd0e76ebf40eab3bf515b96984d90", 
{
    language: 'es'
});

var request = apiaiapp.textRequest('necesito un hotel', 
{
    sessionId: 'sessionidprueba'
});

request.on('response', function(response) {
    console.log(response);
});

request.on('error', function(error) {
    console.log(error);
});

request.end();