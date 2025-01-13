<template>
<Nav 
  :uiLabels="uiLabels"
  :lang="lang"
  :showLangSwitch="true"
  @language-changed="handleLanguageChange">
</Nav>

<div v-if="showGameExistsPopup && !shouldRestoreState" class="popup-overlay">
      <div class="popup-content">
        <h2>{{ uiLabels.CustomGamesView.gameAlreadyInSession }}</h2>
        <p>{{ uiLabels.CustomGamesView.theGameWithPIN }} {{ gamePin }} {{ uiLabels.CustomGamesView.isAlreadyActiveReturnToMainMenu }}</p>
        <button @click="mainMenu">{{ uiLabels.CustomGamesView.ok }}</button>
      </div>
</div>

<AlertModal
      :title="'Alert'"
      :message="alertMessage"
      :isOpen="isAlertOpen"
      @close="handleModalClose"
/>

<div class="participants-toggle">
  <button @click="toggleParticipants">
    ◀ Players
  </button>
</div>

<div class="participants-sidebar" :class="{ 'visible': isParticipantListVisible }">
  <h2>Participants</h2>
  <ul>
    <li v-if="userRole === 'play' && gameStarted === false">
      <strong> {{ userName ? userName : "Admin" }}</strong>
    </li>
    <li v-for="(participant, index) in participants" :key="index">
      {{ participant.name }}
    </li>
  </ul>
  <button @click="toggleParticipants">Close</button>
</div>


<div class="container">
  <div class="main-content"> 
  <p v-if="gamePin" class="big-text">Game PIN: {{ gamePin }}</p>
  <p v-else class="big-text">Loading Game PIN...</p>
  
  <div class="admin-player">
    <h2>{{ uiLabels.CustomGamesView.chooseYourRole }}</h2>
    <div class="play-as-admin">
      <div class="radio-group">
        <label class="radio-option">
          <input type="radio" value="play" v-model="userRole" />
          {{ uiLabels.CustomGamesView.play }}
        </label>
        <label class="radio-option">
          <input type="radio" value="host" v-model="userRole" />
          {{ uiLabels.CustomGamesView.hostOnly }}
        </label>
      </div>
    </div>

    <div v-if="userRole === 'play'" class="form-group">
      <input
        type="text"
        v-model="userName"
        :placeholder="uiLabels.CustomGamesView.admin"
        class="textBox input"
      />
    </div>
</div>
  <div>
      
    
  <div class= "range">
    <div class="slider-value">
      <span> {{ selectedMinutes }}</span>
    </div>
    <div class="field">
      <div class="value left"><strong>-</strong></div>
      <input type="range" v-model=selectedMinutes min="10" max="120" step="10" />
      <div class="value right"><strong>+</strong></div>

    </div>
  
  </div>
    <p>Playingtime: <strong> {{ selectedMinutes }}</strong> minutes</p>
  </div>

  

  
  <div class="game-selection">
    <div v-for="game in games" :key="game.id" class="game-option">
      <input type="checkbox" :id="game.id" :value="game.id" v-model="selectedGames" />
      <label :for="game.id" class="game-label">{{ game.name }}</label>
      <img src="/img/Gear-icon.png" alt="Edit" class="edit-image" @click="openModal(game)" />
    </div>
  </div>



  <!-- Modal-komponenter med unika ref -->
  <EditQuiz1Component 
      ref="modalGeneralQuiz" 
      :GameName="currentGame ? currentGame.name : ''"
      :uiLabels="uiLabels"
      @questions-saved-generalQuiz="onQuestionsSaved"
      @modal-closed="onModalClosed"
  />
  <EditQuiz2Component 
      ref="modalWhosMostLikelyTo" 
      :GameName="currentGame ? currentGame.name : ''"
      :uiLabels="uiLabels"
      @questions-saved-whosMostLikelyTo="onQuestionsSaved"
      @modal-closed="onModalClosed"
  />
  <EditQuiz3Component 
      ref="modalThisOrThat" 
      :GameName="currentGame ? currentGame.name : ''"
      :uiLabels="uiLabels"
      @questions-saved-thisOrThat="onQuestionsSaved"
      @modal-closed="onModalClosed"
  />


  <div class="startbutton-container">
      <button class="button blue" @click="startGame">{{ uiLabels.CustomGamesView.startGame }}</button>
  </div>

