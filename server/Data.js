'use strict';
import {readFileSync} from "fs";


// Store data in an object to keep the global namespace clean. In an actual implementation this would be interfacing a database...
function Data() {
  // TODO: Uppdatera customgames['test'] så att den ser exakt ut som ett äkta spel
  // Custom Game
  this.countDown = null;
  this.customGames = {};
  this.customGames['test'] = {
 
    participants: [],
    selectedGames: [],
    selectedMinutes: 60,
    gameStarted: false,
    playerAnswers: {},
  };
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

Data.prototype.createCustomGame = function () { // lang = "en" ???
  const pin = this.generateGamePin(); 
  // TODO: If there currently is a game with the same pin. The older game will be overwritten. This issue should probably be solved in CustomGamesView.vue /sebbe
  let customGame = {};
 
  customGame.participants = [];
  customGame.selectedGames = [];
  customGame.selectedMinutes = 60; // 60 minutes default
  customGame.remainingTime = 3600; //
  customGame.gameStarted = false;
  customGame.customQuestions = {};
  customGame.useCustomQuestions = false;

  

  this.customGames[pin] = customGame;
  
  console.log("Custom Game created", pin, customGame);
  return { pin, customGame };
};


Data.prototype.createCustomGameAlt = function (pin, lang) { // lang = "en" ???
  // TODO: If there currently is a game with the same pin. The older game will be overwritten. This issue should probably be solved in CustomGamesView.vue /sebbe
  let customGame = {};
  customGame.lang = lang;  
  customGame.participants = [];
  customGame.selectedGames = [];
  customGame.selectedMinutes = 60; // 60 minutes default
  customGame.remainingTime = 3600; //
  customGame.gameStarted = false;
  // customGame.customQuestions = {};
  // customGame.useCustomQuestions = false;

  this.customGames[pin] = customGame;
  
  console.log("Custom Game created", pin, customGame);
  return { customGame };
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
      name: playerObj.name || "Anonymous", // Anonymous??? ta bort eller?
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
    const gameData = this.customGames[gamePin];

    // Delete from participants array
    const participants = gameData.participants;
    gameData.participants = participants.filter(
      (participant) => participant.name !== userName
    );
    console.log("Deleted user: ", userName, " from gamePin: ", gamePin, "   Current participants: ", gameData.participants);

    // Delete from ThisOrThat participants if exists
    if (gameData.ThisOrThat && gameData.ThisOrThat.participants) {
      if (gameData.ThisOrThat.participants[userName]) {
        delete gameData.ThisOrThat.participants[userName];
        console.log("Deleted user: ", userName, " from ThisOrThat participants of gamePin: ", gamePin, "   Current ThisOrThat participants: ", gameData.ThisOrThat.participants);
      }
    }
  } else {
    console.log(
      "ERROR, could not delete user because gamePin does not exist!"
    );
  }
};



Data.prototype.getUILabels = function (lang) {
  //check if lang is valid before trying to load the dictionary file
  if (!["en", "sv"].some( el => el === lang))
    lang = "en";
  const labels = readFileSync("./server/data/labels-" + lang + ".json");
  return JSON.parse(labels);
};

Data.prototype.getQuestions = function (lang, gamePin, whichQuiz) {
  // Kontrollera om språket är giltigt, annars standard till engelska
  if (!["en", "sv"].includes(lang)) {
    lang = "en";
  }

  // Läs in standardfrågor från den lokala filen baserat på språk
  const standardQuestions = JSON.parse(readFileSync(`./server/data/questions-${whichQuiz}-${lang}.json`));
  console.log(`./server/data/questions-${whichQuiz}-${lang}.json`)
  // Kontrollera om spelet existerar
  if (this.customGameExists(gamePin)) {
    const gameData = this.customGames[gamePin];
    const quizData = gameData?.allCustomQuestions?.[whichQuiz]; // Hämtar data för det specifika quizet

    const customQuestions = quizData?.customQuestions; // Anpassade frågor
    const useCustomQuestions = quizData?.useCustomQuestions; // Flagga för att använda anpassade frågor
  
    // Kontrollera om vi ska använda anpassade frågor
    if (useCustomQuestions && customQuestions && Array.isArray(customQuestions)) {
      return {
        questions: customQuestions
      };
    }
  } else {
    console.error(`Game with pin ${gamePin} does not exist.`);
  }

  return standardQuestions;
};

