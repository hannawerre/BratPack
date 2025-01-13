function sockets(io, socket, data) {
  
  socket.on("startingQuestion", function(data){
    console.log(`startQuizForAll received for gamePin = ${data.gamePin}`)
    io.to(data.gamePin).emit("startQuestion", data.currentQuestionIndex)
  });

  socket.on("startMiniGame", function(data){
    const {gamePin, gameName} = data;
    io.to(gamePin).emit("onGameStart", gameName)
  });

  socket.on("updatePlayerPoints", (d) => {
    data.setScore(d.gamePin, d.userName, d.newScore);
    io.to(d.gamePin).emit('updateGameData', data.getGameData(d.gamePin))
  });

  socket.on('customGameExists', function(gamePin) {
    socket.emit('gameExists', data.customGameExists(gamePin))
  });

  socket.on('getUILabels', function(lang) {
    socket.emit('uiLabels', data.getUILabels(lang));
  });

  socket.on('getQuestions', function(lang, gamePin, gameName) {
    console.log("Getting questions for gamePin: ", gamePin, ", gameName: ", gameName, ", lang: ", lang)
    socket.emit('sendingQuestions', data.getQuestions(lang, gamePin, gameName))
  });

  // - WhosMostLikelyTo ---------------------------------------------------------------
  socket.on("settingUpWhosMostLikelyTo", function(gamePin){
    const whosMostLikelyGameData = data.setUpWhosMostLikely(gamePin);
    socket.emit("setUpWhosMostLikelyTo", whosMostLikelyGameData)
  });

  socket.on("getQuestionsWho", function(lang, gamePin, participants){
    let questions= data.getQuestions(lang, gamePin, "whosMostLikelyTo")
    let questionsWithAnswers = data.addAnswerAlternatives(questions, participants);
    console.log("Theo o dennis äter en häst", questionsWithAnswers);
    io.to(gamePin).emit("sendingQuestionsWho", questionsWithAnswers);
  });

  socket.on("playerAnswers", function(payload){
    data.storeAnswer(payload.gamePin, payload.userName, payload.answerObj)
  });

  socket.on("calculateCorrectAnswer", function(gamePin) {
    const correctAnswer = data.calculateCorrectAnswer(gamePin);
    io.to(gamePin).emit("participantsUpdate", data.getGameData(gamePin).participants)
    io.to(gamePin).emit("correctAnswerCalculated", correctAnswer);
  });

  socket.on("nextQuestionWhosMostLikelyTo", function(gamePin){
    const currentQuestionIndex = data.nextQuestionWhosMostLikelyTo(gamePin);
    io.to(gamePin).emit("increasingCurrentQuestionIndex", currentQuestionIndex);
  });

  // - ThisOrThat -------------------------------------------------------------------
  socket.on('setup_ThisOrThat', function(gamePin, lang) {
    console.log("Setting up ThisOrThat game with gamePin: ",gamePin, ", and returning questions");
    socket.emit('setup_ThisOrThat', data.setup_ThisOrThat(gamePin));
    socket.emit("getQuestions", data.getQuestions(lang, gamePin, "thisOrThat"));
  });

  socket.on('answer_ThisOrThat', function(gamePin, userName, answerId){
    data.answer_ThisOrThat(gamePin, userName, answerId);
  });

  // This method handles one round centrally and does everything perfectly timed.
  // It will start when a client requests a new round.
  socket.on('startRound', function(gamePin) {
    if(!data.roundInProgress(gamePin)){

      data.roundInProgress(gamePin, true); // Set to true

      setTimeout(() => {
        data.correctQuestion_ThisOrThat(gamePin); // Correct the answers and add points
        const gameData = data.getGameData(gamePin)

        io.to(gamePin).emit("roundUpdate", gameData.ThisOrThat);
        io.to(gamePin).emit("participantsUpdate", gameData.participants);
        
      }, 20000) // 20 seconds is just after the question time ends.

      setTimeout(() => {
        const chosenParticipant = data.newChosenParticipant(gamePin);       // Get new chosenParticipant
        const nextQuestion = data.nextQuestion_ThisOrThat(gamePin);         // Get next questionId
        io.to(gamePin).emit("nextRound", nextQuestion, chosenParticipant);
        data.roundInProgress(gamePin, false); // Set to false
      }, 30000) // 10 seconds later
    }
  });

  // - Timer ---------------------------------------------------------------------------
  socket.on('requestGameTime', (gamePin, callback) => {
    if(data.customGameExists(gamePin)){
      const time = data.getGameTime(gamePin);
      callback({
        remainingTime: time, 
        error: null
      })
    };
  });
  // ------------------------------------------------------------------------------------

  socket.on('createGame', function(lang) {
    const {pin, customGame} = data.createCustomGame(lang);
    console.log("CustomGame created with pin: ", pin); 
    socket.emit('gameCreated', pin);
    socket.emit('updateGameData', customGame);
    // TODO: Implement error handling if game could not be created
  });
  
  socket.on('startGame', function(gameData) {
    data.storeGameDataAndStart(gameData);
    io.to(gameData.gamePin).emit('startGame');
  });
  
  socket.on('updateAllGameData', function(gamePin){
    io.to(gamePin).emit('updateGameData', data.getGameData(gamePin))
  });

  socket.on('joinSocketRoom', function(gamePin){
    // Leave all rooms except its own default room (the socket ID room).
    // This ensures a socket cannot be tied to multiple socket rooms at the same time.
    for (const room of socket.rooms) {
      if (room !== socket.id) { 
        socket.leave(room);
        console.log(`Socket ${socket.id} left room: ${room}`);
      }
    }
    socket.join(gamePin);
  });

  socket.on('leaveSocketRoom', function(gamePin){
    console.log("Sebbetest: socket: ", socket.id, " leaving socket room: ", gamePin)
    socket.leave(gamePin);
    // Print all rooms the socket is in
    console.log(`Socket ${socket.id} is now in rooms:`);
    console.log(Array.from(socket.rooms));
  });

  socket.on('joinCustomGame', function(gamePin) {
    socket.join(gamePin);
    socket.emit('updateGameData', data.getGameData(gamePin));
  });

  socket.on('participateInCustomGame', function(gamePin, playerObj){
    console.log("Adding participant: ", playerObj.name, " in game: ", gamePin)
    data.participateInCustomGame(gamePin, playerObj);
    console.log("User has joined game with gamePin: ", gamePin, ", SocketID: ", socket.id)
    io.to(gamePin).emit('participantsUpdate', data.getCustomGameParticipants(gamePin)); 
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

  socket.on("savedQuestionsToServer", function(gamePin, savedQuestions, useCustomQuestions, quiz) {
  data.saveQuestions(gamePin, savedQuestions, useCustomQuestions, quiz);
  console.log("Theo loggar quiz:", quiz, "useCustomQuestions:", useCustomQuestions, "savedQuestions:", savedQuestions);
  });

  // Currently not used, but stays for future purposes /sebbe
  socket.on("adminLeftGame", (gamePin) => { 
    console.log(`Admin left from gamePin: ${gamePin}`);
    data.deleteGame(gamePin);
  });

  socket.on("adminStartedWithExisitingPin", function(gamePin, lang) {
    if(!data.customGameExists(gamePin)){
      console.log("Admin rejoined UNEXISTING game with pin: ", gamePin);
      const customGame = data.createCustomGameAlt(gamePin);
      socket.emit('updateGameData', customGame);
      console.log("Game created with pin: ", gamePin);
    }else{
      console.log("Admin rejoined EXISTING game with pin: ", gamePin);
      socket.emit("gameAlreadyExists", gamePin);
    };
  });


// TODO: Not completely done, but can stay for future purposes
//
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