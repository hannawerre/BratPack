<template>
  <header>
    <div v-bind:class="['hamburger', {'close': !hideNav}]" 
         v-on:click="toggleNav">
    </div>
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

  <div class="items">
    <button v-if="!isPlay" @click="togglePlay">Join Game</button>
    <div v-if="isPlay" class="modal" ref="modal">
      <input type="text" @input="checkPollExists(newPollId)" v-model="newPollId" :placeholder="'Lobby ID'">

      <! -- The router link only appears if the input poll actually exists -->
      <router-link v-if="this.pollExists" v-bind:to="'/lobby/' + newPollId">
        <button>Join</button>
      </router-link>
    </div>
      <router-link to="/customgames/">
        <button v-if="!isPlay" @click="createGame" id="create">Create Game</button>
      </router-link>
  </div>
</template>

<script>
import ResponsiveNav from '@/components/ResponsiveNav.vue';
import io from 'socket.io-client';
const socket = io("localhost:3000");

export default {
  name: 'StartView',
  components: {
    ResponsiveNav
  },
  data: function () {
    return {
      uiLabels: {},
      newPollId: "",
      lang: localStorage.getItem( "lang") || "en",
      hideNav: true,
      isPlay: false,
      pollExists: false,
      gamePin: null //is this really needed in StartView.vue? 
    }
  },
  created: function () {
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.emit( "getUILabels", this.lang );
    // Listening for "pollExists" from socket.js
    socket.on("pollExists", exists => this.pollExists = exists);
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
      socket.emit( "getUILabels", this.lang );
    },
    toggleNav: function () {
      this.hideNav = ! this.hideNav;
    },
    // Checking if poll exists. StartView.vue -> socket.js -> Data.js -> socket.js -> StartView.vue
    checkPollExists: function(pollId) {
      console.log("Checking if poll with id:", pollId, "exists");
      socket.emit("pollExists", pollId);
      console.log("Poll exists: ", this.pollExists)
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
    background-color: rgb(71, 71, 255);
    width: 100%;
    display: grid;
    grid-template-columns: 2em auto;
    justify-content: center;
  }
  #header {
    width: 500px;
    height: fit-content;
  }
  .logo {
    text-transform: uppercase;
    letter-spacing: 0.25em;
    font-size: 2.5rem;
    color: white;
    padding-top:0.2em;
  }
  .logo img {
    height:2.5rem;
    vertical-align: bottom;
    margin-right: 0.5rem; 
  }
  .hamburger {
    color:white;
    width:1em;
    display: flex;
    align-items: center;
    justify-content: left;
    padding:0.5rem;
    top:0;
    left:0;
    height: 2rem;
    cursor: pointer;
    font-size: 1.5rem;
  }
  /* Items */
  .items {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 20% 0% 20% 0%;
  position: relative; 
  }
  .items button {
    background-color: rgb(149, 235, 153);
    font-size: 1.5rem;
    cursor: pointer;
    border-radius: 6px;
    border: 2px solid rgb(177, 242, 164);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.7);
    padding: 10px;
    margin: 0% 20% 0% 20%
  }
  /* When "Join Game" is pressed, the modal appears */
  .modal {
    position: fixed;  
    top: 50%;         
    left: 50%;        
    transform: translate(-50%, -50%); 
    background-color: rgb(199, 233, 199) !important; /*av nån anledning blir det inte rätt färg annars... */
    padding: 20px;
    border: 2px solid rgb(12, 66, 1);
    border-radius: 6px;
    z-index: 9999;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.7);
  }
  .modal input {
    width: 200px;
    font-size: 1.5rem;
    outline: none;
    border: 2px solid rgb(12, 66, 1);
    border-radius: 6px;
    padding: 10px;
  }
  .modal button {
    background-color: rgb(149, 235, 153);
    font-size: 1.5rem;
    cursor: pointer;
    border-radius: 6px;
    border: 2px solid rgb(12, 66, 1);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0);
    padding: 10px;
    margin: 0;
  }
  .modal, .items button:hover {
    background-color: rgb(126, 201, 130);
  }
  #create {
    background-color: rgb(179, 179, 179);
    border-color: rgb(197, 197, 197);
    border-radius: 6px;
  }
  #create:hover {
    background-color: rgb(153, 153, 153);
  }


@media screen and (max-width:50em) {
  .logo {
    font-size: 5vw;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .hamburger::before {
    content: "☰";
  }
  .close::before {
    content: "✕";
  }
  .hide {
    left:-12em;
  }
}
</style>
