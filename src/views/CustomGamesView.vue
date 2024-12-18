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
  </div>
</div>
  <div class="participants">
    <h2>Participants</h2>
    <ul>
      <li v-for="(participant, index) in participants" :key="index"> 
        {{ participant}}
      </li>

    </ul>

  </div>
  </div>
</template>

<script>
import io from 'socket.io-client';   
import EditQuiz1Component from '../components/EditQuiz1Component.vue';
import EditQuiz2Component from '../components/EditQuiz2Component.vue';
import EditQuiz3Component from '../components/EditQuiz3Component.vue';
import EditQuiz4Component from '../components/EditQuiz4Component.vue';

const socket = io("localhost:3000");

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
      { id: 'game1', name: 'Quiz 1'} ,
      { id: 'game2', name: 'Quiz 2'},
      { id: 'game3', name: 'Quiz 3'},
      { id: 'game4', name: 'Quiz 4'}
    ],
    selectedGames: [],
    participants: [],
    gamePin: '',
    currentGame: null,
  };
},

created: function () {
  socket.on("updateGameData", function(gameData) {
    this.selectedGames = gameData.selectedGames;
    this.participants = gameData.participants;
    this.selectedMinutes = gameData.selectedMinutes;
    console.log("Updated gameData to: ", this.participants)
  })

  if (!this.$route.params.gamePin) { 
    socket.on('gameCreated', pin => {
      this.gamePin = pin
      socket.emit('joinCustomGame', pin); 
      this.$router.replace({ path: `/customgames/${pin}` });
    });
    console.log("Listener for 'gameCreated' in CustomGamesView.vue is active");
    socket.emit("createGame", this.lang);
    console.log("Emitted createGame from CustomGamesView.vue")
  } else { 
    console.log("Insde else-statement with participants: ", this.participants)
    this.gamePin = this.$route.params.gamePin;
    console.log("GamePin: ", this.gamePin);
    socket.emit("joinCustomGame",this.gamePin);
    socket.emit("requestGameData", this.gamePin);
  };

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
    
    let gameData = {
      gamePin: this.gamePin,
      selectedGames: this.selectedGames,
      participants: this.participants,
      selectedMinutes: this.selectedMinutes
    }

    socket.emit('startGame', gameData),
    this.$router.push({
      name: 'GameView',
    });   
  },

  openModal(game) {
    this.currentGame = game;
    // Öppna rätt modal baserat på vilken quiz det är
    if (game.name === 'Quiz 1') {
      this.$refs.modalQuiz1.openModal();
    } else if (game.name === 'Quiz 2') {
      this.$refs.modalQuiz2.openModal();
    } else if (game.name === 'Quiz 3') {
      this.$refs.modalQuiz3.openModal();
    } else if (game.name === 'Quiz 4') {
      this.$refs.modalQuiz4.openModal();
    }
  },

  onModalClosed() {
    console.log('Modalen är stängd');
    this.currentGame = null;
  }
}
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