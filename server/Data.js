'use strict';
import {readFileSync} from "fs";

// Store data in an object to keep the global namespace clean. In an actual implementation this would be interfacing a database...
function Data() {
  // TODO: Uppdatera customgames['test'] så att den ser exakt ut som ett äkta spel
  // Custom Game
  this.countDown = null;
  this.customGames = {};
  this.customGames['test'] = {
    lang: "en",
    participants: [],
    selectedGames: [],
    selectedMinutes: 60,
    gameStarted: false,
    playerAnswers: {},
  };

  

  // Poll
  this.polls = {};
  this.polls['test'] = {
    lang: "en",
    questions: [
      {q: "How old are you?", 
       a: ["0-13", "14-18", "19-25", "26-35", "36-45","45-"]
      },
      {q: "How much do you enjoy coding?", 
       a: ["1", "2", "3", "4", "5"]
      }
    ],
    answers: [],
    currentQuestion: 0,
    participants: []
  }
}

/***********************************************
For performance reasons, methods are added to the
prototype of the Data object/class
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
***********************************************/


// - Custom Game -
Data.prototype.customGameExists = function (gamePin) {
  return typeof this.customGames[gamePin] !== "undefined";
};

Data.prototype.generateGamePin = function () {
  let pin;
  do {
    pin = Math.floor(100000 + Math.random() * 900000).toString();
  } while (this.customGameExists(pin)); // Säkerställ att PIN är unik... behövs detta? Och är den inte bakåtvänd? /sebbe
  return pin;
};

Data.prototype.createCustomGame = function (lang = "en") { // lang = "en" ???
  const pin = this.generateGamePin(); 
  // TODO: If there currently is a game with the same pin. The older game will be overwritten. This issue should probably be solved in CustomGamesView.vue /sebbe
  let customGame = {};
  customGame.lang = lang;  
  customGame.participants = [];
  customGame.selectedGames = [];
  customGame.selectedMinutes = 60; // 60 minutes default
  customGame.remainingTime = 3600; //
  customGame.gameStarted = false;

  

  this.customGames[pin] = customGame;
  
  console.log("Custom Game created", pin, customGame);
  return { pin, customGame };
};

Data.prototype.storeGameDataAndStart = function (gameData){
  // Update the gameData and set gameStarted = true
  // console.log("gamedata:",gameData);
  // console.log("this.customgames",this.customGames)
 
  // customGame.lang = gameData.lang; // För närvarande skickas denna inte.. för den finns inte i CustomGamesView.vue
  this.customGames[gameData.gamePin].participants = gameData.participants;
  this.customGames[gameData.gamePin].selectedGames = gameData.selectedGames;
  this.customGames[gameData.gamePin].selectedMinutes = gameData.selectedMinutes;
  this.customGames[gameData.gamePin].remainingTime = gameData.selectedMinutes*60; // Convert to seconds
  this.customGames[gameData.gamePin].gameStarted = true;
  
  // If countdown is not already on -> start the countdown.
  if(!this.countDown) this.startCountDown(); 

  console.log("Reached to data.storeGameDataAndStart with current customGames: ", this.customGames[gameData.gamePin]);
};

Data.prototype.getGameData = function(gamePin) {
  if (this.customGameExists(gamePin)) { 
    console.log("gameData: ", this.customGames[gamePin]," requested for custom game: ", gamePin);
    return this.customGames[gamePin];
  }
  console.log("Requested gameData for non existing game... returning []")
  return []; //maybe returning an array is not the most convenient way... 
};
Data.prototype.getCustomGameParticipants = function(gamePin) {
  if (this.customGameExists(gamePin)) { 
    console.log("participants requested for custom game: ", gamePin);
    return this.customGames[gamePin].participants;
  }
  return [];  //maybe returning an array is not the most convenient way... 
};

Data.prototype.participateInCustomGame = function (gamePin, playerObj) {
  if (this.customGameExists(gamePin)) {
    const game = this.customGames[gamePin];
    game.participants.push({
      name: playerObj.name || "Anonymous",
      scoreGame1: playerObj.scoreGame1 || 0,
      scoreGame2: playerObj.scoreGame2 || 0,
      scoreGame3: playerObj.scoreGame3 || 0,
      scoreGame4: playerObj.scoreGame4 || 0
    });
    console.log("Updated participants:", game.participants);
  } else {
    console.error(`Game with pin ${gamePin} does not exist.`);
  }
};

