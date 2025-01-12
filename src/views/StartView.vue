<template>

  <header>
  
    <div class="logo">
      <!--<img src="/img/powerhour_logo.png">-->
      <img id="header" src="/img/Header_pwrHour.png">
      
      <!--<img src="../assets/logo.svg">-->
    </div>
  </header>
  <ResponsiveNav v-bind:hideNav="hideNav">
    <button v-on:click="switchLanguage">
      {{ uiLabels.changeLanguage }}
    </button>
    <router-link to="//">
      {{ uiLabels.createPoll }}
    </router-link>
    <a href="">
      {{ uiLabels.about }}
    </a>
    <a href="">FAQ</a>
  </ResponsiveNav>

  
  <div class="content-wrapper">
    <div class="items">
      <div class="join-container" v-if="!isPlay">
        <button class="button blue" @click="togglePlay" style="width: 300px;">Join Game</button>
      </div>
      <div class="join-container" v-if="isPlay">
        <div class="textBox-wrapper">
          <input 
            class="textBox input" 
            type="text" 
            @input="checkGameExists(gamePin)" 
            v-model="gamePin" 
            :placeholder="'Game PIN'"
          />
          <router-link v-if="this.gameExists" v-bind:to="'/lobby/' + gamePin">
            <button class="button blue small">Join</button>
          </router-link>
        </div>
      </div>
    
      <router-link to="/customgames/">
        <button class="button orange">Create Game</button>
      </router-link>
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
      isPlay: false,
      gameExists: false,
    }
  },
  created: function () {
    // Removes userName from the current sessionStorage if the user clicks home button
    // sessionStorage.removeItem('userName'); //används inte just nu. Kan bli relevant om användaren inte ska raderas vid refresh /sebbe

    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.emit( "getUILabels", this.lang );
    // Listening for "pollExists" from socket.js
    socket.on("gameExists", exists => this.gameExists = exists);
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
  
  .content-wrapper {
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
}
</style>
