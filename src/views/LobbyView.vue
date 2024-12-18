<template>
  <Nav :hideNav="false"
  :uiLabels="uiLabels"
  :lang="lang"
  @language-changed="handleLanguageChange">
  </Nav>
  
  <div>
    <h3>Lobby ID: {{gamePin}}</h3>
    <div class="usernameInput" v-if="!joined">
      <input type="text" v-model="userName" @input=isNameTaken(userName) :placeholder=this.uiLabels.userName>
      <button v-if="!nameTaken" v-on:click="participateInCustomGame">
        {{ this.uiLabels.participateInPoll }}
      </button>
      <p v-else>
        Name taken!
      </p>
    </div>
    <div class="waitingRoom" v-if="joined">
      <p>{{ this.uiLabels.waitingForHost }}</p>
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
    socket.on( "startPoll", () => this.$router.push("/poll/" + this.gamePin) );
    socket.emit( "joinCustomGame", this.gamePin );
    socket.emit( "getUILabels", this.lang );
  },
  methods: {
    participateInCustomGame: function () {
      socket.emit( "participateInCustomGame", {gamePin: this.gamePin, name: this.userName});
      this.joined = true;
      
      // Detta kan vara användbart senare om vi ska lösa så att användare inte raderas vid refresh! /sebbe
      // sessionStorage.setItem('userName', this.userName); 
      // console.log("Updated sessionStorage with item ('userName',", this.userName, ")");
    },
    handleLanguageChange(newLang) {
      this.lang = newLang;
      localStorage.setItem("lang", newLang);
      socket.emit("getUILabels", this.lang);
    },
    isNameTaken(userName) {
      this.nameTaken = this.participants.includes(userName);
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
.usernameInput {
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
.usernameInput input {
  width: 200px;
  font-size: 1.5rem;
  outline: none;
  border: 2px solid rgb(12, 66, 1);
  border-radius: 6px;
  padding: 10px;
}
.usernameInput button {
  background-color: rgb(149, 235, 153);
  font-size: 1.5rem;
  cursor: pointer;
  border-radius: 6px;
  border: 2px solid rgb(12, 66, 1);
  padding: 10px;
  margin: 0;
}
button:hover {
  background-color: rgb(126, 201, 130);
}

.waitingRoom div{
  background-color: rgba(224, 185, 10, 0.6);
  border-radius: 15px;
  border: 2px solid rgb(234, 217, 144);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.7);
  width: 20%;
  margin: 5% 0% 0% 40%
}

</style>
