'use strict';
import {readFileSync} from "fs";

// Store data in an object to keep the global namespace clean. In an actual implementation this would be interfacing a database...
function Data() {
  
  // Custom Game
  this.customGames = {};
  this.customGames['test'] = {
    lang: "en",
    participants: [],
    selectedGames: [],
    gamePin: '', //game pin sparas som namnet på objektet, behövs den då här? /sebbe
    selectedMinutes: 60// Var ska tiden sparas? Vi vill kunna hämta tiden som är kvar för att veta när nästa spel ska köras igång! /sebbe
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

Data.prototype.pollExists = function (pollId) {
  return typeof this.polls[pollId] !== "undefined"
}

// - Custom Game -

Data.prototype.generateGamePin = function () {
  let pin;
  do {
    pin = Math.floor(100000 + Math.random() * 900000).toString();
  } while (this.pollExists(pin)); // Säkerställ att PIN är unik... behövs detta? /sebbe
  return pin;
};

Data.prototype.createCustomGame = function (lang = "en") { // lang = "en" ???
  const pin = this.generateGamePin(); 
  this.createPoll(pin, lang); 
  this.gamePin = pin;

  if (!this.pollExists(pin)) { //behövs denna if-sats? /sebbe
    let customGame = {};
    customGame.lang = lang;  
    customGame.participants = [];
    customGame.selectedGames = [];
    customGame.selectedMinutes = 60;
    this.customGames[pin] = customGame;
    console.log("Custom Game created", pin, customGame);
  };
  return pin;
};

Data.prototype.getPin = function(){
  return 10; //fix this
};

Data.prototype.storeGameData = function (gameData){

  // Update the gameData
  let customGame = {};
  // customGame.lang = gameData.lang; // För närvarande skickas denna inte.. för den finns inte i CustomGamesView.vue
  customGame.participants = gameData.participants;
  customGame.selectedGames = gameData.selectedGames;
  customGame.selectedMinutes = gameData.selectedMinutes;
  this.customGames[gameData.gamePin] = customGame;

  console.log("Reached to data.storeGameData");
}
Data.prototype.getCustomGameParticipants = function(gamePin) {
  const game = this.customGames[gamePin];
  console.log("participants requested for custom game: ", gamePin);
  if (this.pollExists(gamePin)) { 
    return game.participants;
  }
  return [];
}

Data.prototype.participateInCustomGame = function(gamePin, name) {
  console.log("Participant will be added to custom game:", gamePin, name);
  if (this.pollExists(gamePin)) {
    this.customGames[gamePin].participants.push({name: name})
  }
}

Data.prototype.getUILabels = function (lang) {
  //check if lang is valid before trying to load the dictionary file
  if (!["en", "sv"].some( el => el === lang))
    lang = "en";
  const labels = readFileSync("./server/data/labels-" + lang + ".json");
  return JSON.parse(labels);
}


// - Poll -
Data.prototype.createPoll = function(pollId, lang="en") {
  if (!this.pollExists(pollId)) {
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
  if (this.pollExists(pollId)) {
    return this.polls[pollId];
  }
  return {};
}

Data.prototype.participateInPoll = function(pollId, name) {
  console.log("participant will be added to", pollId, name);
  if (this.pollExists(pollId)) {
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
  if (this.pollExists(pollId)) {
    this.polls[pollId].questions.push(q);
  }
}

Data.prototype.getQuestion = function(pollId, qId = null) {
  if (this.pollExists(pollId)) {
    const poll = this.polls[pollId];
    if (qId !== null) {
      poll.currentQuestion = qId;
    }
    return poll.questions[poll.currentQuestion];
  }
  return {}
}

Data.prototype.getSubmittedAnswers = function(pollId) {
  if (this.pollExists(pollId)) {
    const poll = this.polls[pollId];
    const answers = poll.answers[poll.currentQuestion];
    if (typeof poll.questions[poll.currentQuestion] !== 'undefined') {
      return answers;
    }
  }
  return {}
}

Data.prototype.submitAnswer = function(pollId, answer) {
  if (this.pollExists(pollId)) {
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

export { Data };