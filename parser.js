'use strict';
exports.handler = function (event, context) {
    console.log(event);
    console.log(context);
    // TODO implement
    try {
        /*if (event.session.new) {
			onSessionStarted({requestId: event.request.requestId}, event.session);
		}*/
        if (event.request && event.request.type === "LaunchRequest") {
            onLaunch(event.request, event.session, function callback(sessionAttributes, speechletResponse) {
                context.succeed(buildResponse(sessionAttributes, speechletResponse));
            });
        }
        else if (event.request && event.request.type === "IntentRequest") {
            onIntent(event.request, event.session, function callback(sessionAttributes, speechletResponse) {
                context.succeed(buildResponse(sessionAttributes, speechletResponse));
            });
        }
        else if (event.request && event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    }
    catch (e) {
        context.fail("Exception: " + e);
    }
};

function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId + ", sessionId=" + session.sessionId);
}

function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId + ", sessionId=" + session.sessionId);
    getWelcomeResponse(callback);
}

function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId + ", sessionId=" + session.sessionId);
    var intent = intentRequest.intent
        , intentName = intentRequest.intent.name;
    console.log("\tintentName: " + intentName);
    if ("ReceiveNumberIntent" == intentName) {
        handleReceivingRequest(intent, session, callback);
    }
    else if ("AMAZON.StartOverIntent" === intentName) {
        getWelcomeResponse(callback);
    }
    else if ("AMAZON.RepeatIntent" === intentName) {
        handleRepeatRequest(intent, session, callback);
    }
    else if ("AMAZON.StopIntent" === intentName) {
        handleFinishSessionRequest(intent, session, callback);
    }
    else if ("AMAZON.CancelIntent" === intentName) {
        handleFinishSessionRequest(intent, session, callback);
    }
    else {
        throw "Invalid intent";
    }
}

function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId + ", sessionId=" + session.sessionId);
}

function handleReceivingRequest(intent, session, callback) {
    console.log("color----");
    var speechOutput;
    var red = intent.slots.RedNum.value;
    var blue = intent.slots.BlueNum.value;
    var green = intent.slots.GreenNum.value;
    if (red === null || red < 0 || red > 1023) {
        speechOutput = "Sorry, the value for red is not valid.";
    }
    else if (blue === null || blue < 0 || blue > 1023) {
        speechOutput = "Sorry, the value for blue is not valid. ";
    }
    else if (green === null || green < 0 || green > 1023) {
        speechOutput = "Sorry, the value for green is not valid. ";
    }
    else {
        speechOutput = "I changed the color of the light, with red changing to ";
        speechOutput += red + ", blue changing to " + blue + ", and green changing to " + green;
    }
    console.log("SPEECH OUTPUT: " + speechOutput);
    var sessionAttributes = {};
    var cardTitle = "";
    var repromptText = "";
    callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, true));
}

function getWelcomeResponse(callback) {
    console.log("get getWelcomeResponse");
    var cardTitle = "";
    var speechOutput = "Please choose a value "
    var repromptText = "";
    var shouldEndSession = false;
    var sessionAttributes = {};
    callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleRepeatRequest(intent, session, callback) {
    if (!session.attributes || !session.attributes.speechOutput) {
        getWelcomeResponse(callback);
    }
    else {
        callback(session.attributes, buildSpeechletResponseWithoutCard(session.attributes.speechOutput, session.attributes.repromptText, false));
    }
}

function handleFinishSessionRequest(intent, session, callback) {
    callback(session.attributes, buildSpeechletResponseWithoutCard("Good bye!", "", true));
}

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    output = "<speak>" + output + "</speak>";
    return {
        outputSpeech: {
            type: "SSML"
            , ssml: output
        }
        , card: {
            type: "Simple"
            , title: title
            , content: output
        }
        , reprompt: {
            outputSpeech: {
                type: "PlainText"
                , text: repromptText
            }
        }
        , shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    output = "<speak>" + output + "</speak>";
    return {
        outputSpeech: {
            type: "SSML"
            , ssml: output
        }
        , reprompt: {
            outputSpeech: {
                type: "PlainText"
                , text: repromptText
            }
        }
        , shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0"
        , sessionAttributes: sessionAttributes
        , response: speechletResponse
    };
}

function makeElementsPost(urlPath, args, callback) {
    var attributes = {
        urlPath: 'http://192.168.43.224:5000', 
        method : 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
            , 'Accept': '*.*'
        }
    }
        
        var reque = http.request(options, function (res) {
            console.log('STATUS: ' + res.statusCode);
            console.log('HEADERS: ' + JSON.stringify(res.headers));
            var body = "";
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log('BODY: ' + chunk);
                body += chunk;
            });
            res.on('end', function () {
                callback(body);
            });
        });
        reque.on('error', function (e) {
            console.log('problem with request: ' + e.message);
        });
        // write data to request body
        reque.write(postData);
        reque.end();
    
}
