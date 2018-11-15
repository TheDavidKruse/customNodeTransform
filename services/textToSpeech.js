const fs = require('fs');
const {
  Writable
} = require("stream")

const keyFilename = __dirname + "./../.resources/hello.json"

// Imports the Google Cloud client library
const textToSpeech = require('@google-cloud/text-to-speech');

// class myWritestream extends Writable{
//     _write(chunk, end, next){
//         console.log(chunk)
//     }


// }


const generateAndSendT2SResponse = (text, callback) => {
  // Creates a client
  const client = new textToSpeech.TextToSpeechClient({
    keyFilename
  });

  // Construct the request
  const request = {
    input: {
      text: `
      Barry, I'm talking to you!
      
        
      You coming?
      
        
      Got everything?
      
        
      All set!
      
        
      Go ahead. I'll catch up.
      
        
      Don't be too long.
      
        
      Watch this!
      
        
      Vanessa!
      
        
      - We're still here.
      - I told you not to yell at him.
      
        
      He doesn't respond to yelling!
      
        
      - Then why yell at me?
      - Because you don't listen!
      
        
      I'm not listening to this.
      
        
      Sorry, I've gotta go.
      
        
      - Where are you going?
      - I'm meeting a friend.
      
        
      A girl? Is this why you can't decide?
      
        
      Bye.
      
        
      I just hope she's Bee-ish.`
    },
    // Select the language and SSML Voice Gender (optional)
    voice: {
      languageCode: 'en-US',
      ssmlGender: 'NEUTRAL'
    },
    // Select the type of audio encoding
    audioConfig: {
      audioEncoding: 'MP3'
    },
  };

  // Performs the Text-to-Speech request
  client.synthesizeSpeech(request, (err, response) => {
    console.log("INTERNAL RESPONSE",response);
    if (err) {
      console.error('ERROR:', err);
      return;
    }
    callback(response.audioContent || Buffer.from("Hello world my name is shameesh girthenstein"))

  });

};

function readRangeHeader(range, totalLength) {

  if (range == null || range.length == 0)
    return null;
  
  var array = range.split(/bytes=([0-9]*)-([0-9]*)/);
  var start = parseInt(array[1]);
  var end = parseInt(array[2]);
  var result = {
    Start: isNaN(start) ? 0 : start,
    End: isNaN(end) ? (totalLength - 1) : end
  };
  
  if (!isNaN(start) && isNaN(end)) {
    result.Start = start;
    result.End = totalLength - 1;
  }
  
  if (isNaN(start) && !isNaN(end)) {
    result.Start = totalLength - end;
    result.End = totalLength - 1;
  }
  
  return result;
  }

module.exports = {
  generateAndSendT2SResponse,
  readRangeHeader
}