// ThisOrThat -------------------------------------------------------------------------------------
Data.prototype.getQuestions_ThisOrThat = function(lang) {
  if (!["en", "sv"].some( el => el === lang)) 
    lang = "en";
  const questions = JSON.parse(readFileSync("./server/data/questionsThisOrThat-" + lang + ".json"));
  return questions;
};

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
  try{
    let participantsArray = [];
    let newChosenParticipant = '';
    let randomNumber = 0;
    // On setup it takes participants from the global participants.
    if(isSetup_flag){
      participantsArray = Object.values(this.customGames[gamePin].participants); 
      console.log("--> if: ", participantsArray)
      randomNumber = Math.floor(Math.random() * participantsArray.length);
      newChosenParticipant = participantsArray[randomNumber].name;
    }
    // Then it picks from the game-local participants. This ensures players who join mid game are not candidates.
    else{
      participantsArray = Object.keys(this.customGames[gamePin].ThisOrThat.participants) 
      console.log("--> else: ", participantsArray)
      randomNumber = Math.floor(Math.random() * participantsArray.length);
      newChosenParticipant = participantsArray[randomNumber];
      this.customGames[gamePin].ThisOrThat.chosenParticipant = newChosenParticipant;
    }
    // On setup we just want it returned. This is because the method is called before the object is initiated.
    // All other times we also want it updated in Data.js
    return newChosenParticipant
  }
  catch {
    console.log("ERROR! -> could not get newChosenParticipant in Data.js")
  }
};
// ----- 1) Hjälpfunktioner -----
Data.prototype._getCorrectPlayersExcludingChosen = function(game, questionId, correctAnswer) {
  let correctPlayers = [];
  for (const [playerName, data] of Object.entries(game.ThisOrThat.participants)) {
    // Skippa chosenParticipant
    if (playerName === game.ThisOrThat.chosenParticipant) continue;
    // Om svaret matchar correctAnswer → lägg till
    if (data.answers[questionId] === correctAnswer) {
      correctPlayers.push(playerName);
    }
  }
  return correctPlayers;
};

Data.prototype._distributePoints_ThisOrThat = function(game, correctPlayers) {
  // Är det inga rätta spelare → avbryt
  if (correctPlayers.length === 0) return;
  
  const totalPlayers = Object.keys(game.ThisOrThat.participants).length;
  const pot = 200 * totalPlayers;  
  const share = Math.floor(pot / correctPlayers.length);

  correctPlayers.forEach(name => {
    // Uppdatera ThisOrThat-poäng
    //game.ThisOrThat.participants[name].points += share;
    // Uppdatera "ordinarie" scoreboard
    const generalParticipant = game.participants.find(p => p.name === name);
    if (generalParticipant) {
      generalParticipant.scoreGame4 += share;
    }
  });
};