</div>



</div>
</template>

<script>
//import {socket} from '../socketClient.js';
const socket = io("localhost:3000");
import io from 'socket.io-client'; 
import EditQuiz1Component from '../components/EditQuiz1Component.vue';
import EditQuiz2Component from '../components/EditQuiz2Component.vue';
import EditQuiz3Component from '../components/EditQuiz3Component.vue';
import Nav from '@/components/ResponsiveNav.vue';
import AlertModal from '@/components/AlertModal.vue';


export default {
name: 'CustomGames',
components: {
  Nav,
  EditQuiz1Component,
  EditQuiz2Component,
  EditQuiz3Component,
  AlertModal,
},
data: function() {
  return {
    lang: sessionStorage.getItem("lang") || "en",
    selectedMinutes: 10,
    games: [
      // { id: 'General Quiz', name: 'Quiz 1'} ,
      // { id: 'Who´s most likely', name: 'Quiz 2'},
      // { id: 'Music quiz', name: 'Quiz 3'},
      // { id: 'This or that', name: 'Quiz 4'}
      { id: 'generalQuiz', name: 'General Quiz'} ,
      { id: 'whosMostLikelyTo', name: 'Who´s most likely to'},
      { id: 'thisOrThat', name: 'This or that'}
    ],
    selectedGames: [],
    participants: [],
    gamePin: '',
    currentGame: null, // Används denna? /sebbe
    customQuestions: {},
    // useCustomQuestions: false,
    active: true, // Används denna? /sebbe
    userName: '',
    userRole: 'host',
    uiLabels: {},
    showGameExistsPopup: false,
    shouldRestoreState: false,
    gameStarted: false,
    isParticipantListVisible: false,
    isButtonVisible: false,
   
    

    isAlertOpen: false,
    alertMessage: "",
    

  };
},

created: function () {
  //this.dismantleSocket(); //kanske ta bort? / sebbe
  socket.on( "uiLabels", labels => this.uiLabels = labels );
  socket.emit( "getUILabels", this.lang );
  const shouldRestore = sessionStorage.getItem('shouldRestoreState');
  this.shouldRestoreState = shouldRestore;

  console.log("Should restore state:", shouldRestore);
    if (shouldRestore) {
      const savedData = sessionStorage.getItem('savedData');
      if (savedData) {
      try {
        
        const parsedData = JSON.parse(savedData);
        // Återställ varje egenskap från det sparade objektet
        this.selectedGames = parsedData.selectedGames || [];
        this.participants = parsedData.participants || [];
        this.customQuestions = parsedData.customQuestions || {};
        this.userName = parsedData.userName || '';
        this.userRole = parsedData.userRole || 'host';
        this.selectedMinutes = parsedData.selectedMinutes || 60;
      } catch (error) {
        console.error("Fel vid tolkning av sparad data:", error);
      }
    }
    sessionStorage.removeItem('shouldRestoreState');
    sessionStorage.removeItem('savedData');

    console.log("Restored data:", this.selectedGames, this.participants, this.customQuestions, this.userName);
  }

  // socket.on("updateGameData", (gameData) => {
        
        // console.log("Game data received: ", gameData);
        // // this.customQuestions = gameData.customQuestions;
        // // this.useStandardQuestions = gameData.useStandardQuestions;
        // // this.useOwnQuestions = gameData.useOwnQuestions;
        // this.selectedGames = gameData.selectedGames;
        // this.participants = gameData.participants;
        // this.selectedMinutes = gameData.selectedMinutes;
        // // this.customQuestions = gameData.customQuestions;
        // // this.useCustomQuestions = gameData.useCustomQuestions;
        // console.log("Updated gameData, participants: ", this.participants);
        // });
  if (!this.$route.params.gamePin) { 
    socket.on('gameCreated', pin => {
      this.gamePin = pin
      console.log("GamePin created: ", this.gamePin);
      socket.emit('joinSocketRoom', pin); //joins the socket room 'gamePin'
      this.$router.replace({ path: `/customgames/${pin}` });
      
      // socket.on("updateGameData", (gameData) => {
        
      //   console.log("Game data received: ", gameData);
      //   this.selectedGames = gameData.selectedGames;
      //   this.participants = gameData.participants;
      //   this.selectedMinutes = gameData.selectedMinutes;
      //   this.customQuestions = gameData.customQuestions;
      //   console.log("Updated gameData, gamedata: ", gameData);
      //   });

      });
  console.log("Listener for 'updateGameData' in CustomGamesView.vue is active");
  socket.emit("createGame", this.lang);
}else {
      console.log("Insde else-statement, this means created gamepin exists");
      this.gamePin = this.$route.params.gamePin; // just nu kommer gamePin finnas kvar vid refresh, men jag tror att all game data raderas
      console.log("GamePin: ", this.gamePin);
      socket.on("gameAlreadyExists", (gamepin)=> {
        console.log("Game already exists, gamepin: ", gamepin);
        this.showGameExistsPopup = true;

      })
      socket.emit("adminStartedWithExisitingPin", this.gamePin, this.lang) //behöver listener?
      socket.emit("joinSocketRoom",this.gamePin); // lägga denna tidigare?
      socket.emit("requestGameData", this.gamePin);
  
};
    
socket.on('participantsUpdate', participants => {
    this.participants = participants;
    console.log("Participants updatet, active participants: ", this.participants);
});



},

mounted() {
  window.addEventListener("beforeunload", this.handleBeforeUnload);
  this.updateSliderValue();
},

methods: {

  triggerValidationError: function(message) {
      this.alertMessage = message;
      this.isAlertOpen = true;
  },

    // Funktion för att hantera stängning av modalen
  handleModalClose: function() {
      this.isAlertOpen = false;
  },
  toggleButtonVisible() {
    this.isButtonVisible = !this.isButtonVisible;
  },
  toggleParticipants() {
    this.isParticipantListVisible = !this.isParticipantListVisible;
  },
  updateSliderValue() {
    const slideValue = document.querySelector(".slider-value span");
    const inputSlider = document.querySelector(".field input");

    inputSlider.oninput = () => {
      const value = inputSlider.value;
      const max = inputSlider.max;
      const percent = (value / max) * 100;

      slideValue.textContent = value;
      slideValue.style.left = percent + "%";
      inputSlider.style.setProperty("--value-percent", `${percent}%`);
      slideValue.classList.add("show");
    };

    inputSlider.onchange = () => {
      // Runda av till närmaste steg om användaren släpper slidern
      this.selectedMinutes = Math.round(this.selectedMinutes / 10) * 10;
    };

    inputSlider.onblur = () => {
      slideValue.classList.remove("show");
    };
  },



  mainMenu: function() {
    window.removeEventListener("beforeunload", this.handleBeforeUnload);
    this.$router.push("/");
  },


  handleLanguageChange(newLang) {
      this.lang = newLang;
      sessionStorage.setItem("lang", newLang);
      socket.emit("getUILabels", this.lang);
  }, 
  
 
  isNameTaken: function(userName) {
        this.nameTaken = this.participants.some(participant => participant.name === userName);
        console.log("Name taken: ", this.nameTaken);
        console.log("All participants: ", this.participants);
    return this.nameTaken;
  },

  startGame: function () {
    console.log("playerRole: ", this.playerRole);

    if(this.isNameTaken(this.userName)){
      this.triggerValidationError("Name is taken, please choose another one");
      return;
    }

    if (this.selectedGames.length === 0) {
      this.triggerValidationError("Please select at least one game.");
      return;
    }

    if (this.participants.length === 0 && this.userRole === 'play') {
      this.triggerValidationError("No players have joined yet. At least two players are required to start the game.");
      return;
    }
    if(this.participants.length < 2 && this.userRole === 'host'){
      this.triggerValidationError(
          "Only one player has joined. At least two players are required to start the game."
        );
      return;
    }

    if (this.userRole === 'play') {
      if (!this.userName) {
        this.triggerValidationError("Please enter your username.");
        return;
      }
    
      console.log("hej",   this.userName);
      const adminName={      
        name: this.userName,
        scoreGame1: 0,
        scoreGame2: 0,
        scoreGame3: 0
      }
      console.log("adminName: ", adminName);
      // socket.emit( "participateInCustomGame", this.gamePin,  adminName);
      this.gameStarted = true;
      this.participants.unshift(adminName);
      sessionStorage.setItem('userName', this.userName); 
    }
    else {
      // Ensure there is no name left in session storage. This is what determines if admin is playing in later views.
      if (sessionStorage.getItem('userName')) {
          sessionStorage.removeItem('userName');
      }
    }
    sessionStorage.setItem('isAdmin', true);
    
    let gameData = {  // borde den inte vara const? /theo
      gamePin: this.gamePin,
      selectedGames: this.selectedGames,
      participants: this.participants,
      selectedMinutes: this.selectedMinutes
      //lang: this.lang språk sparas i gameData eller localStorage?
    }
    console.log("Davids och sebbes test: ", gameData);

    window.removeEventListener("beforeunload", this.handleBeforeUnload);

    socket.emit('startGame', gameData)
    this.$router.push("/game/" + this.gamePin).then(() => {
    // Add or maintain the beforeunload listener
    
    console.log("--> Listener carried over to /game/");
  });
    console.log("--> After startGame!")
  },

  openModal(game) {
  this.currentGame = game;

  if (game.id === 'generalQuiz') {
    this.$refs.modalGeneralQuiz.openModal(); // Kontrollera denna rad
  } else if (game.id === 'whosMostLikelyTo') {
    this.$refs.modalWhosMostLikelyTo.openModal();
  } else if (game.id === 'thisOrThat') {
    this.$refs.modalThisOrThat.openModal();
  }
},

  onModalClosed() {
    console.log('Modalen är stängd');
    this.currentGame = null;
  },

  onQuestionsSaved(savedQuestions, useCustomQuestions) { // kanske kan skriva ihop denna med onModalClosed? //david
    console.log(this.currentGame.id);

    console.log("Här ska customGames vara tom", this.customQuestions);

    if (!this.customQuestions[this.currentGame.id]) {
    this.customQuestions[this.currentGame.id] = {};
  }

  this.customQuestions[this.currentGame.id].customQuestions = savedQuestions;
  this.customQuestions[this.currentGame.id].useCustomQuestions = useCustomQuestions;
  
  socket.emit(
    "savedQuestionsToServer", 
    this.gamePin, 
    this.customQuestions[this.currentGame.id].customQuestions,
    this.customQuestions[this.currentGame.id].useCustomQuestions,
    this.currentGame.id
  );
},
  handleBeforeUnload(event) {
      const dataToSave = {
        selectedGames: this.selectedGames,
        participants: this.participants,
        customQuestions: this.customQuestions,
        userName: this.userName,
        userRole: this.userRole,
        selectedMinutes: this.selectedMinutes
      };

      console.log("Saving data before unload:", dataToSave);

      sessionStorage.setItem('shouldRestoreState', true);
      sessionStorage.setItem('savedData', JSON.stringify(dataToSave));
      // Visa standardvarning om det behövs
    },

  checkIfRefreshPage() {
    // Check if there already is a name in sessionStorage. If there is, user will pick it up and join the lobby with it.
      let storagePin = sessionStorage.getItem('gamePin');
      if (storagePin) {
        
        this.gamePin = storagePin;
        socket.emit("requestParticipants", this.gamePin);
        
      }
    console.log("Checking if refresh... storagePin =", storagePin, "with this.gamePin =", this.gamePin);
    },

    // dismantleSocket(){ //TODO kanske ta bort
    //   console.log("-->before if-statement in dismantleSocket in CustomGamesView")
    //   if(socket) {
    //   console.log("-->inside if-statement in dismantleSocket in CustomGamesView")
    //     socket.emit('leaveSocketRoom', this.gamePin); // Leave the room
    //     // socket.disconnect(); // Disconnect the socket
    // }else console.log("this.socket does not exist in CustomGamesView")
    // }
  },

  beforeUnmount() {
    // this.dismantleSocket();
    console.log("Admin left game, removed event listener");
    
    //socket.emit("adminLeftGame", this.gamePin);
    window.removeEventListener("beforeunload", this.handleBeforeUnload);

    sessionStorage.removeItem('shouldRestoreState');
    sessionStorage.removeItem('savedData');

  }

  }
