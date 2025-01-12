<template>
    <ResponsiveNav
    :gamePin="gamePin"
    :userName="userName"
    :gameActive="true"
    />
    <!--Visas när inget spel är aktiverat-->
    <div v-if="!activeGame"> 

        <div class="button-container">
            
            <!-- TODO: Scoreboard -->

            <!-- Buttons only visible to admin -->
            <div v-if="this.isAdmin">
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

    <!--Game Components-->
    <div v-else-if="activeGame && isPlaying"> 
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
            :uiLabels="uiLabels"
            :userName="userName"
            @gameCompleted="onGameCompleted"
        />

        <WhosMostLikelyToComponent  
            v-if="activeGame === 'whosMostLikelyTo'"
            :gameData="gameData"
            :gamePin="gamePin"
            :uiLabels="uiLabels"
            :userName="userName"
            :isAdmin="isAdmin" />

    </div>
</template>

<script>

    const socket = io("localhost:3000");
    import io from 'socket.io-client';
    import GeneralQuizComponent from '../components/GeneralQuizComponent.vue';
    import ThisOrThatComponent from '../components/ThisOrThatComponent.vue';
    import TimerComponent from '../components/TimerComponent.vue';
    import WhosMostLikelyToComponent from '../components/WhosMostLikelyToComponent.vue';
    import ResponsiveNav from '../components/ResponsiveNav.vue';

    export default{
        name: 'GameView',
        components: {
            GeneralQuizComponent,
            ThisOrThatComponent,
            ResponsiveNav,
            TimerComponent,
            WhosMostLikelyToComponent
        },
        data: function(){
            return {
                lang: localStorage.getItem("lang") || "en",
                gamePin: '',
                userName: '',
                gameData: {},
                activeGame: '',
                uiLabels: {},
                isAdmin: false,
                isPlaying: false,
                lang: localStorage.getItem("lang") || "en"

            }
        },
        created: function() {
            socket.on( "uiLabels", labels => this.uiLabels = labels );
            socket.on('updateGameData', gameData => {
                this.gameData = gameData;
                this.determineAdminStatus();
            });
            this.setup();
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
                const user = this.gameData.participants?.find(p=> p.name === this.userName) // används user? /sebbe
                this.isAdmin = sessionStorage.getItem("isAdmin") === "true" || false;
                // If admin, and a userName exists in sessionStorage, the admin is playing.
                if(this.isAdmin) this.isPlaying = sessionStorage.getItem("userName") !== null; 
                console.log("Davids Log: Admin status: ", this.isAdmin);
            },

            playMiniGame: function(game){
                console.log("playMiniGame with this.activeGame =", this.activeGame, " and this.isAdmin = ", this.isAdmin)
                if(this.isAdmin){
                    socket.emit("startMiniGame", {
                        gameName: game, 
                        gamePin: this.gamePin
                })}
            },
            onGameCompleted() {
                this.activeGame = '';
            },
            // Delete user on window close / refresh
            handleWindowClose(event) {
            console.log("Window closed!!! Deleting user")
            socket.emit('deleteUser', this.gamePin, this.userName);
            },

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
