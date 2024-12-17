function sockets(io, socket, data) {

  // Check if game exists
  
  socket.on('customGameExists', function(gamePin) {
    socket.emit('gameExists', data.customGameExists(gamePin))
  });
  socket.on('getUILabels', function(lang) {
    socket.emit('uiLabels', data.getUILabels(lang));
  });

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
    data.storeGameData(gameData)
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

  socket.on('joinCustomGame', function(gamePin) { //joins the socket room 'gamePin'
    socket.join(gamePin);
    // the 'joinPoll' listener above has questionUpdate and submittecAnswersUpdate... where to put them? /sebbe
  });
  socket.on('participateInCustomGame', function(d){
    console.log("Adding participant: ", d.name, " in game: ", d.gamePin)
    data.participateInCustomGame(d.gamePin, d.name);
    console.log("User has joined. SocketID: ", socket.id)
    io.to(d.gamePin).emit('participantsUpdate', data.getCustomGameParticipants(d.gamePin)); //change to getGameData
  });
  socket.on("requestGameData", function(gamePin) {
    let gameData = data.getGameData(gamePin);
    socket.emit("updateGameData", gameData)
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
    console.log("Mottagit timerDisplay på servern:", timerDisplay, "Game Pin:", gamePin);
    if (gamePin) {
    console.log("Skickar timerDisplay till gamePin:", gamePin);
    socket.join(gamePin);
    io.to(gamePin).emit('update-timer', timerDisplay);
    } else {
    console.log("Broadcastar timerDisplay till alla klienter:", timerDisplay);
    io.emit('update-timer', timerDisplay);
    }
    });
    
}

export { sockets };