// ----- 2) Själva huvudetoden -----
Data.prototype.correctQuestion_ThisOrThat = function(gamePin) {
  const game = this.customGames[gamePin];
  const qId = game.ThisOrThat.currentQuestion;
  const chosen = game.ThisOrThat.chosenParticipant;
  const correctAnswer = game.ThisOrThat.correctAnswers[qId];
  
  // Kolla om chosenParticipant har svarat
  const chosenAnswer = game.ThisOrThat.participants[chosen].answers[qId];
  if (!chosenAnswer) {
    // Om chosenParticipant inte svarat -> minus 1000 poäng
    console.log(`ChosenParticipant (${chosen}) svarade inte – ger -1000 poäng.`);
    const generalParticipant = game.participants.find(p => p.name === chosen);
    if (generalParticipant) {
      generalParticipant.scoreGame4 -= 1000;
    }
    return;
  }

  // Om chosenParticipant svarade -> hitta vilka andra som matchar
  const correctPlayers = this._getCorrectPlayersExcludingChosen(game, qId, correctAnswer);
  this._distributePoints_ThisOrThat(game, correctPlayers);
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

//WhosMostLikely------------------------------------------------------------------------------------

Data.prototype.setUpWhosMostLikely = function (gamePin) {
  if(this.customGames[gamePin].whosMostLikely) return this.customGames[gamePin].whosMostLikely;

  let whosMostLikely = {};
  let participants = {};

  for( const participant of this.customGames[gamePin].participants) {
    participants[participant.name] = {answers: {}, points: 0}
  }
  whosMostLikely.participants = participants;
  whosMostLikely.correctAnswers = {};
  whosMostLikely.currentQuestionIndex = 0;
  this.customGames[gamePin].whosMostLikely = whosMostLikely;
  return whosMostLikely;
};

Data.prototype.generateAnswerAlternatives = function(participants){
  const namesOfParticipant = Object.keys(participants);
  // Skapa en kopia av arrayen (om du vill undvika att påverka 'namesOfParticipant')
  const listOfParticipantsNames = [...namesOfParticipant]; 

  // Om fler än 4 deltagare, shuffla och ta ut 4 av dem:
  if (listOfParticipantsNames.length > 4) {
    for (let i = listOfParticipantsNames.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      // Korrekt sätt att byta plats på två element
      [listOfParticipantsNames[i], listOfParticipantsNames[j]] 
        = [listOfParticipantsNames[j], listOfParticipantsNames[i]];
    }
    // Returnera 4 slumpmässiga deltagare
    return listOfParticipantsNames.slice(0, 4);
  } else {
    // Om färre än 4 deltagare
    return listOfParticipantsNames;
  }
};


 //12 jan
Data.prototype.addAnswerAlternatives = function(questionObj, participants) {
  if (!questionObj || !Array.isArray(questionObj.questions)) {
    console.error("Expected an object with a 'questions' array, but got:", questionObj);
    return [];
  }
  questionObj.questions.forEach(question => {
      const answers = this.generateAnswerAlternatives(participants);
      question.answers = answers.map((name, index) => ({
          id: index + 1,
          answer: name,
      }));
  });
  return questionObj.questions
}

Data.prototype.storeAnswer = function(gamePin, userName, answerObj) {
  const game = this.customGames[gamePin];
  if (!game || !game.whosMostLikely) {
    console.error(`Spelet med PIN ${gamePin} existerar inte eller är inte konfigurerat för "WhosMostLikely".`);
    return null;
  }

  const questionId = answerObj.questionId -1;
  game.whosMostLikely.participants[userName].answers[questionId] = answerObj;
  console.log(game.whosMostLikely.participants[userName].answers[questionId])

}
Data.prototype.calculateCorrectAnswer = function(gamePin) {
  const game = this.customGames[gamePin];
  const currentQuestionIndex = game.whosMostLikely.currentQuestionIndex;

  // Kolla om frågan redan är poängsatt
  if (game.whosMostLikely.correctAnswers[currentQuestionIndex]?.isCalculated) {
    console.log(`Fråga ${currentQuestionIndex} är redan beräknad, avbryter...`);
    // Returnera redan uträknat svar om du vill
    return game.whosMostLikely.correctAnswers[currentQuestionIndex].winningAnswers;
  }

  const participants = game.whosMostLikely.participants;
  // 1) Samla in svaren
  const answers = Object.values(participants).map(
    participant => participant.answers[currentQuestionIndex]?.answerText
  );

  // 2) Räkna röster
  const answerCounts = answers.reduce((counts, answer) => {
    if (answer) {
      counts[answer] = (counts[answer] || 0) + 1;
    }
    return counts;
  }, {});

  const maxCount = Math.max(...Object.values(answerCounts));
  const winningAnswers = Object.entries(answerCounts)
    .filter(([_, count]) => count === maxCount)
    .map(([answer]) => answer);

  // Spara "vinnarsvaren"
  game.whosMostLikely.correctAnswers[currentQuestionIndex] = {
    winningAnswers,
    isCalculated: true // <-- Markera att det redan är gjort
  };

  console.log(
    `\nDet mest valda svaret för fråga ${currentQuestionIndex} är "${winningAnswers}" med ${maxCount} röster.`
  );

  // 3) Ge 500 poäng
  for (const [playerName, data] of Object.entries(participants)) {
    const playerAnswer = data.answers[currentQuestionIndex]?.answerText;
    if (playerAnswer && winningAnswers.includes(playerAnswer)) {
      const generalParticipant = game.participants.find(p => p.name === playerName);
      if (generalParticipant) {
        generalParticipant.scoreGame2 += 500; // Du kan byta fält om du vill
        console.log("Uppdaterar poäng", generalParticipant.scoreGame2);
      }
    }
  }

  return winningAnswers;
};





Data.prototype.nextQuestionWhosMostLikelyTo = function (gamePin) {
  const game = this.customGames[gamePin];
  game.whosMostLikely.currentQuestionIndex++;
  return game.whosMostLikely.currentQuestionIndex
}
//--------------------------------------------------------------------------------------------------
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
  try {
    // console.log("Timer: --> this.customGames[gamePin] =", this.customGames[gamePin]);
    // console.log("Timer: --> returning remainingTime: ", this.customGames[gamePin].remainingTime, " for gamePin: ", gamePin);
    return this.customGames[gamePin].remainingTime;
  } catch (error) {
    console.error("Error accessing game data for gamePin:", gamePin, "Error details:", error);
    return null; 
  }
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

Data.prototype.saveQuestions = function(gamePin, customQuestions, useCustomQuestions, whichQuiz) {

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
  this.customGames[gamePin].allCustomQuestions[whichQuiz] = {
    customQuestions,
    useCustomQuestions
  };

  console.log("Saved questions: ", this.customGames[gamePin].allCustomQuestions[whichQuiz]);
 
  console.log("SNälla fungera", this.customGames[gamePin])
  console.log("original getquestions", this.getQuestions("en", gamePin, whichQuiz));

  //console.log("seb getquestions", this.getQuestions_ThisOrThat("en", gamePin, whichQuiz));
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