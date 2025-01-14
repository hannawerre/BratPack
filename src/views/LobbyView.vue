<template>

  <Nav 
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
        :placeholder="uiLabels.LobbyView.userName"
      />
      <p class="error-message" v-if="nameTaken">{{ uiLabels.LobbyView.nameTaken }}</p>
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
     
      <div>
        <h3>{{ this.uiLabels.players }}</h3>
        <p v-for="participant in participants" :key="participant.name">{{ participant.name }}</p>
      </div>
    </div>
</template>


<script>
import Nav from '@/components/ResponsiveNav.vue'
import io from 'socket.io-client';
//const socket = io("localhost:3000");
sessionStorage.setItem("dataServer", "");
const socket = io(sessionStorage.getItem("dateServer")); 

export default {
  name: 'LobbyView',
  components: {
    Nav
  },
  data: function () {
    return {
      userName: "",
      nameTaken: false,
      gameStarted: false, // If a user joins late
      gamePin: "inactive game",
      uiLabels: {},
      joined: false,
      lang: sessionStorage.getItem("lang") || "en",
      participants: [],
    }
  },
  created: function () {
    this.gamePin = this.$route.params.id;
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.on( "participantsUpdate", p => {
      this.participants = p;
      console.log("Socket ID: ", socket.id) 
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
        scoreGame3: 0
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
      this.showError = false; 
    },

    // Delete user on window close / refresh
    handleWindowClose(event) {
      console.log("Window closed!!! Deleting user")
      socket.emit('deleteUser', this.gamePin, this.userName);
    },
    
    // TODO: Currently not used, but saving it for later purposes. /sebbe
    checkIfRefreshPage() {
    // Check if there already is a name in sessionStorage. If there is, user will pick it up and join the lobby with it.
      let storageName = sessionStorage.getItem('userName');
      if (storageName) {
        this.joined = true;
        
        this.userName = storageName;
        socket.emit("requestParticipants", this.gamePin);
        console.log("Checking if refresh... storageName =", storageName, "with this.userName =", this.userName);
        console.log("Current participants: ", this.participants);
      }
      else {
        console.log("No userName found in sessionStorage.");
        this.joined = false;  
        this.userName = ""; 
      }
    },
  },
  mounted() {
    window.addEventListener("beforeunload", this.handleWindowClose);
  },  
  beforeDestroy() {
    window.removeEventListener("beforeunload", this.handleWindowClose);
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
  font-size: 3rem;
  color: #1d3557;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  text-align: center;
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
  text-align: center;
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
  background-color: #1d3557;
  border-radius: 15px;
  
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.7);
  width: 70%;
  margin: 3% 0% 0% 15%;
  box-sizing: border-box;
  padding: 10px;
  color: rgb(225, 220, 220);
}

.waitingRoom p {
  padding: 10px;
  margin: 5px 0;
  background-color: rgba(69, 123, 157, 0.1);
  border-radius: 8px;
  text-align: center;
  font-size: 1.2rem;
  font-weight: 700;
}


@media (max-width: 500px) {
  .lobby-id {
    font-size: 2rem;
  }
  .join-game-input {
    font-size: 0.9rem;
    width: 80%;
  }
  .submit-button {
    font-size: 0.9rem;
    padding: 10px;
    width:80%;
  }
}

</style>