Data.prototype.deleteUser = function (gamePin, userName) {
  if (this.customGameExists(gamePin)) {
    const participants = this.customGames[gamePin].participants;
    this.customGames[gamePin].participants = participants.filter(
      (participant) => participant.name !== userName
    );
    console.log("Deleted user: ", userName, " from gamePin: ", gamePin, "   Current participants: ", this.customGames[gamePin].participants)
  }
  else console.log("ERROR, could not delete user because gamePin does not exist!");
};

Data.prototype.getUILabels = function (lang) {
  //check if lang is valid before trying to load the dictionary file
  if (!["en", "sv"].some( el => el === lang))
    lang = "en";
  const labels = readFileSync("./server/data/labels-" + lang + ".json");
  return JSON.parse(labels);
};

Data.prototype.getQuestions = function (lang, gamePin, gameName) {
  //check if lang is valid before trying to load the dictionary file
  if (!["en", "sv"].some( el => el === lang))
    lang = "en";
  const standardQuestions = JSON.parse(readFileSync("./server/data/questions-" + lang + ".json"));
 

  if (this.customGameExists(gamePin)) {
    const gameData = this.customGames[gamePin];
    const allQuestions = gameData?.allCustomQuestions;
    const customQuestions = allQuestions?.[gameName]?.customQuestions;
    
    
    if(customQuestions && Array.isArray(customQuestions)){
      const questionObj = {
        questions: customQuestions
      }
      return questionObj
    } else{
    return standardQuestions
    }
  }
};

// ThisOrThat -------------------------------------------------------------------------------------
Data.prototype.setup_ThisOrThat = function(gamePin) {
  if(this.customGames[gamePin].ThisOrThat) return this.customGames[gamePin].ThisOrThat; // If it already exists
  let ThisOrThat = {};
  let participants = {};
  for(const participant of this.customGames[gamePin].participants){
    console.log("--> Adding '", participant, "' to participants list");
    participants[participant.name] = {answers: {}, points: 0}; 
  };
  ThisOrThat.participants = participants;
  ThisOrThat.chosenParticipant = this.newChosenParticipant(gamePin, true);
  ThisOrThat.correctAnswers = {};
  ThisOrThat.currentQuestion = 0;
  this.customGames[gamePin].ThisOrThat = ThisOrThat;
  return ThisOrThat;
};
Data.prototype.getQuestions_ThisOrThat = function(lang) {
  if (!["en", "sv"].some( el => el === lang)) 
    lang = "en";
  const questions = readFileSync("./server/data/questionsThisOrThat-" + lang + ".json");
  return JSON.parse(questions);
};
Data.prototype.answer_ThisOrThat = function(gamePin, userName, answerId) {
  // Add the answer to the given participant.
  const currentQuestion = this.customGames[gamePin].ThisOrThat.currentQuestion
  this.customGames[gamePin].ThisOrThat.participants[userName].answers[currentQuestion] = answerId;
  // If user is the chosen one, add the answer to correctAnswers array.
  if(userName === this.customGames[gamePin].ThisOrThat.chosenParticipant) {
    this.customGames[gamePin].ThisOrThat.correctAnswers[currentQuestion] = answerId;
  };
};
Data.prototype.newChosenParticipant = function(gamePin, isSetup_flag = false){

  const participantsArray = Object.values(this.customGames[gamePin].participants); //just nu är det totala antalet participants, även de som loggat in efter att spelet startat /sebbe
  const randomNumber = Math.floor(Math.random() * participantsArray.length);
  const newChosenParticipant = participantsArray[randomNumber].name;

  // On setup we just want it returned. This is because the method is called before the object is initiated.
  // All other times we just want it updated in Data.js
  if(isSetup_flag) {
    return newChosenParticipant;
  }; 
  this.customGames[gamePin].ThisOrThat.chosenParticipant = newChosenParticipant
};
Data.prototype.correctQuestion_ThisOrThat = function(gamePin) {
  
  const participantsArray = Object.entries(this.customGames[gamePin].ThisOrThat.participants);
  const correctAnswers = this.customGames[gamePin].ThisOrThat.correctAnswers;
  const questionId = this.customGames[gamePin].ThisOrThat.currentQuestion;
  console.log("-------> Inside correctQuestion_ThisOrThat", participantsArray, this.customGames[gamePin].ThisOrThat)
  // Add 10 points if answer is correct
  for(let [name, data] of participantsArray){
    if (data.answers[questionId] && data.answers[questionId] === correctAnswers[questionId]){
      this.customGames[gamePin].ThisOrThat.participants[name].points += 10;
    }
  }
};
Data.prototype.nextQuestion_ThisOrThat = function(gamePin) {
  return ++this.customGames[gamePin].ThisOrThat.currentQuestion; // Increase by 1
};
Data.prototype.roundInProgress = function(gamePin, isActive = null) {
  if(this.customGames[gamePin]){
    if (isActive === null) {
      return this.customGames[gamePin].ThisOrThat.roundInProgress;
    }
    this.customGames[gamePin].ThisOrThat.roundInProgress = isActive;
  }
};
Data.prototype.startGame_ThisOrThat = function(gamePin) {
  let elapsedSeconds = 0;

  const interval = setInterval(() => {
    elapsedSeconds++;
    if(elapsedSeconds === 20) { // Exactly when the question time runs out
      
      this.correctQuestion_ThisOrThat(gamePin, this.customGames[gamePin].ThisOrThat.currentQuestion);
      this.newChosenParticipant(gamePin);
      this.customGames[gamePin].ThisOrThat.currentQuestion++; //TODO: När den kört 15 eller 20 frågor borde spelet vara klart.

      io.to(gamePin).emit("roundUpdate", this.customGames[gamePin].ThisOrThat)
    }
    if(elapsedSeconds === 30) { // 30 seconds matches the combined duration of each phase in ThisOrThatComponent.vue. 
      elapsedSeconds=0; 
    }
  }, 1000); 
};
// -------------------------------------------------------------------------------------------------
// Timer -------------------------------------------------------------------------------------------
Data.prototype.startCountDown = function() {
  // Loop through all games and decrease remainingTime each second.
  this.countDown = setInterval(() => {
    for(const customGame of Object.values(this.customGames)) {
      if (customGame.remainingTime > 0) {
        customGame.remainingTime--;
      }
      // TODO: Delete customGame if it reaches 0?
    }
}, 1000);
};
Data.prototype.getGameTime = function (gamePin) { 
  console.log("Timer: --> this.customGames[gamePin] =", this.customGames[gamePin])
  console.log("Timer: --> returning remainingTime: ", this.customGames[gamePin].remainingTime, " for gamePin: ", gamePin)
  return this.customGames[gamePin].remainingTime;
};
// -------------------------------------------------------------------------------------------------

