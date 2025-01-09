function sockets(io, socket, data) {
  
  
  socket.on("startingQuizQuestion", function(data){
    console.log(`startQuizForAll received for gamePin = ${data.gamePin}`)
    io.to(data.gamePin).emit("startGeneralQuizQuestion", data.currentQuestionIndex)
  })

  // Check if game exists
  socket.on("startMiniGame", function(data){
    const {gamePin, gameName} = data;
    io.to(gamePin).emit("onGameStart", gameName)
    
  })

  socket.on("updatePlayerPoints", (d) => {
    console.log("Uppdaterar poängen för klienten")
    data.setScore(d.gamePin, d.userName, d.newScore);
    io.to(d.gamePin).emit('updateGameData', data.getGameData(d.gamePin))
    
  })
  socket.on('customGameExists', function(gamePin) {
    socket.emit('gameExists', data.customGameExists(gamePin))
  });
  socket.on('getUILabels', function(lang) {
    socket.emit('uiLabels', data.getUILabels(lang));
  });

  // Games getQuestions
  socket.on('getQuestions', function(lang) {
    console.log("hämtar quiz frågor")
    socket.emit('generalQuestions', data.getQuestions(lang))
  });

  // ThisOrThat -------------------------------------------------------------------
  socket.on('setup_ThisOrThat', function(gamePin, lang) {
    console.log("Setting up ThisOrThat game, and returning questions");
    socket.emit('setup_ThisOrThat', data.setup_ThisOrThat(gamePin));
    socket.emit("getQuestions_ThisOrThat", data.getQuestions_ThisOrThat(lang));
  });
  socket.on('newChosenParticipant', function(gamePin) {
    io.to(gamePin).emit('newChosenParticipant', data.newChosenParticipant(gamePin));
  });
  socket.on('answer_ThisOrThat', function(gamePin, userName, answerId){
    data.answer_ThisOrThat(gamePin, userName, answerId);
  });
  socket.on("chosenParticipantAnswer", function(answer, gamePin){
    io.to(gamePin).emit('chosenParticipantAnswer', answer);
  });
  socket.on('correctQuestion_ThisOrThat', function(gamePin, questionId){
    data.correctQuestion_ThisOrThat(gamePin, questionId);
    //io.to(gamePin).emit('updateGameData', data.getGameData(gamePin))
  })
  socket.on('startRound', function(gamePin) {
    if(!data.roundInProgress(gamePin)){

      console.log("--> startRound inside if statement! gamePin: ", gamePin)
      data.roundInProgress(gamePin, true); // Set to true

      setTimeout(() => {
        data.correctQuestion_ThisOrThat(gamePin); // Correct the answers and add points
        data.newChosenParticipant(gamePin);       // Get new chosenParticipant
        data.nextQuestion_ThisOrThat(gamePin);    // Get next questionId
        io.to(gamePin).emit("roundUpdate", data.getGameData(gamePin).ThisOrThat);
      }, 20000) // 20 seconds is exactly when question time ends.

      setTimeout(() => {
        io.to(gamePin).emit("nextRound");
        data.roundInProgress(gamePin, false); // Set to false
      }, 30000) // 10 seconds later
  }
  })
// ---------------------------------------------------------------------------------

  socket.on('createPoll', function(d) {
    data.createPoll(d.pollId, d.lang)
    socket.emit('pollData', data.getPoll(d.pollId));
  });
  socket.on('createGame', function(lang) {
    const pin = data.createCustomGame(lang);
    socket.emit('gameCreated', pin);
    // Implement error handling if game could not be created
  });
  
  socket.on('startGame', function(gameData) {
    data.storeGameDataAndStart(gameData);
    io.to(gameData.gamePin).emit('startGame');
    console.log("hej");
    //socket emit
  });
   socket.on('addQuestion', function(d) {
    data.addQuestion(d.pollId, {q: d.q, a: d.a});
    socket.emit('questionUpdate', data.getQuestion(d.pollId));
  });
  socket.on('joinPoll', function(pollId) {
    socket.join(pollId);
    socket.emit('questionUpdate', data.getQuestion(pollId))
    socket.emit('submittedAnswersUpdate', data.getSubmittedAnswers(pollId));
  });
  socket.on('updateAllGameData', function(gamePin){
    io.to(gamePin).emit('updateGameData', data.getGameData(gamePin))
  });
  socket.on('joinSocketRoom', function(gamePin){
    socket.join(gamePin);
  });
  socket.on('joinCustomGame', function(gamePin) { //joins the socket room 'gamePin'
    socket.join(gamePin);
    socket.emit('updateGameData', data.getGameData(gamePin));
    // the 'joinPoll' listener above has questionUpdate and submittecAnswersUpdate... where to put them? /sebbe
  });
  socket.on('participateInCustomGame', function(gamePin, playerObj){
    console.log("Adding participant: ", playerObj.name, " in game: ", gamePin)
    data.participateInCustomGame(gamePin, playerObj);
    console.log("User has joined. SocketID: ", socket.id)
    io.to(gamePin).emit('participantsUpdate', data.getCustomGameParticipants(gamePin)); //change to getGameData
  });
  socket.on("requestGameData", function(gamePin) {
    let gameData = data.getGameData(gamePin);
    socket.emit("updateGameData", gameData)
  });
  socket.on("requestParticipants", function(gamePin) {
    socket.emit('participantsUpdate', data.getCustomGameParticipants(gamePin));
  });
  socket.on("deleteUser", function(gamePin, userName) {
    data.deleteUser(gamePin, userName);
    io.to(gamePin).emit('participantsUpdate', data.getCustomGameParticipants(gamePin));
  });
  socket.on('participateInPoll', function(d) {
    data.participateInPoll(d.pollId, d.name);
    io.to(d.pollId).emit('participantsUpdate', data.getParticipants(d.pollId));
  });
  socket.on('startPoll', function(pollId) {
    io.to(pollId).emit('startPoll');
  })
  socket.on('runQuestion', function(d) {
    let question = data.getQuestion(d.pollId, d.questionNumber);
    io.to(d.pollId).emit('questionUpdate', question);
    io.to(d.pollId).emit('submittedAnswersUpdate', data.getSubmittedAnswers(d.pollId));
  });

  socket.on('submitAnswer', function(d) {
    data.submitAnswer(d.pollId, d.answer);
    io.to(d.pollId).emit('submittedAnswersUpdate', data.getSubmittedAnswers(d.pollId));
  }); 

  //Ändrat från pollId till gamePin
  socket.on('update-timer', function(timerDisplay, gamePin) {

    if (gamePin) {
    console.log("Skickar timerDisplay till gamePin:", gamePin);
    socket.join(gamePin);
    io.to(gamePin).emit('update-timer', timerDisplay);
    } else {
    
    io.emit('update-timer', timerDisplay);
    }
    });
    socket.on("requestGameData", function (gamePin) {
      const gameData = data.getGameData(gamePin);
      if (gameData) {
          console.log(`Sending current game data to client ${socket.id}`);
          socket.emit("update-timer", {
              timerDisplay: gameData.timerDisplay,
              soundType: null
          });
      }
  });

  socket.on("getStatements", ({ lang }) => {
  console.log("Received getStatements request with lang:", lang);
  try {
    const statements = data.getStatements(lang); 
    console.log("Sending statements to client:", statements);
    socket.emit("statementsData", { statements }); // Skicka tillbaka data
  } catch (error) {
    console.error("Error fetching statements:", error);
    socket.emit("statementsData", { statements: [] }); // Skicka tom array om fel inträffar
  }
 });
  
 
 
 
 socket.on("submitStatementAnswer", function (data) {
  console.log("Received answer:", data);
  // Spara svaret i customGames
  const game = data.getGameData(data.gamePin);
  if (!game.answers) {
    game.answers = {};
  }
  if (!game.answers[data.statementId]) {
    game.answers[data.statementId] = [];
  }
  game.answers[data.statementId].push(data.selectedParticipant);
  // Kolla om alla har svarat
  const allAnswered = game.answers[data.statementId].length === game.participants.length;
  if (allAnswered) {
    // Skicka resultat tillbaka till klienten
    io.to(data.gamePin).emit("statementResults", {
      statementId: data.statementId,
      answers: game.answers[data.statementId],
    });
 
 
     
 
 
     const nextIndex = game.currentQuestionIndex + 1;
     if (nextIndex >= game.statements.length) {
       console.log("No more statements available. Game over.");
       io.to(data.gamePin).emit("gameOver");
     } else {
       game.currentQuestionIndex = nextIndex; // Uppdatera index
       const nextStatement = game.statements[nextIndex];
       io.to(data.gamePin).emit("currentStatement", nextStatement); // Skicka nästa fråga
     }
   }
 });
 
 
 
 
 socket.on("setup_WhosMostLikelyTo", function (gamePin) {
  const game = data.setup_WhosMostLikelyTo(gamePin);
  socket.emit("setup_WhosMostLikelyTo", game);
 });
 

  socket.on("vote_WhosMostLikelyTo", function (gamePin, voter, votedFor) {
    console.log(`Received vote for gamePin: ${gamePin}, voter: ${voter}, votedFor: ${votedFor}`);
    
    const game = data.customGames[gamePin]?.WhosMostLikelyTo;
  
    if (!game) {
      console.error("Game not found for PIN:", gamePin);
      return;
    }
  
    // Kontrollera om väljaren redan har röstat
    if (game.votes[voter]?.[game.currentStatement]) {
      console.log(`${voter} has already voted for this statement.`);
      return; // Avsluta om väljaren redan har röstat
    }
  
    // Registrera röst
    if (!game.votes[voter]) game.votes[voter] = {};
    game.votes[voter][game.currentStatement] = votedFor;
    game.participants[votedFor].votes++;
  
    console.log(`Current votes:`, game.votes);
  
    // Kontrollera om alla har röstat
   
    const totalParticipants = Object.keys(game.participants).length;
    const totalVotes = Object.keys(game.votes).length;
  
    // Kontrollera om alla har röstat för den aktuella frågan
const totalVotesForCurrent = Object.values(game.votes).filter(v => v[game.currentStatement]).length;

if (totalVotesForCurrent === totalParticipants) {
  console.log("All participants have voted. Showing results...");
  io.to(gamePin).emit("votesUpdated", game.participants);

  // Vänta några sekunder innan nästa fråga
  
  setTimeout(() => {
    const hasNext = data.nextStatement_WhosMostLikelyTo(gamePin);

    if (!hasNext) {
      console.log("Game over!");
      io.to(gamePin).emit("gameOver");
    } else {
      const nextStatement = game.statements[game.currentStatement];
      console.log("Next statement:", nextStatement);

      io.to(gamePin).emit("newStatement", nextStatement);
    }
  }, 5000); // Vänta 5 sekunder för att visa resultat
} else {
  console.log("Not all participants have voted yet.");
  io.to(gamePin).emit("votesUpdated", game.participants);
}

  });
  

 }
 export { sockets };