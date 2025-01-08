<template>
<div class="container">
  <div class="main-content">
  <h1 v-if="gamePin">Game PIN: {{ gamePin }}</h1>
  <h1 v-else>Loading Game PIN...</h1>

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
      ref="modalQuiz1" 
      :GameName="currentGame ? currentGame.name : ''"
      @modal-closed="onModalClosed"
      @questions-saved-quiz1="onQuestionsSaved"
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
        <li v-for="(participant, index) in participants" :key="index">
          <strong>{{ participant.name }}</strong> 
          <span v-if="participant.isAdmin && participant.isPlaying">: Admin & Playing</span>
          <span v-else-if="participant.isAdmin">: Admin</span>
          <span v-else-if="participant.isPlaying">- Playing</span>
          <span v-else>- Spectator</span>
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



export default {
name: 'CustomGames',
components: {
  EditQuiz1Component,
  EditQuiz2Component,
  EditQuiz3Component,
  EditQuiz4Component
},
data: function() {
  return {
    lang:'en',
    selectedMinutes: 60,
    games: [
      // { id: 'General Quiz', name: 'Quiz 1'} ,
      // { id: 'Who´s most likely', name: 'Quiz 2'},
      // { id: 'Music quiz', name: 'Quiz 3'},
      // { id: 'This or that', name: 'Quiz 4'}
      { id: 'Quiz1', name: 'General Quiz'} ,
      { id: 'Quiz2', name: 'Who´s most likely'},
      { id: 'Quiz3', name: 'Music quiz'},
      { id: 'Quiz4', name: 'This or that'}
    ],
    selectedGames: [],
    participants: [],
    gamePin: '',
    currentGame: null,
    customQuestions:{},
    useStandardQuestions: true,
    useOwnQuestions: false,
    active: true,
    userName: ''

  };
},
watch: {
    selectedGames(newVal) {
      sessionStorage.setItem("selectedGames", JSON.stringify(newVal));
    }
  },

created: function () {
  socket.on("updateGameData", (gameData) => {
      if (gameData.selectedGames && gameData.selectedGames.length > 0) {
        this.selectedGames = gameData.selectedGames;
    }
    if (gameData.customQuestions && gameData.customQuestions.length > 0) {
        this.customQuestions = gameData.customQuestions;
    }
    if (gameData.useStandardQuestions) {
        this.useStandardQuestions = gameData.useStandardQuestions;
    }
    if (gameData.customQuestions && gameData.customQuestions.length > 0) {
        this.customQuestions = gameData.customQuestions;
    }

    this.participants = gameData.participants;
    this.selectedMinutes = gameData.selectedMinutes;
    console.log("Updated gameData, participants: ", this.participants);
    this.userName = this.participants[0]
    console.log("Username: ", this.userName);
  });

  
    console.log("Insde else-statement with participants: ", this.participants)
    this.gamePin = this.$route.params.gamePin;
    console.log("GamePin: ", this.gamePin);
    socket.emit("joinCustomGame",this.gamePin);
    socket.emit("requestGameData", this.gamePin);

  socket.on('participantsUpdate', participants => {
    this.participants = participants;
    console.log("Active participants: ", this.participants);
    
  });
  socket.on('lobbyUnactive',(gamePin) => {
    console.log("Unactivating lobby", gamePin);

    participants.forEach(participant => {
    console.log(`Participant: ${participant.name}, isPlaying: ${participant.isPlaying}`);
  });
  });
  socket.emit("requestParticipants", this.gamePin);
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

  startGame: function () {
    if (this.selectedGames.length === 0) {
      alert("Please select at least one game.");
      return;
    }

    if (this.participants.length === 0) {
      alert("No players have joined yet.");
      return;
    }

    // Simulera timerstart lokalt för teständamål
    let countDownDate = Date.now() + this.selectedMinutes * 60 * 1000;

    const interval = setInterval(() => {
        const now = Date.now();
        const distance = countDownDate - now;

        if (distance <= 0) {
            clearInterval(interval);
            socket.emit('update-timer', {
                timerDisplay: "Tiden är slut!",
                soundType: "alarm"
            });
            return;
        }

        const totalSeconds = Math.floor(distance / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        socket.emit('update-timer', {
            timerDisplay: `${minutes}m ${seconds}s`,
            soundType: totalSeconds % 60 === 0 ? "alarm" : null
        });
    }, 1000);

    console.log("Timer startad i CustomGameView för test.");
    
    let gameData = {  // borde den inte vara const? /theo
      gamePin: this.gamePin,
      selectedGames: this.selectedGames,
      participants: this.participants,
      selectedMinutes: this.selectedMinutes
      //lang: this.lang språk sparas i gameData eller localStorage?
    }

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
    if (game.id === 'Quiz1') {
      this.$refs.modalQuiz1.openModal();
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

  onQuestionsSaved(customQuestions, useStandardQuestions, useOwnQuestions, quiz) {
    if (!this.customQuestions[quiz]) {
    this.customQuestions[quiz] = {};
  }

  // 2) Now you can safely set properties
  this.customQuestions[quiz].customQuestions = customQuestions;
  this.customQuestions[quiz].useStandardQuestions = useStandardQuestions;
  this.customQuestions[quiz].useOwnQuestions = useOwnQuestions;

  console.log(
    'Questions received from child:',
    quiz, 
    this.customQuestions[quiz].customQuestions,
    this.customQuestions[quiz].useStandardQuestions,
    this.customQuestions[quiz].useOwnQuestions
  );

  // 3) If you also want to emit all custom questions
  socket.emit(
    "savedQuestionsToServer", 
    this.gamePin, 
    this.customQuestions, 
    this.useStandardQuestions, 
    this.useOwnQuestions, 
    quiz
  );
},

  handleWindowClose(event) {
      // console.log("Admin window closed! unactivating lobby")
      // socket.emit("adminLeftGame", this.gamePin, this.username);
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
        useOwnQuestions: this.useOwnQuestions,
        active: true
      }
      console.log("gameData: ", gameData);
      socket.emit('updateSettings', gameData);
    },
    deleteGame: function() {
      console.log("Pressed delete game button");
      socket.emit('deleteGame', this.gamePin);
    },
    unactiveGame: function() {
      console.log("Pressed unactive game button");
      socket.emit('unactiveLobby', this.gamePin);
    },
    logGameData: function() {
      console.log("Pressed log game data button");
      socket.emit('requestGameData', this.gamePin);
      console.log("Game data: ", this.gamePin, this.selectedGames, this.participants, this.selectedMinutes, this.customQuestions, this.useStandardQuestions, this.useOwnQuestions, this.active);
    }
  },
mounted() {
    window.addEventListener("beforeunload", this.handleWindowClose);
    this.checkIfRefreshPage();
    const savedSelectedGames = sessionStorage.getItem("selectedGames");
    if (savedSelectedGames) {
    // 2. Parse and set it back to your data
    this.selectedGames = JSON.parse(savedSelectedGames);
    // socket.emit("newAdmin", this.userName)
    // console.log("Asked to become new admin: ", this.userName)
  }
  },
beforeDestroy() {
    window.removeEventListener("beforeunload", this.handleWindowClose);
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