</script>


<style>
 .container {
    align-items: flex-start;
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: space-between;
    padding: 20px;
    
  }

  .main-content {
    flex: 1;
    text-align: center;
}

.admin-player {
  padding: 10px;
  margin: 20px 0;
  text-align: center;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
}

.admin-player h2 {
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: #000000;
}

.radio-group {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  color: #000000;
}

.radio-option input[type="radio"] {
  transform: scale(1.2);
  accent-color: #1d3557;
  cursor: pointer;
  margin-right: 6px;
}

.form-group {
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.range{
    height: 10px;
    width: 300px;
    display: inline-block;
    border-radius: 10px;
    
}
.range .slider-value{
  position: relative;
  width: 100%;
}
.range .slider-value span{
  position: absolute;
  height: 45px;
  width: 45px;
  
  color: #fff;
  font-weight: 500;
  top: -40px;
  transform: translateX(-50%) scale(0);
  transform-origin: bottom;
  transition: transform 0.3s ease-in-out;
  line-height: 55px;
  z-index: 2;
}

.range .slider-value span:after{
  position: absolute;
  content: "";
  height: 45px;
  width: 45px;
  background: #1d3557;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  border: 3px solid #fff;
  line-height: 55px;
  z-index: -1;
  border-top-left-radius: 50%;
  border-top-right-radius: 50%;
  border-bottom-left-radius: 50%;
}
.range .field{
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}
.range .field .value{
    position: static;
    font-size: 40px;
    font-weight: 700;
    color: #1d3557;
}
.range .field .value.left{
  left: -22px;
  transform: translateX(-50%);
}
.range .field .value.right {
  right: 43px; /* Placera direkt mot högra kanten av föräldraelementet */
  transform: translateX(15%); /* Justera för bättre centrering över slidern */
}

.range .field input {
  -webkit-appearance: none;
  appearance: none;
  height: 3px;
  width: 100%;
  background: linear-gradient(
    to right,
    #1d3557 0%,
    #1d3557 var(--value-percent, 0%),
    #ddd var(--value-percent, 0%),
    #ddd 100%
  );
  border-radius: 5px;
  outline: none;
 
}

.range .field input::-webkit-slider-thumb {
  -webkit-appearance: none;
  margin-left: 2px;
  appearance: none;
  height: 25px;
  width: 25px;
  background: #1d3557;
  border-radius: 50%;
  border: 1px solid #1d3557;
  cursor: pointer;
  position: relative;
  z-index: 2;
}

.game-selection {
  display: flex;
  flex-direction: column;
  align-items: center; /* Centrera alla rader horisontellt */
  gap: 15px; /* Mellanrum mellan rader */
}

.game-option {
  display: flex;
  justify-content: space-between; /* Mellan checkbox och kugghjulsikon */
  align-items: center; /* Vertikal centrering */
  width: 300px; /* Anpassad bredd för knappen */
  padding: 10px 15px;
  background-color: #2e607f; /* Blå bakgrund */
  border-radius: 8px;
  color: white; /* Vit text */
  font-size: 1.2rem;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Skugga för djup */
  transition: transform 0.3s ease, box-shadow 0.3s ease; /* Animation för hover */
}

.game-option:hover {
  transform: translateY(-5px); /* Lyft vid hover */
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15); /* Förstärk skuggan vid hover */
}

