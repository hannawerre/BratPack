<template>
  <Nav :hideNav="false"
  :uiLabels="uiLabels"
  :lang="lang"
  :showLangSwitch="true"
  @language-changed="handleLanguageChange">
  </Nav>

<div class="container">
  <div class="main-content">
  <h1 v-if="gamePin">Game PIN: {{ gamePin }}</h1>
  <h1 v-else>Loading Game PIN...</h1>
  <div class="admin-player">
    <h2>Choose Your Role</h2>
    <div class="play-as-admin">
      <div class="radio-group">
        <label class="radio-option">
          <input type="radio" value="play" v-model="userRole" />
          Play
        </label>
        <label class="radio-option">
          <input type="radio" value="host" v-model="userRole" />
          Host Only
        </label>
      </div>
    </div>

    <div v-if="userRole === 'play'" class="form-group">
      <input
        type="text"
        v-model="userName"
        placeholder="Admin"
        class="input-field"
      />
    </div>
</div>
  <div>
      <p>Choose the time in minutes:</p>
      <div class="button-container">
          <button class="decrement-button" @click="decrementMinutes">-</button>
          {{ selectedMinutes }}
          <button class="increment-button" @click="incrementMinutes">+</button>
      </div>
  </div>

  <h2>Choose your custom games below:</h2>

  <div v-for="game in games" :key="game.id" class="game-item">
      <input 
          type="checkbox" 
          :id="game.id" 
          :value="game.id" 
          v-model="selectedGames"
      />
      <label :for="game.id">{{ game.name }}</label>

      <div class="edit-button" @click="openModal(game)">
          <img src="/img/Gear-icon.png" alt="Edit" class="edit-icon" />
      </div>
  </div>

  <!-- Modal-komponenter med unika ref -->
  <EditQuiz1Component 
      ref="modalGeneralQuiz" 
      :GameName="currentGame ? currentGame.name : ''"
      @modal-closed="onModalClosed"
      @questions-saved-generalQuiz="onQuestionsSaved"
  />
  <EditQuiz2Component 
      ref="modalQuiz2" 
      :GameName="currentGame ? currentGame.name : ''"
      @modal-closed="onModalClosed"
  />
  <EditQuiz3Component 
      ref="modalQuiz3" 
      :GameName="currentGame ? currentGame.name : ''"
      @modal-closed="onModalClosed"
  />
  <EditQuiz4Component 
      ref="modalQuiz4" 
      :GameName="currentGame ? currentGame.name : ''"
      @modal-closed="onModalClosed"
  />

  <div class="startbutton-container">
      <button class="startbutton" @click="startGame">Start Game</button>
      <button class="startbutton" @click="unactiveGame">Unactive Game</button>
      <button class="startbutton" @click="updateSettings">Update Info</button>
      <button class="startbutton" @click="logGameData">logGameData</button>
  </div>

</div>
  <div class="participants">
    <h2>Participants</h2>
      <ul>
        <li v-if="userRole === 'play' && gameStarted=== false"><strong>{{ userName ? userName : "Admin" }}</strong></li>
        <li v-for="(participant, index) in participants" :key="index">
          <strong>{{ participant.name }}</strong> 
        </li>
      </ul>

  </div>
  </div>
</template>

<script>
//import {socket} from '../socketClient.js';
const socket = io("localhost:3000");
import io from 'socket.io-client'; 
import Nav from '@/components/ResponsiveNav.vue'
import EditQuiz1Component from '../components/EditQuiz1Component.vue';
import EditQuiz2Component from '../components/EditQuiz2Component.vue';
import EditQuiz3Component from '../components/EditQuiz3Component.vue';
import EditQuiz4Component from '../components/EditQuiz4Component.vue';

