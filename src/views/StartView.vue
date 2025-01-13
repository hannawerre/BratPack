<template>
  
    <div id="LanguageSwitcher">
      <button @click="switchLanguage">
        <div id="flagFrame">
          <img :src="`/img/${lang}.png`" alt="Language">
        </div>
      </button>
    </div>

  <header>
    <div class="logo">
      <img id="header" src="/img/Header_pwrHour.png">
    </div>
  </header>

  <div>
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
            autofocus
          />
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
</template>

<script>
import io from 'socket.io-client'; 
import ResponsiveNav from '@/components/ResponsiveNav.vue';
const socket = io("localhost:3000");

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
      showError: false, // For displaying the error message
    }
  },
  created: function () {
    
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.emit( "getUILabels", this.lang );
    
    socket.on("gameExists", exists => {
      this.handleGameExists(exists);
    });
  },
  methods: { 
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

    checkGameExists: function(gamePin) {
      socket.emit("customGameExists", gamePin);
      console.log("StartView: gamePin: ", gamePin, " exists: ", this.gameExists)
    },

    handleGameExists(exists) {
      if (!exists) {
        this.showError = true;
      } 
      else {
        this.$router.push(`/lobby/${this.gamePin}`);
      }
    },

    removeError: function(){
      this.showError = false;
    },
  },
}
</script>

<style scoped>

  header {
    position: relative;
    width: auto;
    max-width: 1200px;
    display: flex;
    justify-content: space-around;
    align-items: center;
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
  width: 40px;
  height: 40px;
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

.separator {
  text-align: center;
  color: #457b9d;
  margin: 16px 0;
  font-size: 0.9rem;
}

.button.secondary {
  width: 100%;
  padding: 12px 16px;
  background-color: transparent;
  color: #457b9d;
  border: 2px solid #457b9d;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
}

.button.secondary:hover {
  background-color: #457b9d;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

@media (min-width: 768px) {
  .content-wrapper {
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
    gap: 20px;
  }
  header {
    margin: 2% auto;  
  }
} 
</style>