.game-option input[type="checkbox"] {
  appearance: none;
  background-color: white; /* Vit bakgrund för checkbox */
  border: 2px solid #457b9d; /* Blå kant */
  width: 20px;
  height: 20px;
  border-radius: 4px; /* Gör checkboxen rundad */
  outline: none;
  cursor: pointer;
  position: relative;
  margin-right: 10px; /* Mellanrum mellan checkbox och text */
}

.game-option input[type="checkbox"]:checked {
  background-color: #1d3557; /* Mörkare blå vid aktiv */
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
}

.game-option input[type="checkbox"]:checked::before {
  content: '✔'; /* Kryss för vald */
  color: white;
  font-size: 14px;
  display: inline-block;
  text-align: center;
}

.game-label {
  flex: 1; /* Gör så att texten fyller ut */
  text-align: left; /* Justera text till vänster */
  padding-left: 10px; /* Mellanrum från checkbox */
}

.edit-image {
  width: 30px;
  height: 30px;
  cursor: pointer; /* Klickbar ikon */
}

.participants-sidebar {
  position: fixed;
  top: 0;
  right: -320px; /* Start utanför skärmen */
  width: 300px;
  height: 100%;
  background-color: #457b9d;
  color: white;
  padding: 20px;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.3s ease-in-out; /* Övergångseffekt */
}

