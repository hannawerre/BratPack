<template>
    <TimerComponent :gamePin="gamePin" :selectedMinutes="gameData.selectedMinutes"></TimerComponent>
    <div v-if="!activeGame"> <!--Visas bara så länge inget spel är aktiverat-->

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
            @gameCompleted="onGameCompleted"
        />
        <ThisOrThatComponent 
            v-if="activeGame === 'ThisOrThat'" 
            :gameData="gameData" 
            :gamePin="gamePin" 
            :userName="userName"
            @gameCompleted="onGameCompleted"
        />
    </div>
</template>

<script>

    const socket = io("localhost:3000");
    import io from 'socket.io-client';
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
                activeGame: '',
                uiLabels: {},
                isAdmin: false,
                isPlaying: false
            }
        },
        created: function() {
            socket.on( "uiLabels", labels => this.uiLabels = labels );
            socket.on('updateGameData', gameData => {
                this.gameData = gameData;
                this.determineAdminStatus();
            });
            
            this.setup();
            // This will ensure the client will listen to messages emitted to the socket room. :)
            console.log(this.gamePin)
            socket.emit('joinSocketRoom', this.gamePin);
            socket.emit( "getUILabels", this.lang );
        },
        mounted: function() {
            socket.on("onGameStart", gameName=> this.activeGame = gameName);
            socket.on("participantsUpdate", participants => this.gameData.participants = participants)
            socket.emit('updateAllGameData', this.gamePin);
            console.log("Sent 'updateAllGameData' to gamePin: ", this.gamePin);
            window.addEventListener("beforeunload", this.handleWindowClose);
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
            },
            onGameCompleted() {
                this.activeGame = '';
            },
            // Delete user on window close / refresh
            handleWindowClose(event) {
            console.log("Window closed!!! Deleting user")
            socket.emit('deleteUser', this.gamePin, this.userName);
            }

        },
        beforeDestroy() {
            window.removeEventListener("beforeunload", this.handleWindowClose);
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
