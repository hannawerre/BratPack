<template>
    <div>
    <ResponsiveNav
    :uiLabels="uiLabels"
    :gamePin="gamePin"
    :userName="userName"
    :gameActive="true"
    />
    
     <button
        v-if="isAdmin"
  class="button blue"
        @click="goBackToMenu()">{{ uiLabels.GameView.menu }}</button> 


    <!--Game Components-->
    <div v-if="activeGame"> 
        <GeneralQuizComponent
            v-if="activeGame === 'generalQuiz'"
            :gameData="gameData"
            :gamePin="gamePin"
            :uiLabels="uiLabels"
            :isAdmin="isAdmin"
            :userName="userName"
            :isPlaying="isPlaying"
            @gameCompleted="onGameCompleted"
        />
        <ThisOrThatComponent 
            v-if="activeGame === 'thisOrThat' && isPlaying" 
            :socket="socket"
            :lang="lang"
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
            :isAdmin="isAdmin" 
            :isPlaying="isPlaying"
            @gameCompleted="onGameCompleted"
            />
    </div>

    <ScoreBoardComponent 
    :participants="gameData.participants"
    :uiLabels="uiLabels"/>
    
    <div v-if="!activeGame">
       <div class="button-container">


           <div v-if="this.isAdmin">
               <div v-for="gameName in gameData.selectedGames"
                   :key="gameName"
                   >
               <button
               v-if="!playedGames.includes(gameName)"
               class="button blue"
                   @click="playMiniGame(gameName)"
                  
                  
                   >
                       {{ gameName }}
               </button></div>




           </div>
       </div>
   </div>
</div>
</template>

<script>
    import io from 'socket.io-client';
    sessionStorage.setItem("dataServer", "");
    const socket = io(sessionStorage.getItem("dateServer"));
    import GeneralQuizComponent from '../components/GeneralQuizComponent.vue';
    import ThisOrThatComponent from '../components/ThisOrThatComponent.vue';
    import WhosMostLikelyToComponent from '../components/WhosMostLikelyToComponent.vue';
    import ResponsiveNav from '../components/ResponsiveNav.vue';
    import ScoreBoardComponent from '../components/ScoreBoardComponent.vue';


    export default{
        name: 'GameView',
        components: {
            GeneralQuizComponent,
            ThisOrThatComponent,
            ResponsiveNav,
            ScoreBoardComponent,
            WhosMostLikelyToComponent
        },
        data: function(){
            return {
                socket:null,
                lang: localStorage.getItem("lang") || "en",
                gamePin: '',
                userName: '',
                gameData: {},
                activeGame: '',
                uiLabels: {},
                playedGames: [],
                isAdmin: false,
                isPlaying: true

            }
        },
        created: function() {
            this.socket = io("localhost:3000"); // TODO: Fråga micke vilket sätt är bäst att instansiera ny socket?
            this.socket.on( "uiLabels", labels => this.uiLabels = labels );
            this.socket.on('updateGameData', gameData => {
                this.gameData = gameData;
                this.determineAdminStatus();
            });
            this.setup();
            this.socket.emit('joinSocketRoom', this.gamePin);
            this.socket.emit( "getUILabels", this.lang );

            
        },
        mounted: function() {
            this.socket.on("onGameStart", gameName=> this.activeGame = gameName);
            this.socket.on("participantsUpdate", participants => this.gameData.participants = participants)
            this.socket.emit('updateAllGameData', this.gamePin);
            console.log("Sent 'updateAllGameData' to gamePin: ", this.gamePin);
            window.addEventListener("beforeunload", this.handleWindowClose);
        },
        methods: {
            setup: function(){
                this.gamePin = this.$route.params.gamePin;
                this.userName = sessionStorage.getItem('userName');
                this.socket.emit('requestGameData', this.gamePin);
            },

            handleLanguageChange(newLang) {
                this.lang = newLang;
                sessionStorage.setItem("lang", newLang);
                socket.emit("getUILabels", this.lang);
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
                    this.socket.emit("startMiniGame", {
                        gameName: game, 
                        gamePin: this.gamePin
                })}
            },
            onGameCompleted() {
                console.log("spelet som är spelat är ", this.activeGame);
               this.playedGames.push(this.activeGame);
               console.log("spelet som är playedGames är ", this.playedGames);
               this.activeGame = '';
            },
            // Delete user on window close / refresh
            handleWindowClose(event) {
            console.log("Window closed!!! Deleting user")
            this.socket.emit('deleteUser', this.gamePin, this.userName);
            },
        },
        beforeDestroy() {
            console.log("->GameView -> beforeDestroy");
            window.removeEventListener("beforeunload", this.handleWindowClose);
            // this.dismantleSocket();
        },
    }

</script>

<style>


.button-container div {
  display: flex;
  gap: 10px; 
  flex-wrap: wrap; 
  justify-content: center; 
}

.button-container button {
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}


</style>
