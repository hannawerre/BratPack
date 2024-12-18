<template>
<div v-if="showGameExistsPopup && !shouldRestoreState" class="popup-overlay">
      <div class="popup-content">
        <h2>Game Already in Session</h2>
        <p>The game with PIN {{ gamePin }} is already active. Return to main menu</p>
        <button @click="mainMenu">OK</button>
      </div>
</div>
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
        class="textBox input"
      />
    </div>
</div>
  <div>
      <p>Choose the time in minutes:</p>
      <div class="button-container">
          <button class="button decrement" @click="decrementMinutes">-</button>
          {{ selectedMinutes }}
          <button class="button increment" @click="incrementMinutes">+</button>
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
      @questions-saved-generalQuiz="onQuestionsSaved"
      @modal-closed="onModalClosed"
  />
  <EditQuiz2Component 
      ref="modalWhosMostLikelyTo" 
      :GameName="currentGame ? currentGame.name : ''"
      @questions-saved-whosMostLikelyTo="onQuestionsSaved"
      @modal-closed="onModalClosed"
  />
  <EditQuiz3Component 
      ref="modalThisOrThat" 
      :GameName="currentGame ? currentGame.name : ''"
      @questions-saved-thisOrThat="onQuestionsSaved"
      @modal-closed="onModalClosed"
  />


  <div class="startbutton-container">
      <button class="button orange" @click="startGame">Start Game</button>
  </div>

</div>
<div class="participants">
    <h2>Participants</h2>
    <div class="toggle-button" @click="toggleListVisibility">
      <span>{{ isListVisible ? 'Hide Participants &#9650;' : 'Show Participants &#9660;' }}</span>
      <span>{{ isListVisible ? '&#9650;' : '▼' }}</span>
</div>
    <ul v-if="isListVisible">
      <li v-if="userRole === 'play' && gameStarted === false">
        <strong>{{ userName ? userName : "Admin" }}</strong>
      </li>
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
import EditQuiz1Component from '../components/EditQuiz1Component.vue';
import EditQuiz2Component from '../components/EditQuiz2Component.vue';
import EditQuiz3Component from '../components/EditQuiz3Component.vue';
import EditQuiz4Component from '../components/EditQuiz4Component.vue';
import Nav from '@/components/ResponsiveNav.vue';



