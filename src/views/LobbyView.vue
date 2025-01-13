<template>
  <Nav 
    :hideNav="false"
    :uiLabels="uiLabels"
    :lang="lang"
    :showLangSwitch="true"
    @language-changed="handleLanguageChange">
  </Nav>
  <h3 class="lobby-id">{{ uiLabels.LobbyView.lobbyID }}: {{ gamePin }}</h3>
  <div v-if="!this.joined" class="join-game-container">
    <div
      class="join-game-wrapper"
      :class="{'shake': nameTaken || showError}"
    >
      <input
        class="join-game-input"
        type="text"
        v-model="userName"
        @input="validateInput"
        @keyup.enter="handleEnter"
        :placeholder="uiLabels.userName"
      />
      <p class="error-message" v-if="nameTaken">{{ uiLabels.LobbyView.nameTaken }}</p>
      <!-- uilabels -->
      <p class="error-message" v-if="showError">Please enter a username!</p> 
    </div>
    <button
      class="submit-button"
      :class="{'disabled': nameTaken || userName.length === 0}"
      @click="handleEnter"
    >
    {{ uiLabels.LobbyView.participateInPoll }}
    </button>
  </div>
    <div class="waitingRoom" v-if="joined">
      <p>{{ uiLabels.LobbyView.waitingForHost }}</p>
      <div>
        <h3>{{ this.uiLabels.players }}</h3>
        <p v-for="participant in participants" :key="participant.name">{{ participant.name }}</p>
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
      lang: sessionStorage.getItem("lang") || "en",
      participants: [],
      uiLabels: {},
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
    socket.emit( "getUILabels", this.lang);
  },
  methods: {
    handleEnter() {
      console.log("Inside handleEnter with this.userName=", this.userName)
      if (this.userName.length === 0) {
        this.triggerError();
        return;
      }
      if (!this.nameTaken) {
        this.participateInCustomGame();
      } 
      else {
        this.triggerError();
      }
    },
    triggerError() {
      this.showError = this.userName.length === 0;
      this.nameTaken = !this.showError;
      setTimeout(() => {
        this.showError = false;
      }, 1000);
    },
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
      sessionStorage.setItem("lang", newLang);
      socket.emit("getUILabels", this.lang);
    },
    validateInput() {
      this.nameTaken = this.participants.some(participant => participant.name === this.userName);
      this.showError = false; // Reset error state on new input
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
    },
  },
  mounted() {
    window.addEventListener("beforeunload", this.handleWindowClose);
    //this.checkIfRefreshPage();
  },  
  beforeDestroy() {
    window.removeEventListener("beforeunload", this.handleWindowClose);
    // if (this.socket) {
    //             this.socket.emit('leaveSocketRoom', this.gamePin); // Leave the room
    //             this.socket.disconnect(); // Disconnect the socket
    //             this.socket = null;
    //         }
    },
}
</script>

<style scoped>

.join-game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 20px auto;
  max-width: 400px;
  text-align: center;
}

.lobby-id {
  font-size: 1.2rem;
  color: #1d3557;
  margin-bottom: 20px;
}

.join-game-wrapper {
  position: relative;
  width: 100%;
  margin-bottom: 10px;
}

.join-game-wrapper.shake .join-game-input {
  border-color: red;
  animation: shake 0.5s ease-in-out;
}

.join-game-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #457b9d;
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.join-game-input:focus {
  border-color: #1d3557;
  box-shadow: 0 0 8px rgba(29, 53, 87, 0.4);
}

.error-message {
  font-size: 0.875rem;
  color: red;
  margin-top: 5px;
}

.submit-button {
  width: 100%;
  padding: 12px 16px;
  background-color: #1d3557;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, opacity 0.3s ease;
}

.submit-button:hover:not(.disabled) {
  background-color: #457b9d;
}

.submit-button.disabled {
  opacity: 0.5;
  pointer-events: none;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25%, 75% {
    transform: translateX(-5px);
  }
  50% {
    transform: translateX(5px);
  }
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
