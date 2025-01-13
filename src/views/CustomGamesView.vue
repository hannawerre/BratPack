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
    ◀ {{ uiLabels.CustomGamesView.players }} 
  </button>
</div>

<div class="participants-sidebar" :class="{ 'visible': isParticipantListVisible }">
  <h2>{{ uiLabels.CustomGamesView.participants }}</h2>
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


<div class="custom-games-container">
  <div class="main-content"> 
  <p v-if="gamePin" class="big-text">{{ uiLabels.CustomGamesView.pinGame }} {{ gamePin }}</p>
  <p v-else class="big-text">{{ uiLabels.CustomGamesView.loadingGamePin }}</p>
  
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

      <div class="range">
        <div class="slider-value">
          <span> {{ selectedMinutes }}</span>
        </div>
      <div class="field">
        <div class="value left"><strong>-</strong></div>
      <input type="range" v-model=selectedMinutes min="10" max="120" step="10" />
      <div class="value right"><strong>+</strong></div>

  </div>
    <p>{{ uiLabels.CustomGamesView.playTime }} <strong> {{ selectedMinutes }}</strong> {{ uiLabels.CustomGamesView.minutes }}</p>
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
      { id: 'generalQuiz', name: 'General Quiz'} ,
      { id: 'whosMostLikelyTo', name: 'Who´s most likely to'},
      { id: 'thisOrThat', name: 'This or that'}
    ],
    uiLabels: {},

    selectedGames: [],
    participants: [],
    gamePin: '',
    currentGame: null, 
    customQuestions: {},
    userName: '',
    userRole: 'host',
    showGameExistsPopup: false,
    shouldRestoreState: false,
    gameStarted: false,
    isParticipantListVisible: false,
    isButtonVisible: false,
    isAlertOpen: false,
    alertMessage: "",
  };
},
computed: {
  games() {
    if (!this.uiLabels.CustomGamesView) return [];
    return [
      { id: 'generalQuiz', name: this.uiLabels.CustomGamesView.generalQuiz },
      { id: 'whosMostLikelyTo', name: this.uiLabels.CustomGamesView.whosMostLikelyTo },
      { id: 'thisOrThat', name: this.uiLabels.CustomGamesView.thisOrThat }
    ];
  },
},

created: function () {
  socket.on( "uiLabels", labels => this.uiLabels = labels );
  socket.emit( "getUILabels", this.lang );
 
  //If should restore
  const shouldRestore = sessionStorage.getItem('shouldRestoreState');
  this.shouldRestoreState = shouldRestore;
  console.log("Should restore state:", shouldRestore);
    if (shouldRestore) {
      const savedData = sessionStorage.getItem('savedData');
      if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        this.selectedGames = parsedData.selectedGames || [];
        this.participants = parsedData.participants || [];
        this.customQuestions = parsedData.customQuestions || {};
        this.userName = parsedData.userName || '';
        this.userRole = parsedData.userRole || 'host';
        this.selectedMinutes = parsedData.selectedMinutes || 60;
      } catch (error) {
        console.error("Fel vid inläsning av sessionstorage:", error);
      }
    }
    //Tar bort efter att datan har återställts
    sessionStorage.removeItem('shouldRestoreState');
    sessionStorage.removeItem('savedData');

    console.log("Restored data:", this.selectedGames, this.participants, this.customQuestions, this.userName);
  }


  if (!this.$route.params.gamePin) { 
    socket.on('gameCreated', pin => {
      this.gamePin = pin

      console.log("GamePin created: ", this.gamePin);
      socket.emit('joinSocketRoom', pin); //joinar för io med 'gamePin'
      this.$router.replace({ path: `/customgames/${pin}` });
      });
      console.log("Listener for 'updateGameData' in CustomGamesView.vue is active");
      socket.emit("createGame", this.lang);
    }else {
      console.log("Insde else-statement, this means created gamepin exists");
      this.gamePin = this.$route.params.gamePin; 
      console.log("GamePin: ", this.gamePin);
      
      socket.on("gameAlreadyExists", (gamepin)=> {
        console.log("Game already exists, gamepin: ", gamepin);
        this.showGameExistsPopup = true;
      })

      socket.emit("adminStartedWithExisitingPin", this.gamePin, this.lang) // för hörnfall och refresh
      socket.emit("joinSocketRoom",this.gamePin);
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
    // Funktion för att hantera stängning av exisitng game popup
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
      this.triggerValidationError(this.uiLabels?.CustomGamesView?.nameTakenChooseNew);
      return;
    }

    if (this.selectedGames.length === 0) {
      this.triggerValidationError(this.uiLabels?.CustomGamesView?.selectAtLeastOneGame);
      return;
    }

    if (this.participants.length === 0 && this.userRole === 'play') {
      this.triggerValidationError(this.uiLabels?.CustomGamesView?.noPlayersJoined);
      return;
    }
    if(this.participants.length < 2 && this.userRole === 'host'){
      this.triggerValidationError(
          this.uiLabels?.CustomGamesView?.notEnoughPlayers
        );
      return;
    }

    if (this.userRole === 'play') {
      if (!this.userName) {
        this.triggerValidationError(this.uiLabels?.CustomGamesView?.enterUserame);
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
      this.gameStarted = true;
      this.participants.unshift(adminName);
      sessionStorage.setItem('userName', this.userName); 
    }
    else {
      // Se till att det inte finns något namn kvar i sessionlagringen. Detta avgör om admin spelar i senare vyer.
      if (sessionStorage.getItem('userName')) {
          sessionStorage.removeItem('userName');
      }
    }
    sessionStorage.setItem('isAdmin', true);
    
    let gameData = {
      gamePin: this.gamePin,
      selectedGames: this.selectedGames,
      participants: this.participants,
      selectedMinutes: this.selectedMinutes
    };

    window.removeEventListener("beforeunload", this.handleBeforeUnload);

    socket.emit('startGame', gameData)
    this.$router.push("/game/" + this.gamePin).then(() => {
  });
    console.log("--> After startGame!")
  },

  openModal(game) {
  this.currentGame = game;

  if (game.id === 'generalQuiz') {
    this.$refs.modalGeneralQuiz.openModal();
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

  onQuestionsSaved(savedQuestions, useCustomQuestions) {
    console.log(this.currentGame.id);

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
      //Ifall av refresh
    },



  },

  beforeUnmount() {

    console.log("Admin left game, removed event listener");
    
    //socket.emit("adminLeftGame", this.gamePin);
    window.removeEventListener("beforeunload", this.handleBeforeUnload);

    sessionStorage.removeItem('shouldRestoreState');
    sessionStorage.removeItem('savedData');

  }

  }