Data.prototype.setScore = function(gamePin, userName, newScore){
  console.log("går in i setscore")
  let game = this.customGames[gamePin]
  console.log("spelet är:", game );
  
 if (!game) {
    return;
  }
  const participant = game.participants.find(p => p.name === userName);
  participant.scoreGame1 = newScore;
  console.log("spelet efter uppdaterad poäng:", this.customGames[gamePin])
};

Data.prototype.saveQuestions = function(gamePin, allCustomQuestions, whichQuiz) {
  console.log("Saving questions for pin: ", gamePin);
  console.log("Saved questions: ", allCustomQuestions);
  console.log("Which quiz: ", whichQuiz);

  if (!this.customGameExists(gamePin)) {
    console.error(`Cannot save questions. Game with pin ${gamePin} does not exist.`);
    return;
  }
  if (!this.customGames[gamePin].allCustomQuestions) {
    this.customGames[gamePin].allCustomQuestions = {};
  }
  if (!this.customGames[gamePin].allCustomQuestions[whichQuiz]) {
    this.customGames[gamePin].allCustomQuestions[whichQuiz] = {};
  }
  this.customGames[gamePin].allCustomQuestions = allCustomQuestions;
 

  console.log("Saved questions for pin: ", gamePin, " are: ", this.customGames[gamePin].allCustomQuestions[whichQuiz]);

  // this.customGames[gamePin].selectedGames[whichQuiz].saveQuestions = savedQuestions;
  // this.customGames[gamePin].selectedGames[whichQuiz].useStandardQuestions = useStandardQuestions;
  // this.customGames[gamePin].selectedGames[whichQuiz].useOwnQuestions = useOwnQuestions;

  // Save
};
Data.prototype.deleteGame = function(gamePin) {
  console.log("Deleting game with pin: ", gamePin);

  console.log("this.customGames before deletion", this.customGames)

  if (this.customGames[gamePin]) {
    delete this.customGames[gamePin];
    console.log("Updated customGames:", this.customGames);
  } else {
    console.error("No game found for index:", gamePin);
}  
}

export { Data };