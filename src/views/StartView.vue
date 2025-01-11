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

  
  <SlideComponant @slideChanged="handleSlideChange">
    <!-- Slide 1: Join Game -->
    <div class="items">
      <div class="join-container" v-if="!isPlay">
        <button class="button green" @click="togglePlay">Join Game</button>
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
            <button class="button green small" @click="nextSlide">Join</button>
          </router-link>
        </div>
      </div>
    

    <!-- Slide 2: Create Game -->
    
      <router-link to="/create/">
        <button @click="createGame" class="button">Create Game</button>
      </router-link>
    </div>
<<<<<<< HEAD
  </SlideComponant>
  
=======
      <router-link to="/customGames/">
        <button v-if="!isPlay" @click="createGame" id="create">Create Game</button>
      </router-link>
  </div>
>>>>>>> admin-view
</template>

<script>
import ResponsiveNav from '@/components/ResponsiveNav.vue';
//import {socket} from '../socketClient.js';
import SlideComponant from '../components/SlideComponant.vue';
const socket = io("localhost:3000");
import io from 'socket.io-client'; 

export default {
  name: 'StartView',
  components: {
    ResponsiveNav,
    SlideComponant
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

    prevSlide() {
      this.$refs.slideComponent.slide('prev');
    },
    nextSlide() {
      this.$refs.slideComponent.slide('next');
    },
    handleSlideChange(index) {
      console.log("Active slide index:", index);
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
    width: 90%;
    display: flex;
    justify-content: center;
border: #ff8c42 10px double;
    border-radius: 10px;
    margin: 3% 5% 0% 5%;  
  }
  #header {
    width: 500px;
    height: fit-content;
  }
  .logo {
    display: flex;
    padding-top:0.2em;
  }
  .logo img {
    height:2.5rem;
    vertical-align: bottom;
    margin-right: 0.5rem; 
  }
  

  .items {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 15% 0 15% 0;
  position: relative; 
  }
  
 


/* Inte säker att nedan behövs
@media screen and (max-width:50em) {
  .logo {
    font-size: 5vw;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .close::before {
    content: "✕";
  }
  .hide {
    left:-12em;
  }
}
  */
</style>
