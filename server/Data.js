'use strict';
import {readFileSync} from "fs";

// Store data in an object to keep the global namespace clean. In an actual implementation this would be interfacing a database...
function Data() {
  // TODO: Uppdatera customgames['test'] så att den ser exakt ut som ett äkta spel
  // Custom Game
  this.customGames = {};
  this.customGames['test'] = {
    lang: "en",
    participants: [],
    selectedGames: [],
    selectedMinutes: 60, // Var ska tiden sparas? Vi vill kunna hämta tiden som är kvar för att veta när nästa spel ska köras igång! /sebbe
    timerDisplay: '',
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
  //console.log("Checking if '", gamePin, "' is a customGame. Customgames: ", this.customGames)
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
  customGame.selectedMinutes = 60;
  customGame.timerDisplay = '';
  customGame.gameStarted = false;
  this.customGames[pin] = customGame;
  

  console.log("Custom Game created", pin, customGame);
  return pin;
};

Data.prototype.storeGameDataAndStart = function (gameData){
  // Update the gameData and set gameStarted = true
  console.log("gamedata:",gameData);

 
  // customGame.lang = gameData.lang; // För närvarande skickas denna inte.. för den finns inte i CustomGamesView.vue
  this.customGames[gameData.gamePin].participants = gameData.participants;
  this.customGames[gameData.gamePin].selectedGames = gameData.selectedGames;
  this.customGames[gameData.gamePin].selectedMinutes = gameData.selectedMinutes;
  this.customGames[gameData.gamePin].gameStarted = true;
  
  

  console.log("Reached to data.storeGameData with current customGames: ", this.customGames[gameData.gamePin]);
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
      isPlaying: playerObj.isPlaying || true,
      isAdmin: playerObj.isAdmin || false,
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
      (name) => name !== userName
    );
    console.log("Deleted user: ", userName, " from gamePin: ", gamePin, "   Current participants: ", this.participants)
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

Data.prototype.getQuestions = function (lang) {
  //check if lang is valid before trying to load the dictionary file
  if (!["en", "sv"].some( el => el === lang))
    lang = "en";
  const questions = readFileSync("./server/data/questions-" + lang + ".json");
  return JSON.parse(questions);
};

// ThisOrThat -------------------------------------------------------------------------------------
Data.prototype.setup_ThisOrThat = function(gamePin) {
  if(this.customGames[gamePin].ThisOrThat) return this.customGames[gamePin].ThisOrThat; // If it already exists
  let ThisOrThat = {};
  let participants = {};
  for(const participant of this.customGames[gamePin].participants){
    console.log("--> Adding '", participant, "' to participants list");
    participants[participant] = {answers: {}, points: 0}; 
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
  const newChosenParticipant = participantsArray[randomNumber];

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
  if (isActive === null) {
    return this.customGames[gamePin].ThisOrThat.roundInProgress;
  }
  this.customGames[gamePin].ThisOrThat.roundInProgress = isActive;
}
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

// - Poll ------------------------------------------------------------------------------------------
Data.prototype.pollExists = function (pollId) {
  return typeof this.polls[pollId] !== "undefined"
}
Data.prototype.createPoll = function(pollId, lang="en") {
  if (!this.gameExists(pollId)) {
    let poll = {};
    poll.lang = lang;  
    poll.questions = [];
    poll.answers = [];
    poll.participants = [];
    poll.currentQuestion = 0;              
    this.polls[pollId] = poll;
    console.log("poll created", pollId, poll);
  }
  return this.polls[pollId];
}
Data.prototype.getPoll = function(pollId) {
  if (this.gameExists(pollId)) {
    return this.polls[pollId];
  }
  return {};
}
Data.prototype.participateInPoll = function(pollId, name) {
  console.log("participant will be added to", pollId, name);
  if (this.gameExists(pollId)) {
    this.polls[pollId].participants.push({name: name, answers: []})
  }
}
Data.prototype.getParticipants = function(pollId) {
  const poll = this.polls[pollId];
  console.log("participants requested for", pollId);
  if (this.pollExists(pollId)) { 
    return this.polls[pollId].participants
  }
  return [];
}
Data.prototype.addQuestion = function(pollId, q) {
  if (this.gameExists(pollId)) {
    this.polls[pollId].questions.push(q);
  }
}
Data.prototype.getQuestion = function(pollId, qId = null) {
  if (this.gameExists(pollId)) {
    const poll = this.polls[pollId];
    if (qId !== null) {
      poll.currentQuestion = qId;
    }
    return poll.questions[poll.currentQuestion];
  }
  return {}
}
Data.prototype.getSubmittedAnswers = function(pollId) {
  if (this.gameExists(pollId)) {
    const poll = this.polls[pollId];
    const answers = poll.answers[poll.currentQuestion];
    if (typeof poll.questions[poll.currentQuestion] !== 'undefined') {
      return answers;
    }
  }
  return {}
}
Data.prototype.submitAnswer = function(pollId, answer) {
  if (this.gameExists(pollId)) {
    const poll = this.polls[pollId];
    let answers = poll.answers[poll.currentQuestion];
    // create answers object if no answers have yet been submitted
    if (typeof answers !== 'object') {
      answers = {};
      answers[answer] = 1;
      poll.answers.push(answers);
    }
    // create answer property if that specific answer has not yet been submitted
    else if (typeof answers[answer] === 'undefined') {
      answers[answer] = 1;
    }
    // if the property already exists, increase the number
    else
      answers[answer] += 1
    console.log("answers looks like ", answers, typeof answers);
  }
}

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
}
//Ändrat från pollId till gamePin
// Lägg denna funktion längst ned i prototypsektionen:
Data.prototype.startTimer = function (gamePin, selectedMinutes, io) {
  if (!this.customGameExists(gamePin)) {
      console.log("Game does not exist:", gamePin);
      return;
  } 

  const game = this.customGames[gamePin];
  game.selectedMinutes = selectedMinutes;
  const countDownDate = Date.now() + selectedMinutes * 60 * 1000;

  let lastMinute = null; // Inledningsvis null

  console.log("Starting timer for gamePin:", gamePin, "with", selectedMinutes, "minutes.");

  const interval = setInterval(() => {
      const now = Date.now();
      const distance = countDownDate - now;

      if (distance <= 0) {
          clearInterval(interval);
          game.timerDisplay = "Tiden är slut!";
          io.to(gamePin).emit("update-timer", {
              timerDisplay: game.timerDisplay,
              soundType: "alarm" // When there is no time left, play alarm
          });
          console.log("Timer ended for gamePin:", gamePin);
          return;
      }
      const totalSeconds = Math.floor(distance / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
 
 
      game.timerDisplay = `${minutes}m ${seconds}s`;


      // Play silence when starting the timer (lastMinute is null)
      if (lastMinute === null) {
          lastMinute = minutes; // Uppdate lastMinute
          io.to(gamePin).emit("update-timer", {
              timerDisplay: game.timerDisplay,
              soundType: "silence" // Play silence when start
          });
          console.log("Playing silence for gamePin:", gamePin);
          return;
      }

      
      if (totalSeconds % 60 === 0) {
          lastMinute = minutes; //  updating lastMinute 
          io.to(gamePin).emit("update-timer", {
              timerDisplay: game.timerDisplay,
              soundType: "alarm" // play alarm
          });
          console.log("Playing alarm for gamePin:", gamePin);
          return;
      }

      // Send  Timer-update without sound
      io.to(gamePin).emit("update-timer", {
          timerDisplay: game.timerDisplay,
          soundType: "soundType" // No soundsingla for other seconds
          
      });

      // denna rad orsakar problem för soundType finns inte /sebbe
      //console.log("Sending update-timer to gamePin:", gamePin, "TimerDisplay:", game.timerDisplay, "SoundType:", soundType);
  }, 1000); // Update every second
};




export { Data };