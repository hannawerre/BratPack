<template>
  <Nav :hideNav="false"
  :uiLabels="uiLabels"
  :lang="lang"
  @language-changed="handleLanguageChange">
  </Nav>
  
  <div>
    <h3>Lobby ID: {{gamePin}}</h3>
    <div class="textBox-wrapper" style="width: 50%;" v-if="!joined">
      <input class="textBox input" type="text" v-model="userName" @input=isNameTaken(userName) :placeholder=this.uiLabels.userName>
      <button class="button blue small" v-if="!nameTaken" v-on:click="participateInCustomGame">
        {{ this.uiLabels.participateInPoll }}
      </button>
      <p v-else>
        Name taken!
      </p>
    </div>
    <p>{{ this.uiLabels.waitingForHost }}</p>
    <div class="waitingRoom" v-if="joined">
      <div>
        <h3>{{ this.uiLabels.players }}</h3>
        <p v-for="participant in participants">{{ participant }}</p>
      </div>
  </div>
  </div>
</template>

<script>
import Nav from '@/components/ResponsiveNav.vue'
import io from 'socket.io-client';
const socket = io("localhost:3000");

export default {
  name: 'LobbyView',
  components: {Nav},
  data: function () {
    return {
      userName: "",
      nameTaken: false,
      gameStarted: false,
      gamePin: "inactive game",
      uiLabels: {},
      joined: false,
      lang: localStorage.getItem("lang") || "en",
      participants: [],
      uiLabels: {}
    }
  },
  created: function () {
    this.gamePin = this.$route.params.id;
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.on( "participantsUpdate", p => {
      this.participants = p;
      console.log("Socket ID: ", socket.id) // kanske spara ner socketID i dataobjektet ovan...? 
                                            // Eller spara userName: socketID som key value pairs i Data.js /sebbe
    });
    socket.on("updateGameData", data => {
      this.gameStarted = data.gameStarted;
      this.participants = data.participants;
    });
    socket.on( "startGame", () => this.$router.push("/game/" + this.gamePin) );
    socket.emit( "joinCustomGame", this.gamePin );
    socket.emit( "getUILabels", this.lang );
  },
  methods: {
    participateInCustomGame: function () {
      socket.emit( "participateInCustomGame", this.gamePin, {
        name: this.userName,
        scoreGame1: 0,
        scoreGame2: 0,
        scoreGame3: 0,
        scoreGame4: 0
      });
      this.joined = true;
      
      // Detta kan vara användbart senare om vi ska lösa så att användare inte raderas vid refresh! /sebbe
      // Används också i skrivande stund så att varje persons userName skickas över till GameView rätt.
      sessionStorage.setItem('userName', this.userName);
      sessionStorage.setItem('isAdmin', false); 
      console.log("Updated sessionStorage with item ('userName',", this.userName, ")");
      
      // This if statement checks if the game is already running. In that case, the user will immediately get pushed to GameView!
      if(this.gameStarted) {
        console.log("In if statement data.gamestarted: ", this.gameStarted)
        this.$router.push("/game/" + this.gamePin);
      };
    },
    handleLanguageChange(newLang) {
      this.lang = newLang;
      localStorage.setItem("lang", newLang);
      socket.emit("getUILabels", this.lang);
    },
    isNameTaken(userName) {
        this.nameTaken = this.participants.some(participant => participant.name === userName);
        console.log("Name taken: ", this.nameTaken);
        console.log("All participants: ", this.participants);
    },

    // Delete user on window close / refresh
    handleWindowClose(event) {
      console.log("Window closed!!! Deleting user")
      socket.emit('deleteUser', this.gamePin, this.userName);
    },
    // Denna används inte för tillfället. Kan komma att användas om vi ska fixa så att användare inte raderas vid refresh! /sebbe
    checkIfRefreshPage() {
    // Check if there already is a name in sessionStorage. If there is, user will pick it up and join the lobby with it.
      let storageName = sessionStorage.getItem('userName');
      if (storageName) {
        this.joined = true;
        
        this.userName = storageName;
        socket.emit("requestParticipants", this.gamePin);
        console.log("Checking if refresh... storageName =", storageName, "with this.userName =", this.userName);
        console.log("Current participants: ", this.participants);
        // TODO: Senare när vi sparar mer än bara userName, måste vi ha nån sorts getmetod här som hämtar all relevant data
        // kopplad till userName från Data.js
      }
      else {
        console.log("No userName found in sessionStorage.");
        this.joined = false; // Default value if userName doesn't exist
        this.userName = ""; // Ensure userName is initialized to an empty string
      }
    }
  },
  mounted() {
    window.addEventListener("beforeunload", this.handleWindowClose);
    //this.checkIfRefreshPage();
  },
  beforeDestroy() {
    window.removeEventListener("beforeunload", this.handleWindowClose);
  }
}
</script>

<style scoped>

.container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 20px;
}

.waitingRoom div{
  /* how do i get it to be centered? */
  background-color: lightblue;
  border-radius: 15px;
  border: 2px solid var(--our-darkBlue);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.7);
  width: 70%;
  margin: 3% 0% 0% 15%;
  box-sizing: border-box;
  padding: 10px;
}

.waitingRoom p { /* vill ha som i customGamesView men de fungrar ej*/
  padding: 5px 0;
  border-bottom: 1px solid var(--our-darkBlue);
}

@media (max-width: 768px) {
  .waitingRoom {
    min-width: 90%;
    margin: 5% auto;
  }
}
</style>
