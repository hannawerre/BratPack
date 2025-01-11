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
  socket.on('getQuestions', function(lang, gamePin, gameName) {
    console.log("hämtar quiz frågor");
    console.log("Lang:", lang, "GamePin:", gamePin, "GameName:", gameName);
    console.log("Theo loggar Getquestions:", data.getQuestions(lang, gamePin, gameName))
    socket.emit('generalQuestions', data.getQuestions(lang, gamePin, gameName))
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
  });
  socket.on('startRound', function(gamePin) {
    if(!data.roundInProgress(gamePin)){

      console.log("--> startRound inside if statement! gamePin: ", gamePin)
      data.roundInProgress(gamePin, true); // Set to true

      setTimeout(() => {
        data.correctQuestion_ThisOrThat(gamePin); // Correct the answers and add points
        data.newChosenParticipant(gamePin);       // Get new chosenParticipant
        data.nextQuestion_ThisOrThat(gamePin);    // Get next questionId
        io.to(gamePin).emit("roundUpdate", data.getGameData(gamePin).ThisOrThat);
      }, 20000) // 20 seconds is just after the question time ends.

      setTimeout(() => {
        io.to(gamePin).emit("nextRound");
        data.roundInProgress(gamePin, false); // Set to false
      }, 30000) // 10 seconds later
  }
  });
// ---------------------------------------------------------------------------------
// Timer ---------------------------------------------------------------------------
socket.on('requestGameTime', (gamePin, callback) => {
  const time = data.getGameTime(gamePin);
  callback({
    remainingTime: time, 
    error: null
});
});
// ---------------------------------------------------------------------------------

  socket.on('createGame', function(lang) {
    const {pin, customGame} = data.createCustomGame(lang);
    console.log("Game created with pin: ", pin); 
    socket.emit('gameCreated', pin);
    socket.emit('updateGameData', customGame);
    // Implement error handling if game could not be created
  });
  
  socket.on('startGame', function(gameData) {
    data.storeGameDataAndStart(gameData);
    io.to(gameData.gamePin).emit('startGame');
    console.log("hej");
    //socket emit
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

  socket.on("savedQuestionsToServer", function(gamePin, savedQuestions, useStandardQuestions, useOwnQuestions, quiz) {
  data.saveQuestions(gamePin, savedQuestions, useStandardQuestions, useOwnQuestions, quiz);
  console.log("Theo loggar quiz:", quiz);
  });

  socket.on("adminLeftGame", (gamePin, userName) => {
    console.log(`Admin left for gamepin: ${gamePin}`);
    data.deleteGame(gamePin);
  });

// socket.on("adminLeftGame", (gamePin, userName) => {
//     console.log(`Admin left for gamepin: ${gamePin}`);

//     data.setAdminRejoined(gamePin, false);

//   setTimeout(() => {
//     if (!adminRejoined) {
//         console.log(`No admin rejoined. Deleting game for gamepin: ${gamePin}`);
//         data.deleteGame(gamePin); // Delete the game if no admin rejoined
//     } else {
//         console.log(`Gamepin ${gamePin} continues with a new admin.`);
//     }
// }, 10000); 


// });

}


export { sockets };