</script>


<style>
 .custom-games-container {
    align-items: flex-start;
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: space-between;
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
  right: 43px; 
  transform: translateX(15%); 
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
  align-items: center; 
  gap: 10px;
  margin: 20px; 
}

.game-option {
  display: flex;
  justify-content: space-between; 
  align-items: center; 
  width: 300px; 
  padding: 10px 15px;
  background-color: #2e607f; 
  border-radius: 8px;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease; 
}

.game-option:hover {
  transform: translateY(-5px); 
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.game-option input[type="checkbox"] {
  appearance: none;
  background-color: white; 
  border: 2px solid #457b9d; 
  width: 20px;
  height: 20px;
  border-radius: 4px; 
  outline: none;
  cursor: pointer;
  position: relative;
  margin-right: 10px; 
}

.game-option input[type="checkbox"]:checked {
  background-color: #1d3557; 
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
}

.game-option input[type="checkbox"]:checked::before {
  content: '✔'; 
  color: white;
  font-size: 14px;
  display: inline-block;
  text-align: center;
}

.game-label {
  flex: 1; 
  text-align: left; 
  padding-left: 10px;
}

.edit-image {
  width: 30px;
  height: 30px;
  cursor: pointer; 
}

.participants-sidebar {
  position: fixed;
  top: 0;
  right: -320px; 
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
  transition: transform 0.3s ease-in-out; 
}

.participants-sidebar.visible {
  transform: translateX(-300px); 
}

.participants-sidebar h2 {
  margin-bottom: 20px;
}

.participants-sidebar ul {
  list-style: none;
  padding: 0;
  flex: 1;
  overflow-y: auto; 
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
  top: 24%; 
  right: 10px; 
  transform: translateY(-50%);
  z-index: 1000;
}

.participants-toggle button {
  background-color: #457b9d; 
  color: white; 
  border: none;
  border-radius: 5px;
  font-size: 1rem; 
  font-weight: bold;
  padding: 10px 20px;
  display: flex;
  align-items: center; 
  gap: 10px; 
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
  transition: background-color 0.3s, transform 0.2s; 
}

.participants-toggle button:hover {
  background-color: #1d3557; 
  transform: scale(1.05); 
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
  display: flex;
  justify-content: center; 
}

.button.blue {
  background: linear-gradient(45deg, #1d3557, #457b9d); 
  font-size: 24px; 
  padding: 15px 30px; 
  border-radius: 10px;
  border: 2px solid #1d3557; 
  transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;
}

.button.blue:hover {
  background: linear-gradient(45deg, #457b9d, #a8dadc); 
  box-shadow: 0 0 15px 5px #457b9d;
  transform: scale(1.1); 
}

@media (max-width: 500px) { 
  .container {
    flex-direction: column;
    gap: 5px;
    padding: 10px;
  }
  .main-content {
    text-align: center;
    margin: 0 auto;
  }
  .big-text {
    font-size: rem;
    margin: 10px 0;
  }
  .admin-player {
    max-width: 80%;
    margin: 5px auto;
  }
  .game-option {
    width: 90%;
    font-size: 0.9rem;
    padding: 5px 8px;
    gap: 3px;
  }
  .range {
    width: 90%;
  }

  .popup-content {
    width: 85%;
    padding: 10px;
    margin: 5px auto;
  }

  .participants-sidebar {
    z-index: -1;
    width: 70%;
    right: -70%;
  }

  .participants-sidebar.visible {
    z-index: 9999;
    transform: translateX(-70%);
  }

  .participants-toggle button {
    padding: 5px 10px;
    font-size: 0.8rem;
    box-shadow: none;
  }

  .participants-toggle button:hover {
    transform: scale(1.0); 
  }
  .game-label {
    padding-left: 3px;
    font-size: 0.8rem;
  }
  .button.blue {
    font-size: 0.9rem;
    padding: 8px 15px;
    border-radius: 6px;
  }
  .popup-content h2 {
    font-size: 1rem;
    margin: 5px 0;
  }
  .popup-content p {
    font-size: 0.8rem;
    margin: 5px 0;
  }
  .popup-content button {
    font-size: 0.8rem;
    padding: 5px 10px;
  }
.participants-sidebar button{
  width: 50%;
  margin-left: 40px;
  text-align: center; 
}
}
</style>