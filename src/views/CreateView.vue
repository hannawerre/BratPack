<template>
  <div>
    <Nav :hideNav="false"
      :uiLabels="uiLabels"
      :lang="lang"
      @language-changed="handleLanguageChange">
    </Nav>

    <div class="usernameInput">
      <h2>{{ uiLabels.enterDetails }}</h2>
      <input 
      type="text"
      v-model="userName"
      :placeholder="uiLabels.userName">
      <button @click="createGame"> {{ uiLabels.createGame }}</button>

      <div class="playAsAdmin">
        <p> {{ uiLabels.playAsAdmin }}</p>
        <label>
          <input 
            type="radio"
            value="play"
            v-model="userRole">
          {{ uiLabels.play }}
        </label>
        <label>
          <input 
            type="radio"
            value="host"
            v-model="userRole">
          {{ uiLabels.hostOnly }}
          
        </label>
        
      </div>

      
    </div>

 
  </div>
</template>

<script>
import Nav from '@/components/ResponsiveNav.vue'
//import {socket} from '../socketClient.js';
const socket = io("localhost:3000");
import io from 'socket.io-client'; 

export default {
  name: 'CreateView',
  components: {
    Nav
  },

  data: function () {
    return {
      lang: localStorage.getItem("lang") || "en",
      uiLabels: {},
      userName: "",
      userRole: "play",
      gamePin: "",
      joined: false
    }
    
  },
  created: function () {
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.on("gameCreated", pin => {
      this.gamePin = pin;
      this.addAdminToGame();
      socket.emit("joinSocketRoom", pin)
  
    })
    socket.emit( "getUILabels", this.lang );
    
  },
  methods: {
    createGame() {
      if (!this.userName.trim()) {
        alert(this.uiLabels.userName)
        return;
      }
      sessionStorage.setItem('userName', this.userName); 
      socket.emit("createGame", this.lang);
      
    },

    addAdminToGame() {
      console.log("startar spelet ars")
      const isPlaying = this.userRole === "play";

      socket.emit("participateInCustomGame", this.gamePin, {
        name: this.userName,
        isPlaying: isPlaying,
        isAdmin: true,
        scoreGame1: 0,
        scoreGame2: 0,
        scoreGame3: 0,
        scoreGame4: 0
      }
    );

      this.joined = true;

      // Ensure participants are updated before transitioning
    
      this.$router.push(`/customgames/${this.gamePin}`);
    
    },

  
   
    handleLanguageChange(newLang) {
      this.lang = newLang;
      localStorage.setItem("lang", newLang);
      socket.emit("getUILabels", this.lang);
  }
  }
}
</script>
