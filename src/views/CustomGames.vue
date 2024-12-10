<template>
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
        
        <router-link v-bind:to="{ name: 'EditView', params: { gameId: game.id } }" class="edit-button">
            <img src="/img/Gear-icon.png" alt="Edit" class="edit-icon" />
        </router-link>
  
    </div>
  
    <div class="startbutton-container">
        <button class="startbutton" @click="startGame">Start Game</button>
    </div>
  
  
  </template>
  
  <script>
  import io from 'socket.io-client' // samma
  const socket = io("localhost:3000") //tror vi behöver dessa /sebbe
  export default {
    name: 'CustomGames',
    components: {
  
    },
  
  data: function() {
      return{
          selectedMinutes: 60,
          games: [
            { id: 'game1', name: 'Quiz 1'} ,
            { id: 'game2', name: 'Quiz 2'},
            { id: 'game3', name: 'Quiz 3'},
            { id: 'game4', name: 'Quiz 4'}
          ],
          selectedGames: [],
          players: ['Player 1'],
          gamePin: null
        };
    },
    
  created: function () {
      this.gamePin = this.$route.query.gamePin; 
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
  
          if (this.players.length === 0) {
              alert("No players have joined yet.");
              return;
        }
  
          
          const gameData = {
              //detta är vad vi ska skicka till servern
              gamePin: this.gamePin,
              selectedGames: this.selectedGames,
              players: this.players,
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