.participants-sidebar.visible {
  transform: translateX(-300px); /* Flytta in på skärmen */
}

.participants-sidebar h2 {
  margin-bottom: 20px;
}

.participants-sidebar ul {
  list-style: none;
  padding: 0;
  flex: 1;
  overflow-y: auto; /* Scroll om listan blir för lång */
}

.participants-sidebar li {
  margin-bottom: 10px;
  font-size: 1rem;
}

.participants-sidebar button {
  background-color: #1d3557;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-bottom: 50px;
}

.participants-sidebar button:hover {
  background-color: red;
}

.participants-toggle {
  position: fixed;
  top: 15%; /* Vertikalt centrerad */
  right: 10px; /* Nära högra kanten */
  transform: translateY(-50%);
  z-index: 1000;
}

.participants-toggle button {
  background-color: #457b9d; /* Blå bakgrund */
  color: white; /* Vit text */
  border: none;
  border-radius: 5px; /* Rundade hörn */
  font-size: 1rem; /* Textstorlek */
  font-weight: bold;
  padding: 10px 20px; /* Padding för större knapp */
  display: flex;
  align-items: center; /* Centrera text och ikon vertikalt */
  gap: 10px; /* Avstånd mellan pilen och texten */
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Lätt skugga */
  transition: background-color 0.3s, transform 0.2s; /* Smooth hover-effekt */
}

.participants-toggle button:hover {
  background-color: #1d3557; /* Mörkare blå vid hover */
  transform: scale(1.05); /* Förstora knappen lite vid hover */
}

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 300px;
}

.popup-content h2 {
  margin-bottom: 10px;
}

.popup-content p {
  margin-bottom: 20px;
}

.popup-content button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.popup-content button:hover {
  background-color: #45a049;
}
.startbutton-container {
  margin-top: 40px; /* Ger mer marginal mellan spelen och startknappen */
  display: flex;
  justify-content: center; /* Centrerar knappen */
}

.button.blue {
  background: linear-gradient(45deg, #1d3557, #457b9d); /* Mörkblå gradient */
  font-size: 24px; /* Gör knappen större */
  padding: 15px 30px; /* Mer padding för att göra knappen större */
  border-radius: 10px; /* Rundade hörn */
  border: 2px solid #1d3557; /* Ger en mörkblå kant */
  transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;
}

.button.blue:hover {
  background: linear-gradient(45deg, #457b9d, #a8dadc); /* Ljusare blå vid hover */
  box-shadow: 0 0 15px 5px #457b9d;
  transform: scale(1.1); /* Gör knappen större vid hover */
}

</style>