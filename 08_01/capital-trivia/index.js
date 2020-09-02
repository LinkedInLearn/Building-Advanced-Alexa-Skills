// This sample demonstrates using APL for a Trivia game using the Alexa Skills Kit SDK (v2)
const Alexa = require('ask-sdk-core');
const Welcome = require('./apl/welcome.json');
const Question = require('./apl/question.json');
const Data = require('./apl/sample-apl-data.json');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    
handle(handlerInput) {
    //initialize background images
    initBackground();
    
    //initialize questions and player score
    setSessionValue(handlerInput,'currentQuestion',0);
    setSessionValue(handlerInput,'score',0);
    
    const speechText = welcomeMessage;

      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();

  }    
};
  
//Handle no responses  
const NoIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent');
  },
  handle(handlerInput) {
    const speechText = `Goodbye`;
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .withShouldEndSession(true)
        .getResponse();
    }
};

//Display the question
const QuestionIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && ( Alexa.getIntentName(handlerInput.requestEnvelope) === 'QuestionIntent' || 
            handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent');
    },
    handle(handlerInput) {

    //Retrieving the current question details
    let questionNumber = getSessionValue(handlerInput, 'currentQuestion');

    let question = questionBank[questionNumber];
    let viewData = setViewData(Data, question);
    
    //Building quesiton text
    const speechText = buildQuestion(question);

      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();
  }
};

//Handling the user answer
const AnswerIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AnswerIntent';
    },
    handle(handlerInput) {

    //verify the answer
    let questionNumber = getSessionValue(handlerInput, 'currentQuestion');

    let question = questionBank[questionNumber];
    let speechText = ``;
    let correctFlag = true;
    
    let userAnswer = parseInt(handlerInput.requestEnvelope.request.intent.slots.answer.value || 0);
    
    if (question.answer !== userAnswer) {
        //answer given was incorrect
        correctFlag = false;
    } else {
        //answer was correct
        //increase player score
        let score = parseInt(getSessionValue(handlerInput, 'score'));
        setSessionValue(handlerInput,'score',++score);
    }
    
    //generating the response to the user
    speechText = correctFlag ? `<audio src="${correctSound}" /> You are correct. ` : `<audio src="${buzzerSound}" /> Sorry you are incorrect. `
    speechText += `The answer was ${question.answerText}. `;

    //determine if there are more questions in the question bank
    if ( parseInt(questionNumber) === (questionBank.length - 1)) {
        //No more questions
        //give total
        speechText += `You have reached the end of the game and there are no more questions. You got ${getSessionValue(handlerInput, 'score')} out of ${questionBank.length} correct.`;
        
        return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .withShouldEndSession(true)
        .getResponse();        
    } else {

      //incrementing the question since there are more in the question bank
      setSessionValue(handlerInput,'currentQuestion', ++questionNumber);

    speechText += `Are you ready for another question?`;

      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();
    }
    
  }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say, ask me a question';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Thanks for playing. Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        if(null!==handlerInput.requestEnvelope.request.error) {
            console.log(JSON.stringify(handlerInput.requestEnvelope.request.error));
        }

        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/******** VARIABLES ********/

//SET these variables
const backgroundImageUrl = ``;
const correctSound = ``;
const buzzerSound = ``;

const welcomeMessage = `Welcome to Capital Trivia, where your knowlege of world capitals will be tested. Are you ready to play?`;
const questionBank = [
    { "country" : "Ecuador",
      "options" : ["Roseau","Port-au-Prince", "Lima", "Quito"],
      "answer" : 4,
      "answerText" : "Quito"
    },
    { "country" : "Israel",
      "options" : ["Castries","Nairobi", "Jerusalem", "Oslo"],
      "answer" : 3,
      "answerText" : "Jerusalem"
    },        
    { "country" : "Hungary",
      "options" : ["Kampala","Budapest", "Tripoli", "Dakar"],
      "answer" : 2,
      "answerText" : "Budapest"
    },
    { "country" : "Singapore",
      "options" : ["Singapore","Jakarta", "Juba", "Kigali"],
      "answer" : 1,
      "answerText" : "Singapore"
    },
    { "country" : "Sweden",
      "options" : ["Reykjavik","Amsterdam", "Stockholm", "Bucharest"],
      "answer" : 3,
      "answerText" : "Stockholm"
    }    
    ];

/******** HELPER FUNCTIONS ********/

//Initalize background image for the game
function initBackground() {
    Welcome.datasources.bodyTemplate6Data.backgroundImage.sources[0].url = backgroundImageUrl;
    Data.listTemplate1Metadata.backgroundImage.sources[0].url = backgroundImageUrl;
}

//Convenience function to determine if APL is supported
function supportsAPL(handlerInput) {
    const supportedInterfaces = handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
    const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
    return aplInterface !== null && aplInterface !== undefined;
}

//Mofifying APL data for the current question
function setViewData(sampleData, question) {
    let viewData = sampleData;
    viewData.listTemplate1Metadata.title = `What is the capital of ${question.country}?`;
    viewData.listTemplate1ListData.listPage.listItems[0].textContent.primaryText.text = question.options[0];
    viewData.listTemplate1ListData.listPage.listItems[1].textContent.primaryText.text = question.options[1];
    viewData.listTemplate1ListData.listPage.listItems[2].textContent.primaryText.text = question.options[2];
    viewData.listTemplate1ListData.listPage.listItems[3].textContent.primaryText.text = question.options[3];
    return viewData;
}

//Building out the question text response
function buildQuestion(question) {
    return `Here is your question. What is the capital of ${question.country}? Is it 1. ${question.options[0]}. 2. ${question.options[1]}. 3. ${question.options[2]}. Or 4. ${question.options[3]}.`;
}

//Convenience function for setting session values
function setSessionValue(handlerInput, name, value) {
    let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();    
    sessionAttributes[name] = value;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);       
}

//Convenience function for retrieving session values
function getSessionValue(handlerInput, name) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();    
    return sessionAttributes[name];  
}


// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        QuestionIntentHandler,
        AnswerIntentHandler,
        NoIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();
