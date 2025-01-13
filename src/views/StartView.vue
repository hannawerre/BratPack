<template>
      <div id="LanguageSwitcher">
        <button @click="switchLanguage">
          {{ uiLabels.StartView.lang }}
          <div id="flagFrame">
            <img :src="`/img/${lang}.png`" alt="Language">
          </div>
        </button>
      </div>
     <!-- Navigation -->
    <!-- <ResponsiveNav v-bind:hideNav="hideNav">
      <button v-on:click="switchLanguage">
        {{ uiLabels.StartView.changeLanguage }}
      </button>
      <router-link to="//">
        {{ uiLabels.StartView.createPoll }}
      </router-link>

      <a href="">
        {{ uiLabels.StartView.about }}
      </a>
      <a href="">{{ uiLabels.StartView.faq }}</a>
    </ResponsiveNav> -->



  <header>
  
    <div class="logo">
      <!--<img src="/img/powerhour_logo.png">-->
      <img id="header" src="/img/Header_pwrHour.png">
      
      <!--<img src="../assets/logo.svg">-->
    </div>
    </header>

   

  
  <div class="content-wrapper">
    <div class="items">
      <!-- <div class="join-container" v-if="!isPlay">
      <button class="button blue" @click="togglePlay" style="width: 300px;">Join Game</button>
      </div> -->

      <!-- <div class="join-container">
        <div
          class="join-game-wrapper"
          :class="{'shake': showError}"
        >
          <input 
            class="gamepin-input" 
            type="text" 
            v-model="gamePin" 
            :placeholder="'Game PIN'"
            @input="removeError"
            @keyup.enter="checkGameExists(gamePin)"
          />
          <p class="error-message" v-if="showError">Game doesn't exist!</p>
          <button class="submit-button" 
          @click="checkGameExists(gamePin)"
          :class="{'disabled': gamePin.length === 0}">Join</button>
        </div>
      </div> -->
      <div class="join-game-container">
        <div
          class="join-game-wrapper"
          :class="{'shake': showError}"
        >
          <input
            class="join-game-input"
            type="text"
            v-model="gamePin"
            @input="removeError"
            @keyup.enter="checkGameExists(gamePin)"
            :placeholder="uiLabels.StartView.gamePinPlaceholder"
          />
          <!-- uilabels! -->
          <p class="error-message" v-if="showError">{{ uiLabels.StartView.gameDoesNotExist }}</p>
        </div>
        <button
          class="submit-button"
          :class="{'disabled': gamePin.length === 0}"
          @click="checkGameExists(gamePin)"
        >
        {{ uiLabels.StartView.joinButton }}
        </button>
  
        <p class="separator">{{ uiLabels.StartView.or }}</p>

        <router-link to="/customgames/">
          <button class="button secondary"> {{ uiLabels.StartView.createGameButton }}</button>
        </router-link>
      </div>

      
    </div>
  </div>
</template>

<script>
import ResponsiveNav from '@/components/ResponsiveNav.vue';
//import {socket} from '../socketClient.js';
const socket = io("localhost:3000");
import io from 'socket.io-client'; 

