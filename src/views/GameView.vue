<template>
  <div v-if="!activeGame">
     
      <p>{{ this.gamePin }}</p>
      <p>{{ this.userName }}</p>
      <p>{{ this.gameData }}</p>


      <div class="button-container">
              <!-- Här skapas play-knappar för de valda spelen /theo -->
              <button
              v-for="game in gameData.selectedGames"
              :key="game"
              class="game-button"
              @click="playMiniGame(game)"
          >
              {{game}}   
          </button>
      </div>
  </div>


  <div v-else>
      <component
          :is="getActiveComponent"
          :gameData="gameData"
          :gamePin="gamePin"
         
     />
      <!-- Ta bort raden nedan när spelet fungerar -->
      <p>Active Component: {{ getActiveComponent }}</p>


  </div>




 
</template>




<script>
  import io from 'socket.io-client';
  const socket = io("localhost:3000");
  
import GeneralQuizComponent from '../components/GeneralQuizComponent.vue';
import WhosMostLikelyToComponent from '../components/WhosMostLikelyToComponent.vue';
//import MusicQuizComponent from '../components/MusicQuizComponent.vue';
//import ThisOrThatComponent from '../components/ThisOrThatComponent.vue';


  export default{
      name: 'GameView',
      components: {
          GeneralQuizComponent,
          WhosMostLikelyToComponent
          //MusicQuizComponent,
          //ThisOrThatComponent


      },
      data()  {
          return {
              
              gamePin: this.$route.params.gamePin || '',
              userName: '',
              gameData: {},
              activeGame: null
          };
      },
      created() {
  
  socket.on('updateGameData', (gameData) => {
    this.gameData = gameData;
    console.log("Updated gameData to: ", this.gameData);
  });

  socket.on("newStatement", (newStatement) => {
    console.log("Received new statement:", newStatement);
    this.nextMiniGame(); // Återställ och starta om minispel
  });

  this.setup();
  // Ensure the client listens to messages emitted to the socket room
  socket.emit('joinSocketRoom', this.gamePin);
},

      
      mounted() {
  // Kontrollera om gamePin finns
  if (!this.gamePin) {
      console.warn("gamePin saknas i props. Försöker hämta från localStorage...");


      // Försök hämta från localStorage
      const storedGamePin = localStorage.getItem("gamePin");


      if (storedGamePin) {
          console.log("Hittade gamePin i localStorage:", storedGamePin);
          this.gamePin = storedGamePin; // Sätt gamePin från localStorage
      } else {
          console.error("gamePin saknas både i props och localStorage! Applikationen kanske inte fungerar korrekt.");
          return; // Avbryt om inget gamePin finns
      }
  }


  // Skicka gamePin till servern för att uppdatera gameData
  socket.emit('updateAllGameData', this.gamePin);
  console.log("Sent 'updateAllGameData' to gamePin: ", this.gamePin);
},


      methods: {
          
          setup(){
              this.gamePin = this.$route.params.gamePin;
              this.userName = sessionStorage.getItem('userName');
              socket.emit('requestGameData', this.gamePin);
          },


          playMiniGame(game){
              console.log("button clicked, selcted game:", game); // Logga vilket spel som valts
              this.activeGame = game;
              //socket.emit(miniGameStarted, gameid) ??
              // på något sätt få varje spels komponent aktiverad
              //theo
              console.log("Active game set to:", this.activeGame);
          },
          nextMiniGame() {
  const activeGame = this.activeGame;
  this.activeGame = null; // Återställ
  setTimeout(() => {
    this.activeGame = activeGame; // Starta om samma minispel
  }, 100); // Ge Vue tid att uppdatera
}



      },
      computed: {
          getActiveComponent(){


              const gameMap = {
                  "General Quiz": 'GeneralQuizComponent',
                  "Who's most likely": 'WhosMostLikelyToComponent'
                  //'Music quiz': 'MusicQuizComponent',
                  //'This or that': 'ThisOrThatComponent'
              };
              console.log(  "Active game:", this.activeGame);
              return gameMap[this.activeGame]|| null;
          }


      }
  };


</script>


<style>
  .game-button {
      width: 120px; 
      height: 50px; 
      margin: 10px; 
      background-color: #4CAF50; 
      color: white;
      font-size: 16px; 
      border: none; 
      border-radius: 8px; 
      cursor: pointer; 
      transition: background-color 0.3s ease, transform 0.2s ease; 
}  


  .game-button:hover {
      background-color: #45a049; 
      transform: scale(1.1);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2); 
  }


  .game-button:active {
      transform: scale(0.95); 
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); 
  }


     








</style>