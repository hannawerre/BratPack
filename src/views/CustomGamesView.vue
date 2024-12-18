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
        
        <!-- <router-link v-bind:to="{ name: 'EditView', params: { gameId: game.id } }" class="edit-button">
            <img src="/img/Gear-icon.png" alt="Edit" class="edit-icon" />
        </router-link> -->

        <div @click="openModal(game)" class="edit-button">
          <img src="/img/Gear-icon.png" alt="Edit" class="edit-icon" />
        </div>
        
    </div>
    <Modal 
          ref="modalRef" 
          :GameName='currentGame ? currentGame.name : ""'
          @modal-closed="onModalClosed"/>
  
    <div class="startbutton-container">
        <button class="startbutton" @click="startGame">Start Game</button>
    </div>
  
  
  </template>
  
  <script>
  import io from 'socket.io-client';   // These are needed for the socket communication
  import Modal from '../components/EditComponent.vue';

  const socket = io("localhost:3000");

  export default {
    name: 'CustomGames',
    components: {
      Modal
    },
    data: function() {
      return{
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
    // If there is no gamePin in the url, it means that this is the first time the created hook is initiated.
    // This if-statement ensures new games aren't created when the user just refreshes the site.
    if (!this.$route.params.gamePin) { 
      socket.on('gameCreated', pin => {
        this.gamePin = pin
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
      console.log("Insde else-statement with participants: ", this.participants)
      this.gamePin = this.$route.params.gamePin; // just nu kommer gamePin finnas kvar vid refresh, men jag tror att all game data raderas
      console.log("GamePin: ", this.gamePin);
      socket.emit("joinCustomGame",this.gamePin);

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
      },
      openModal(game) {
        this.currentGame = game;
        this.$refs.modalRef.openModal();
      },
      onModalClosed() {
        console.log('Modalen är stängd');
        this.currentGame = null;
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
  padding: 6px 6px;
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