export default {
name: 'CustomGames',
components: {
  Nav,
  EditQuiz1Component,
  EditQuiz2Component,
  EditQuiz3Component,
  EditQuiz4Component
},
data: function() {
  return {
    lang: localStorage.getItem("lang") || "en",
    selectedMinutes: 60,
    games: [
      // { id: 'General Quiz', name: 'Quiz 1'} ,
      // { id: 'Who´s most likely', name: 'Quiz 2'},
      // { id: 'Music quiz', name: 'Quiz 3'},
      // { id: 'This or that', name: 'Quiz 4'}
      { id: 'generalQuiz', name: 'General Quiz'} ,
      { id: 'Quiz2', name: 'Who´s most likely'},
      { id: 'Quiz3', name: 'Music quiz'},
      { id: 'ThisOrThat', name: 'This or that'}
    ],
    selectedGames: [],
    participants: [],
    gamePin: '',
    currentGame: null, // Används denna? /sebbe
    customQuestions:{},
    useStandardQuestions: true,
    useOwnQuestions: false,
    userName:'',
    userRole: 'host',
    gameStarted: false,

  };
},

created: function () {
  //this.dismantleSocket(); //kanske ta bort?
  socket.on( "uiLabels", labels => this.uiLabels = labels );
  socket.on("updateGameData", (gameData) => {
        
        console.log("Game data received: ", gameData);
        // this.customQuestions = gameData.customQuestions;
        // this.useStandardQuestions = gameData.useStandardQuestions;
        // this.useOwnQuestions = gameData.useOwnQuestions;
        this.selectedGames = gameData.selectedGames;
        this.participants = gameData.participants;
        this.selectedMinutes = gameData.selectedMinutes;
        this.customQuestions = gameData.customQuestions;
        console.log("Updated gameData, participants: ", this.participants);
        

        });
  if (!this.$route.params.gamePin) { 
    socket.on('gameCreated', pin => {
      this.gamePin = pin
      console.log("GamePin created: ", this.gamePin);
      socket.emit('joinSocketRoom', pin); //joins the socket room 'gamePin'
      this.$router.replace({ path: `/customgames/${pin}` });

      });
  console.log("Listener for 'updateGameData' in CustomGamesView.vue is active");
  socket.emit("createGame", this.lang);
}else {
      console.log("Insde else-statement, this means created gamepin exists");
      this.gamePin = this.$route.params.gamePin; // just nu kommer gamePin finnas kvar vid refresh, men jag tror att all game data raderas
      console.log("GamePin: ", this.gamePin);
      socket.emit("joinSocketRoom",this.gamePin);
      socket.emit("requestGameData", this.gamePin);
  
};
    
socket.on('participantsUpdate', participants => {
    this.participants = participants;
    console.log("Participants updatet, active participants: ", this.participants);
});














/*

  // this.gamePin = this.$route.params.gamePin;
  //   console.log("GamePin: ", this.gamePin);
  //   socket.emit("joinCustomGame",this.gamePin);
    socket.on("updateGameData", (gameData) => {
    //   if (gameData.selectedGames && gameData.selectedGames.length > 0) {
    //     this.selectedGames = gameData.selectedGames;
    // }
    // if (gameData.customQuestions && gameData.customQuestions.length > 0) {
    //     this.customQuestions = gameData.customQuestions;
    // }
    // if (gameData.useStandardQuestions) {
    //     this.useStandardQuestions = gameData.useStandardQuestions;
    // }
    // if (gameData.customQuestions && gameData.customQuestions.length > 0) {
    //     this.customQuestions = gameData.customQuestions;
    // }

    console.log("Game data received: ", gameData);
    // this.customQuestions = gameData.customQuestions;
    // this.useStandardQuestions = gameData.useStandardQuestions;
    // this.useOwnQuestions = gameData.useOwnQuestions;
    this.selectedGames = gameData.selectedGames;
    this.participants = gameData.participants;
    this.selectedMinutes = gameData.selectedMinutes;
    console.log("Updated gameData, participants: ", this.participants);
    if (this.participants && this.participants.length > 0) {
      // Kod för att använda participants[0]
      this.userName = this.participants[0].name;
    }
    console.log("Username: ", this.userName);
  });
  console.log("Listener for 'updateGameData' in CustomGamesView.vue is active");

  if (!this.$route.params.gamePin) { 
      socket.on('gameCreated', pin => {
        this.gamePin = pin
        console.log("GamePin created: ", this.gamePin);
        socket.emit('joinCustomGame', pin); //joins the socket room 'gamePin'
        this.$router.replace({ path: `/customgames/${pin}` });
      });
      console.log("Listener for 'gameCreated' in CustomGamesView.vue is active");
      socket.emit("createGame", this.lang);
      console.log("Emitted createGame from CustomGamesView.vue")
    }
    // This else-statement gets triggered if the site is refreshed.
    else { 
      // TODO: när sidan laddas om så tror jag att all sparad data raderas. Därför borde allt som har med spelet och göra att sparas i localStorage eller sessionStorage
      console.log("Insde else-statement, this means created gamepin exists");
      this.gamePin = this.$route.params.gamePin; // just nu kommer gamePin finnas kvar vid refresh, men jag tror att all game data raderas
      console.log("GamePin: ", this.gamePin);
      socket.emit("joinSoketRoom",this.gamePin);
      // alltså ska vi här lägga till att vi hämtar den sparade datan relaterad till gamePin från localStorage eller sessionStorage
    };
    



    // Lyssna på uppdateringar av deltagare, när någon joinar
    socket.on('participantsUpdate', participants => {
    this.participants = participants;
    console.log("Active participants: ", this.participants);
    
  });
  //Används ej
  socket.on('lobbyUnactive',(gamePin) => {
    console.log("Unactivating lobby", gamePin);

    participants.forEach(participant => {
    console.log(`Participant: ${participant.name}, isPlaying: ${participant.isPlaying}`);
  });
  });
  socket.emit("requestParticipants", this.gamePin); // Behövs dennaP


  //Används ej
  socket.emit("adminRejoined", (this.gamePin))
  console.log("adminRejoined",this.gamePin, this.userName)

  */
},
methods: {

  incrementMinutes: function() {
    this.selectedMinutes += 10;
    console.log(this.participants);
  },

  decrementMinutes: function () {
    if(this.selectedMinutes > 10){
      this.selectedMinutes -= 10;
    }
  },

  isNameTaken: function(userName) {
        this.nameTaken = this.participants.some(participant => participant.name === userName);
        console.log("Name taken: ", this.nameTaken);
        console.log("All participants: ", this.participants);
    return this.nameTaken;
  },

  startGame: function () {
    console.log("playerRole: ", this.playerRole);

    if(this.isNameTaken(this.userName)){
      alert("Name is taken, please choose another one");
      return;
    }

    if (this.selectedGames.length === 0) {
      alert("Please select at least one game.");
      return;
    }

    if (this.participants.length === 0 && this.userRole === 'play') {
      alert("No players have joined yet.");
      return;
    }
    if(this.participants.length < 2 && this.userRole === 'host'){
      alert("Only one player has joined. At least two players are required to start the game.");
      return;
    }

    if (this.userRole === 'play') {
      if (!this.userName) {
        alert("Please enter your username.");
        return;
      }
      console.log("hej",   this.userName);
      const adminName={      
        name: this.userName,
        scoreGame1: 0,
        scoreGame2: 0,
        scoreGame3: 0,
        scoreGame4: 0
      }
      console.log("adminName: ", adminName);
      // socket.emit( "participateInCustomGame", this.gamePin,  adminName);
      this.gameStarted = true;
      this.participants.unshift(adminName);
      sessionStorage.setItem('userName', this.userName); 
    }
    else {
      // Ensure there is no name left in session storage. This is what determines if admin is playing in later views.
      if (sessionStorage.getItem('userName')) {
          sessionStorage.removeItem('userName');
      }
    }
    sessionStorage.setItem('isAdmin', true);
    
    let gameData = {  // borde den inte vara const? /theo
      gamePin: this.gamePin,
      selectedGames: this.selectedGames,
      participants: this.participants,
      selectedMinutes: this.selectedMinutes
      //lang: this.lang språk sparas i gameData eller localStorage?
    }
    console.log("Davids och sebbes test: ", gameData);

    socket.emit('startGame', gameData)
    this.$router.push("/game/" + this.gamePin)
    // TODO: Admin ska också till gameView. men i nåt sorts 'admin mode' där hen kan starta minigames etc. /sebbe
    // this.$router.push({
    //   name: 'GameView',
    //   params: { gamePin }
    // });
    console.log("--> After startGame!")
  },

  openModal(game) {
    this.currentGame = game;
    // Öppna rätt modal baserat på vilken quiz det är
    if (game.id === 'generalQuiz') {
      this.$refs.modalGeneralQuiz.openModal();
    } else if (game.id === 'Quiz2') {
      this.$refs.modalQuiz2.openModal();
    } else if (game.id === 'Quiz3') {
      this.$refs.modalQuiz3.openModal();
    } else if (game.id === 'Quiz4') {
      this.$refs.modalQuiz4.openModal();
    }


  },

  onModalClosed() {
    console.log('Modalen är stängd');
    
    this.currentGame = null;
  },

  onQuestionsSaved(customQuestions, useStandardQuestions, useOwnQuestions, quiz) { // kanske kan skriva ihop denna med onModalClosed? //david
    if (!this.customQuestions[quiz]) {
    this.customQuestions[quiz] = {};
  }

  this.customQuestions[quiz].customQuestions = customQuestions;
  this.customQuestions[quiz].useStandardQuestions = useStandardQuestions;
  this.customQuestions[quiz].useOwnQuestions = useOwnQuestions;
  console.log("Theo loggar: custom questions objektet för quiz", quiz,  this.customQuestions[quiz])
  console.log(
    'Questions received from child:',
    quiz
    
    /*this.customQuestions[quiz].customQuestions,
    this.customQuestions[quiz].useStandardQuestions,
    this.customQuestions[quiz].useOwnQuestions,
    this.customQuestions */
  );

  socket.emit(
    "savedQuestionsToServer", 
    this.gamePin, 
    this.customQuestions, 
    quiz
  );
},

  handleWindowClose(event) {
      console.log("Admin window closed! unactivating lobby")
      //socket.emit("adminLeftGame", this.gamePin, this.userName);
    },

  checkIfRefreshPage() {
    // Check if there already is a name in sessionStorage. If there is, user will pick it up and join the lobby with it.
      let storagePin = sessionStorage.getItem('gamePin');
      if (storagePin) {
        
        this.gamePin = storagePin;
        socket.emit("requestParticipants", this.gamePin);
        
      }
    console.log("Checking if refresh... storagePin =", storagePin, "with this.gamePin =", this.gamePin);
    },

    updateSettings: function() {
      console.log("Pressed update info button");
      
      let gameData = {
        gamePin: this.gamePin,
        selectedGames: this.selectedGames,
        participants: this.participants,
        selectedMinutes: this.selectedMinutes,
        customQuestions: this.customQuestions,
        useStandardQuestions: this.useStandardQuestions,
        useOwnQuestions: this.useOwnQuestions
      }
      console.log("gameData: ", gameData);
      socket.emit('updateSettings', gameData);
    },
    deleteGame: function() {
 
    },
    unactiveGame: function() {

    },
    logGameData: function() {
      console.log("Pressed log game data button");
      socket.emit('requestGameData', this.gamePin);
      console.log("Game data: ", this.gamePin, this.selectedGames, this.participants, this.selectedMinutes, this.customQuestions, this.useStandardQuestions, this.useOwnQuestions, this.active);
    },
    handleLanguageChange(newLang) {
      this.lang = newLang;
      localStorage.setItem("lang", newLang);
      socket.emit("getUILabels", this.lang);
    },
    // dismantleSocket(){ //TODO kanske ta bort
    //   console.log("-->before if-statement in dismantleSocket in CustomGamesView")
    //   if(socket) {
    //   console.log("-->inside if-statement in dismantleSocket in CustomGamesView")
    //     socket.emit('leaveSocketRoom', this.gamePin); // Leave the room
    //     // socket.disconnect(); // Disconnect the socket
    // }else console.log("this.socket does not exist in CustomGamesView")
    // }
  },
mounted() {
  // console.log(this.participants.length > 0,"participants >0")
  //   if (this.participants.length == 0) {
  //     console.log("YES")
  //     // If the first participant’s name is not the same as userName
  //       socket.emit("participateInCustomGame", this.gamePin, {
  //         name: "ADMIN",
  //         isPlaying: false,
  //         isAdmin: true,
  //         scoreGame1: 0,
  //         scoreGame2: 0,
  //         scoreGame3: 0,
  //         scoreGame4: 0
  //       });
  //       console.log("Created ADMIN")
  //   }

  //   console.log("Emitted participateInCustomGame from CustomGamesView.vue")
  //   //Hämta gameData från servern
  //   socket.emit("requestGameData", this.gamePin);
  //   console.log("Emitted requestGameData from CustomGamesView.vue")


    window.addEventListener("beforeunload", this.handleWindowClose);
    //this.checkIfRefreshPage();
  },
beforeDestroy() {
    window.removeEventListener("beforeunload", this.handleWindowClose);
    // console.log("-->beforeDestroy in CustomGamesView")
    // this.dismantleSocket();
  },
}
</script>