export default {
  name: 'StartView',
  components: {
    ResponsiveNav
  },
  data: function () {
    return {
      uiLabels: {},
      gamePin: "",
      lang: localStorage.getItem( "lang") || "en",
      hideNav: true,
      // isPlay: false,
      showError: false, // For displaying the error message
    }
  },
  created: function () {
    // Removes userName from the current sessionStorage if the user clicks home button
    // sessionStorage.removeItem('userName'); //används inte just nu. Kan bli relevant om användaren inte ska raderas vid refresh /sebbe

    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.emit( "getUILabels", this.lang );
    // Listening for "pollExists" from socket.js
    socket.on("gameExists", exists => {

      this.handleGameExists(exists);
    });
  },
  methods: {

    // method currently not used.
  createGame: function(){
      console.log("Requesting to create game...");

      //socket.emit("createGame", this.lang);
      /*
      socket.on("gameCreated", (data) => {
      console.log("Game created with PIN:", data.pin);
      this.$router.push({ name: 'CustomGamesView', query: { gamePin: data.pin } });
  });*/
  }, //genererar gamepin, lyssnar på backend

    switchLanguage: function() {
      if (this.lang === "en") {
        this.lang = "sv"
      }
      else {
        this.lang = "en"
      }
      localStorage.setItem( "lang", this.lang );
      socket.emit( "getUILabels", this.lang, this.socketId );
    },
    toggleNav: function () {
      this.hideNav = ! this.hideNav;
    },
    // Checking if poll exists. StartView.vue -> socket.js -> Data.js -> socket.js -> StartView.vue
    checkGameExists: function(gamePin) {
      console.log("Checking if game with gamePin:", gamePin, "exists");
      socket.emit("customGameExists", gamePin);
      console.log("Game exists: ", this.gameExists)
    },
    // handleEnter() {
    //   if (!this.gameExists && this.gamePin.length > 0) {
    //     // Trigger the shake effect if the game doesn't exist
    //     const inputWrapper = this.$refs.textBoxWrapper;
    //     inputWrapper.classList.add('shake');
    //     setTimeout(() => {
    //       inputWrapper.classList.remove('shake');
    //     }, 500); // Reset the animation class
    //   }
    // },
    handleGameExists(exists) {
      if (!exists) {
        // Show error and trigger shake effect if the gamePin is invalid
        this.showError = true;
        const inputWrapper = this.$refs.textBoxWrapper;
        inputWrapper.classList.add("shake");
        // setTimeout(() => {
        //   inputWrapper.classList.remove("shake");
        // }, 500);
      } else {
        // Route to the lobby if the gamePin is valid
        this.$router.push(`/lobby/${this.gamePin}`);
      }
    },
    removeError: function(){
      this.showError = false;
      this.$refs.textBoxWrapper.classList.remove("shake");
    },
    togglePlay: function () {
      console.log("togglePlay")
      this.isPlay = !this.isPlay;
      event.stopPropagation(); // Stops the event listener when the input box isn't up.
    },
    closeOnClickOutside: function(event) {
      console.log("closeOnClickOutside")
      const modal = this.$refs.modal;
      if (modal && !modal.contains(event.target)) {
        this.isPlay = false; 
      }
    }
  },
  mounted: function() {
    document.addEventListener('click', this.closeOnClickOutside);
  },
  beforeDestroy: function() {
    document.removeEventListener('click', this.closeOnClickOutside);
  }
}
</script>
<style scoped>

  
  header {
    position: relative;
    background-color: #cfe8ef;
    width: auto;
    max-width: 1200px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    border: #ff8c42 10px double;
    border-radius: 10px;
    margin: 3% auto 0 auto;  
    padding: 1em;
  }
  #header {
    width: 100%;
    max-width: 500px;
    height: auto;
    object-fit: contain;
  }
  .logo {
    display: flex;
    padding-top:0.2em;
  }
  .logo img {
    height:2.5rem;
    width: auto;
    vertical-align: bottom;
    margin-right: 0.5rem; 
  }

  /* Language Switcher */
  #LanguageSwitcher button {
  cursor: pointer;
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: black;
  font-weight: 500;
  position: absolute; 
  top: 7px; 
  right: 10px; 
  margin: 30px;
  z-index: 9000; 
}

#flagFrame {
  width: 20px;
  height: 20px;
  margin-left: 5px;
  margin-right: 10px;
  border-radius: 50%;
  overflow: hidden;
}

#flagFrame img {
  width: auto;
  height: 100%;
  object-fit: cover;
}
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
.separator {
  text-align: center;
  color: #457b9d;
  margin: 16px 0;
  font-size: 0.9rem;
}
.button.secondary {
  width: 100%; /* Matches the width of the Join button */
  padding: 12px 16px;
  background-color: transparent;
  color: #457b9d; /* Blue color in your theme */
  border: 2px solid #457b9d; /* Blue border */
  border-radius: 8px; /* Matches the input field's and Join button's style */
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
}

.button.secondary:hover {
  background-color: #457b9d; /* Blue background on hover */
  color: white; /* White text on hover */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Soft shadow */
}
/* 
.button {
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

.button:hover:not(.disabled) {
  background-color: #457b9d;
}

.button.disabled {
  opacity: 0.5;
  pointer-events: none;
} */

/* @keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25%, 75% {
    transform: translateX(-5px);
  }
  50% {
    transform: translateX(5px);
  }
} */
  /* .content-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 1em;
  }

  .items {
  flex-direction: column;
  gap: 10px;
  margin: 5% auto;
  align-items: center;
  position: relative; 
  max-width: 500px;
  width: 90%;
  }


@media (min-width: 768px) {
  .items {
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
    gap: 20px;
  }
  header {
    margin: 2% auto;  
  }
} */
</style>