export default {
name: 'CustomGames',
components: {
  Nav,
  EditQuiz1Component,
  EditQuiz2Component,
  EditQuiz3Component,

},
data: function() {
  return {
    lang: sessionStorage.getItem("lang") || "en",
    selectedMinutes: 60,
    games: [
      // { id: 'General Quiz', name: 'Quiz 1'} ,
      // { id: 'Who´s most likely', name: 'Quiz 2'},
      // { id: 'Music quiz', name: 'Quiz 3'},
      // { id: 'This or that', name: 'Quiz 4'}
      { id: 'generalQuiz', name: 'General Quiz'} ,
      { id: 'whosMostLikelyTo', name: 'Who´s most likely to'},
      { id: 'thisOrThat', name: 'This or that'}
    ],
    selectedGames: [],
    participants: [],
    gamePin: '',
    currentGame: null, // Används denna? /sebbe
    customQuestions: {},
    // useCustomQuestions: false,
    active: true, // Används denna? /sebbe
    userName: '',
    userRole: 'host',
    uiLabels: {},
    showGameExistsPopup: false,
    shouldRestoreState: false,
    gameStarted: false,
    isListVisible: false,
    toggleText: "Show Participants",

  };
},

created: function () {
  //this.dismantleSocket(); //kanske ta bort? / sebbe
  socket.on( "uiLabels", labels => this.uiLabels = labels );
  const shouldRestore = sessionStorage.getItem('shouldRestoreState');
  this.shouldRestoreState = shouldRestore;

  console.log("Should restore state:", shouldRestore);
    if (shouldRestore) {
      const savedData = sessionStorage.getItem('savedData');
      if (savedData) {
      try {
        
        const parsedData = JSON.parse(savedData);
        // Återställ varje egenskap från det sparade objektet
        this.selectedGames = parsedData.selectedGames || [];
        this.participants = parsedData.participants || [];
        this.customQuestions = parsedData.customQuestions || {};
        this.userName = parsedData.userName || '';
        this.userRole = parsedData.userRole || 'host';
        this.selectedMinutes = parsedData.selectedMinutes || 60;
      } catch (error) {
        console.error("Fel vid tolkning av sparad data:", error);
      }
    }
    sessionStorage.removeItem('shouldRestoreState');
    sessionStorage.removeItem('savedData');

    console.log("Restored data:", this.selectedGames, this.participants, this.customQuestions, this.userName);
  }

  // socket.on("updateGameData", (gameData) => {
        
        // console.log("Game data received: ", gameData);
        // // this.customQuestions = gameData.customQuestions;
        // // this.useStandardQuestions = gameData.useStandardQuestions;
        // // this.useOwnQuestions = gameData.useOwnQuestions;
        // this.selectedGames = gameData.selectedGames;
        // this.participants = gameData.participants;
        // this.selectedMinutes = gameData.selectedMinutes;
        // // this.customQuestions = gameData.customQuestions;
        // // this.useCustomQuestions = gameData.useCustomQuestions;
        // console.log("Updated gameData, participants: ", this.participants);
        // });
  if (!this.$route.params.gamePin) { 
    socket.on('gameCreated', pin => {
      this.gamePin = pin
      console.log("GamePin created: ", this.gamePin);
      socket.emit('joinSocketRoom', pin); //joins the socket room 'gamePin'
      this.$router.replace({ path: `/customgames/${pin}` });
      
      socket.on("updateGameData", (gameData) => {
        
        console.log("Game data received: ", gameData);
        this.selectedGames = gameData.selectedGames;
        this.participants = gameData.participants;
        this.selectedMinutes = gameData.selectedMinutes;
        this.customQuestions = gameData.customQuestions;
        console.log("Updated gameData, participants: ", this.participants);
        });
      });
  console.log("Listener for 'updateGameData' in CustomGamesView.vue is active");
  socket.emit("createGame", this.lang);
}else {
      console.log("Insde else-statement, this means created gamepin exists");
      this.gamePin = this.$route.params.gamePin; // just nu kommer gamePin finnas kvar vid refresh, men jag tror att all game data raderas
      console.log("GamePin: ", this.gamePin);
      socket.on("gameAlreadyExists", (gamepin)=> {
        console.log("Game already exists, gamepin: ", gamepin);
        this.showGameExistsPopup = true;

      socket.emit("requestGameData", this.gamePin);
      // alltså ska vi här lägga till att vi hämtar den sparade datan relaterad till gamePin från localStorage eller sessionStorage
    };
    
    
    // socket.on('participantAdded', ({ lobbyID, participant }) => {
    //   console.log("participantAdded! checking if it is this lobby")
    //   if (lobbyID === this.lobbyID) {
    //     this.participants.push(participant);
    //     // TODO lägg till error handling så att flera participants inte kan joina..
    //     console.log('New participant added:', participant);
    //     console.log('All participants: ', this.participants)
    //   }
    // });

    socket.on('participantsUpdate', participants => {
      this.participants = participants;
      console.log("Active participants: ", this.participants);
    });
  },
  methods: {
  
      incrementMinutes: function() {
          this.selectedMinutes += 10;
        },
  
      decrementMinutes: function () {
        if(this.selectedMinutes > 10){
            this.selectedMinutes -= 10;
        }
      },
  
      startGame: function () {
        if (this.selectedGames.length === 0) {
            alert("Please select at least one game.");
            return;
        }
  
        if (this.participants.length === 0) {
            alert("No players have joined yet.");
            return;
        }
        
        // This is what we send to Data.js
        let gameData = {
            gamePin: this.gamePin,
            selectedGames: this.selectedGames,
            participants: this.participants,
            selectedMinutes: this.selectedMinutes
            //add gamesettings
        }
  
        socket.emit('startGame', gameData),

        this.$router.push({
          name: 'GameView',
        });   
      }
    }
  }
  </script>
  
  <style>
  
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
  
  
  </style>