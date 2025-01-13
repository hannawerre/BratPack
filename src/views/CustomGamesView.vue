<template>
  <Nav :hideNav="false"
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
<div class="container">

  <div class="main-content">
  <h1 v-if="gamePin"> {{ uiLabels.CustomGamesView.pinGame }} {{ gamePin }}</h1>
  <h1 v-else>{{ uiLabels.CustomGamesView.loadingGamePIN }}</h1>
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
      <p>{{ uiLabels.CustomGamesView.chooseTheTimeInMinutes }}</p>
      <div class="button-container">
          <button class="button decrement" @click="decrementMinutes">-</button>
          {{ selectedMinutes }}
          <button class="button increment" @click="incrementMinutes">+</button>
      </div>
  </div>

  <h2>{{ uiLabels.CustomGamesView.chooseYourCustomGamesBelow }}</h2>

  <div v-for="game in games" :key="game.id" class="game-item">
      <input 
          type="checkbox" 
          :id="game.id" 
          :value="game.id" 
          v-model="selectedGames"
      />
      <label :for="game.id">{{ game.name }}</label>

      <div class="edit-button" @click="openModal(game)">
          <img src="/img/Gear-icon.png" alt="Edit" class="edit-icon" />
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
      <button class="button orange" @click="startGame">{{ uiLabels.CustomGamesView.startGame }}</button>
  </div>

</div>
<div class="participants">
    <h2>{{ uiLabels.CustomGamesView.participants }}</h2>
    <div class="toggle-button" @click="toggleListVisibility">
      <span>{{ isListVisible ? uiLabels.CustomGamesView.hideParticipants + '&#9650;' : uiLabels.CustomGamesView.showParticipants + '&#9660;'}}</span>
      <span>{{ isListVisible ? '&#9650;' : '&#9660;' }}</span>
</div>
    <ul v-if="isListVisible">
      <li v-if="userRole === 'play' && gameStarted === false">
        <strong>{{ userName ? userName : "Admin" }}</strong>
      </li>
      <li v-for="(participant, index) in participants" :key="index">
        <strong>{{ participant.name }}</strong>
      </li>
    </ul>
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
import EditQuiz4Component from '../components/EditQuiz4Component.vue';
import Nav from '@/components/ResponsiveNav.vue';



export default {
name: 'CustomGames',
components: {
  Nav,
  EditQuiz1Component,
  EditQuiz2Component,
  EditQuiz3Component,

},
data: function() {
  return {
    lang: sessionStorage.getItem("lang") || "en",
    selectedMinutes: 60,
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
    isListVisible: false,
    toggleText: "Show Participants",

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
      
      socket.on("updateGameData", (gameData) => {
        
        console.log("Game data received: ", gameData);
        this.selectedGames = gameData.selectedGames;
        this.participants = gameData.participants;
        this.selectedMinutes = gameData.selectedMinutes;
        this.customQuestions = gameData.customQuestions;
        console.log("Updated gameData, participants: ", this.participants);
        });
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


/*

  //Används ej
  socket.emit("adminRejoined", (this.gamePin))
  console.log("adminRejoined",this.gamePin, this.userName)

  */
},
methods: {

  mainMenu: function() {
    window.removeEventListener("beforeunload", this.handleBeforeUnload);
    this.$router.push("/");
  },


  handleLanguageChange(newLang) {
      this.lang = newLang;
      sessionStorage.setItem("lang", newLang);
      socket.emit("getUILabels", this.lang);
  }, 
  
  incrementMinutes: function() {
    this.selectedMinutes += 10;
    console.log(this.participants);
  },

  decrementMinutes: function () {
    if(this.selectedMinutes > 10){
      this.selectedMinutes -= 10;
    }
  },

  toggleListVisibility: function() {
        this.isListVisible = !this.isListVisible;
        this.toggleText = this.isListVisible ? "Hide questions" : "Show questions";
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
      alert("Name is taken, please choose another one");
      return;
    }

    if (this.selectedGames.length === 0) {
      alert("Please select at least one game.");
      return;
    }

    if (this.participants.length === 0 && this.userRole === 'play') {
      alert("No players have joined yet.");
      return;
    }
    if(this.participants.length < 2 && this.userRole === 'host'){
      alert("Only one player has joined. At least two players are required to start the game.");
      return;
    }

    if (this.userRole === 'play') {
      if (!this.userName) {
        alert("Please enter your username.");
        return;
      }
      console.log("hej",   this.userName);
      const adminName={      
        name: this.userName,
        scoreGame1: 0,
        scoreGame2: 0,
        scoreGame3: 0,
        scoreGame4: 0
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

    // TODO: Admin ska också till gameView. men i nåt sorts 'admin mode' där hen kan starta minigames etc. /sebbe
    // this.$router.push({
    //   name: 'GameView',
    //   params: { gamePin }
    // });
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
  // this.useCustomQuestions = useCustomQuestions;
  // this.customQuestions = savedQuestions;


  // console.log("Dessa ska vara lika dana:", this.customQuestions, "och", thiscustomQuestions[this.currentGame.id].customQuestions )

  socket.emit(
    "savedQuestionsToServer", 
    this.gamePin, 
    this.customQuestions[this.currentGame.id].customQuestions,
    this.customQuestions[this.currentGame.id].useCustomQuestions,
    this.currentGame.id
  );
},

  // handleWindowClose(event) {
  //     console.log("Admin window closed! unactivating lobby")
  //     //socket.emit("adminLeftGame", this.gamePin, this.userName);
  //   },

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
    handleLanguageChange(newLang) {
      this.lang = newLang;
      localStorage.setItem("lang", newLang);
      socket.emit("getUILabels", this.lang);
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

mounted() {

  window.addEventListener("beforeunload", this.handleBeforeUnload);

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
  color: #333;
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
  color: #555;
}

.radio-option input[type="radio"] {
  transform: scale(1.2);
  accent-color: #4caf50;
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



.game-item {
display: flex;
justify-content: center; 
align-items: center; 
margin-bottom: 20px; 
}

.game-item label {
margin-left: 10px; 
margin-right: 20px; 
font-weight: bold;
}

.edit-button {
display: inline-block;
background-color: rgb(183, 183, 183);
color: white;
border: none;
border-radius: 40px;
padding: 6px 8px;
text-align: center;
text-decoration: none;
font-size: 14px;
cursor: pointer;
transition: background-color 0.3s ease, transform 0.2s ease;
}

.edit-button:hover {
background-color: rgb(170, 168, 168);
transform: scale(1.02);
box-shadow: 0 0 5px 2px  rgba(0, 0, 0, 0.5);
}

.edit-button:active {
transform: scale(1);
box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.5);
}
.edit-icon {
width: 30px; 
height: 30px; 
vertical-align: middle; 
}

input[type="checkbox"] {  
      width: 20px;
      height: 20px;
  }

  .participants {
    flex: 0 0 auto;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 15px;
    background-color: lightblue;
    position: absolute;
    right: 0;
    margin-right: 50px;
    margin-top: 20px;
    box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.5);
}
 .participants h2{
    text-align: center;
    margin-bottom: 10px;
  }

  .participants ul{
    list-style-type: none;
    padding: 0;
  }

  .participants li{
    padding: 5px 0;
    border-bottom: 1px solid #ddd;
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
</style>