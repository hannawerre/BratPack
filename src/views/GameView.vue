<template>
    <TimerComponent :gamePin="gamePin" :selectedMinutes="gameData.selectedMinutes"></TimerComponent>
    <div v-if="!activeGame"> <!--Visas bara så länge inget spel är aktiverat-->

        <div class="button-container">
            <div v-for="participant in gameData.participants" :key="participant.name" >
                <span>{{ participant.name }}</span> 
            </div>
  <!-- Visa bara knapparna om detta är den inloggade användarens namn OCH om den är admin -->
            <div v-if="this.isAdmin">
                <button
                    v-for="gameName in gameData.selectedGames"
                    :key="gameName"
                    class="button blue"
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
                isAdmin: false

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
                this.isAdmin = sessionStorage.getItem("isAdmin") === "true" || false;
                console.log("Davids Log: Admin status: ", this.isAdmin);    
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

