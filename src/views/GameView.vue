<template>
     <Nav :hideNav="false"
  :uiLabels="uiLabels"
  :lang="lang"
  :gamePin="gamePin"
  @language-changed="handleLanguageChange">
  </Nav>
    <div v-if="!activeGame">
        <!--<TimerComponent/>-->
        <p>{{ this.gamePin }}</p>
        <p>{{ this.userName }}</p>
        <p>{{ this.gameData }}</p>

        <div class="button-container">
                <!-- Här skapas play-knappar för de valda spelen /theo -->
            <button v-for="game in this.gameData.selectedGames" v-on:click="playMiniGame(game)" v-bind:key="game" class="game-button">
                {{game}}    
            </button> 
        </div>
    </div>

    <div v-else>
        <GeneralQuizComponent
            v-if="activeGame === 'General Quiz'"
            :gameData="gameData"
            :gamePin="gamePin"
        />
    </div>


    
</template>


<script>
import Nav from '@/components/ResponsiveNav.vue'
    const socket = io("localhost:3000");
    import io from 'socket.io-client';  // kanske behövs /sebbe 
import GeneralQuizComponent from '../components/GeneralQuizComponent.vue';

    export default{
        name: 'GameView',
        components: {
            GeneralQuizComponent,
            Nav
        },
        data: function(){
            return {
                gamePin: '',
                userName: '',
                gameData: {},
                activeGame: null
            }
        },
        created: function() {
            
            socket.on('updateGameData', gameData => {
                this.gameData = gameData;
                console.log("Updated gameData to: ", this.gameData)
            });
            this.setup();
            // This will ensure the client will listen to messages emitted to the socket room. :)
            socket.emit('joinSocketRoom', this.gamePin);
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

            playMiniGame: function(game){
                this.activeGame = game;
                //socket.emit(miniGameStarted, gameid) ?? 
                // på något sätt få varje spels komponent aktiverad
                //theo
            }

        }
    }

</script>

<style>
    .game-button {
        width: 120px; /* Anpassa bredd */
        height: 50px; /* Anpassa höjd */
        margin: 10px; /* Mellanrum mellan knappar */
        background-color: #4CAF50; /* Grön bakgrundsfärg */
        color: white; /* Textfärg */
        font-size: 16px; /* Textstorlek */
        border: none; /* Ingen kantlinje */
        border-radius: 8px; /* Rundade hörn */
        cursor: pointer; /* Ändrar muspekaren vid hover */
        transition: background-color 0.3s ease, transform 0.2s ease; /* Mjuka animationer */
}   

    .game-button:hover {
        background-color: #45a049; /* Mörkare grön vid hover */
        transform: scale(1.1); /* Gör knappen större vid hover */
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2); /* Lägg till skugga vid hover */
    }

    .game-button:active {
        transform: scale(0.95); /* Gör knappen mindre vid klick */
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* Minska skugga vid klick */
    }

        




</style>