<style>
  .container {
    align-items: flex-start;
    display: flex;
    gap: 20px;
    justify-content: space-between;
    padding: 20px;
    
  }

  .main-content {
    flex: 1;
    text-align: center;
}

.admin-player {
  padding: 10px;
  margin: 20px 0;
  text-align: center;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
}

.admin-player h2 {
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: #333;
}

.radio-group {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  color: #555;
}

.radio-option input[type="radio"] {
  transform: scale(1.2);
  accent-color: #4caf50;
  cursor: pointer;
  margin-right: 6px;
}

.form-group {
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.input-field {
  width: 100%;
  max-width: 250px;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-field:focus {
  border-color: #4caf50;
  box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
  outline: none;
}

.action-button {
  background-color: #4caf50;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.action-button:hover {
  background-color: rgb(8, 179, 8);
  box-shadow: 0 0 10px 3px rgba(8, 179, 8, 0.5);
  transform: scale(1.05);
}

.decrement-button{
  background-color: rgb(213, 8, 8);
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  height: 30px;
  width: 30px;
}

.decrement-button:hover{
  background-color: rgb(247, 44, 44);
  box-shadow: 0 0 5px 2px rgba(245, 37, 37, 0.5);
  transform: scale(1.05);
}
.increment-button{
  background-color: green;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  height: 30px;
  width: 30px;
}

.increment-button:hover{
  background-color: rgb(8, 179, 8);
  box-shadow: 0 0 5px 2px rgba(8, 179, 8, 0.5);
  transform: scale(1.05);
}

.startbutton{
  background-color: green;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;  
  display: inline-block;
  font-size: 16px;
  margin: 30px 4px;
  padding: 15px;
  text-align: center;
  text-decoration: none;  
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.startbutton:hover{
  background-color: rgb(8, 179, 8);
  box-shadow: 0 0 15px 5px rgba(8, 179, 8, 0.5); 
  transform: scale(1.05);
}

.game-item {
display: flex;
justify-content: center; 
align-items: center; 
margin-bottom: 20px; 
}

.game-item label {
margin-left: 10px; 
margin-right: 20px; 
font-weight: bold;
}

.edit-button {
display: inline-block;
background-color: rgb(183, 183, 183);
color: white;
border: none;
border-radius: 40px;
padding: 6px 8px;
text-align: center;
text-decoration: none;
font-size: 14px;
cursor: pointer;
transition: background-color 0.3s ease, transform 0.2s ease;
}

.edit-button:hover {
background-color: rgb(170, 168, 168);
transform: scale(1.02);
box-shadow: 0 0 5px 2px  rgba(0, 0, 0, 0.5);
}

.edit-button:active {
transform: scale(1);
box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.5);
}
.edit-icon {
width: 30px; 
height: 30px; 
vertical-align: middle; 
}

input[type="checkbox"] {  
      width: 20px;
      height: 20px;
  }

  .participants {
    flex: 0 0 auto;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 15px;
    background-color: lightblue;
    position: absolute;
    right: 0;
    margin-right: 40px;
    margin-top: 40px;
    box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.5);

}

  .participants h2{
    text-align: center;
    margin-bottom: 10px;
  }

  .participants ul{
    list-style-type: none;
    padding: 0;
  }

  .participants li{
    padding: 5px 0;
    border-bottom: 1px solid #ddd;
  }
</style>