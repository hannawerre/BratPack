<template>
    <TimerComponent :gamePin="gamePin" :selectedMinutes="gameData.selectedMinutes"></TimerComponent>

    <div v-if="!activeGame"> <!--Visas bara så länge inget spel är aktiverat-->

        <ThisOrThatComponent v-if="gameData.selectedGames.includes('ThisOrThat')" :gameData="gameData" :gamePin="gamePin" :userName="userName"></ThisOrThatComponent>

        <div v-for="participant in gameData.participants" :key="participant.name" class="button-container">
            <div>
                <span>{{ participant.name }}</span> 
                <span v-if="participant.isAdmin">(Admin)</span>
            </div>
  <!-- Visa bara knapparna om detta är den inloggade användarens namn OCH om den är admin -->
            <div v-if="participant.name === this.userName && participant.isAdmin">
                <button
                    v-for="gameName in gameData.selectedGames"
                    :key="gameName"
                    class="game-button"
                    @click="playMiniGame(gameName)"
                    >
                        {{ gameName }}
                </button>
            </div>
        </div>

        

        
    </div>

    <div v-else> <!--Visas bara så länge ett spel är aktiverat-->
        <GeneralQuizComponent
            v-if="activeGame === 'generalQuiz'"
            :gameData="gameData"
            :gamePin="gamePin"
            :uiLabels="uiLabels"
            :isAdmin="isAdmin"
            :isPlaying="isPlaying"
        />
    </div>


    
</template>




<script>
    //import {socket} from '../socketClient.js';  // kanske behövs /sebbe 
    
    
    const socket = io("localhost:3000");
    import io from 'socket.io-client';  // kanske behövs /sebbe 
    import GeneralQuizComponent from '../components/GeneralQuizComponent.vue';
    import ThisOrThatComponent from '../components/ThisOrThatComponent.vue';
    import TimerComponent from '../components/TimerComponent.vue';

    export default{
        name: 'GameView',
        components: {
            GeneralQuizComponent,
            ThisOrThatComponent,
            TimerComponent
        },
        data: function(){
            return {
                gamePin: '',
                userName: '',
                gameData: {},
                uiLabels: {},
                isAdmin: false,
                isPlaying: false
            }
        },
        created: function() {
            socket.on( "uiLabels", labels => this.uiLabels = labels );
            socket.on('updateGameData', gameData => {
                this.gameData = gameData;
                console.log("Updated gameData to: ", this.gameData)
                this.determineAdminStatus();
            });
            
            socket.on("newStatement", (newStatement) => {
            console.log("Received new statement:", newStatement);
            this.nextMiniGame(); // Återställ och starta om minispel
            });

            this.setup();
            // This will ensure the client will listen to messages emitted to the socket room. :)
            socket.emit('joinSocketRoom', this.gamePin);
            socket.emit( "getUILabels", this.lang );
        },
        mounted: function() {
            socket.emit('updateAllGameData', this.gamePin);
            console.log("Sent 'updateAllGameData' to gamePin: ", this.gamePin)

        },
        methods: {
            setup: function(){
                this.gamePin = this.$route.params.gamePin;
                this.userName = sessionStorage.getItem('userName');
                socket.emit('requestGameData', this.gamePin);
            },
            determineAdminStatus () {
                const user = this.gameData.participants?.find(p=> p.name === this.userName)
                this.isAdmin = user ? user.isAdmin : false;
                this.isPlaying = user ? user.isPlaying : false;
            },

            playMiniGame: function(game){
                if(this.isAdmin){
                    socket.emit("startMiniGame", {
                        gameName: game, 
                        gamePin: this.gamePin
                })}
                //socket.emit(miniGameStarted, gameid) ?? 
                // på något sätt få varje spels komponent aktiverad
                //theo
            }

        }
    }

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