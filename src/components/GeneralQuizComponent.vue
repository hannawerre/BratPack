<template>
  
  <div>
      <!-- Start Phase -->
      <div v-if="currentPhase === 'startPhase'">
        <h1> {{ uiLabels.generalTrivia }}</h1>
        <div v-if="isAdmin">
          <button class="button blue small" @click="startQuiz"> {{ uiLabels.startQuiz }}</button>
        </div>
        <div v-else> {{ uiLabels.waitingOnAdmin }}</div>
      </div>

      <!-- Intro Phase  -->
      <div v-else-if="currentPhase === 'introPhase'" class="intro-wrapper">
        <transition name="countdown-flash" mode="out-in">
          <h1 v-if="countDownNumber >= 0" :key="countDownNumber" class="countdown-number">
            {{ countDownNumber }}
          </h1>
        </transition>
      </div>
      
      <!-- Question Phase-->
      <div v-else-if="currentPhase === 'questionPhase'">
        <QuestionComponent
          v-if="questions.length > 0"
          :question="questions[currentQuestionIndex]"
          :isAdmin="isAdmin"
          @answer="onAnswer" 
        />
        <div class="countdown-bar">
            <div class="progress" :style="{ width: countdownProgress + '%' }"></div>
        </div>
      </div>

      <!-- Answered Phase-->
      <div v-else-if="currentPhase === 'answeredPhase'">
        <h2> {{ uiLabels.youHaveAnswered }}</h2>
        <p> {{ uiLabels.waitingForTimeToRunOut }}</p>
        <div class="countdown-bar">
          <div class="progress" :style="{ width: countdownProgress + '%' }"></div>
        </div>
      </div>
      
      <!-- Feedback Phase -->
      <div v-else-if="currentPhase === 'feedbackPhase'">
        
        <div v-if="currentAnswer && currentAnswer.isCorrect" class="feedback-icon-wrapper">
          <div class="icon-circle icon-correct">✔</div>
          <p> {{ uiLabels.youAnsweredRight }}</p>
          <p> {{ uiLabels.yourPointsRightNow }} {{ this.gameData.participants.find(p => p.name === userName).scoreGame1 }}</p>
          <p> {{ uiLabels.yourRankRightNow }} {{ getPlayerRank(userName) }} </p>
          <p v-if="getPlayerRank(userName)!=1"> {{uiLabels.youAreBehind}} {{ getPlayerAhead(userName) }} {{ uiLabels.with }} {{ getPointsBehind(userName) }} poäng </p>
        </div>

        <div v-else-if="currentAnswer" class="feedback-icon-wrapper">
          <div class="icon-circle icon-wrong">✖</div>
          <p> {{ uiLabels.youWereWrong }}</p>
          <p> {{ uiLabels.yourPointsRightNow}} {{ this.gameData.participants.find(p => p.name === userName).scoreGame1 }}</p>
          <p> {{uiLabels.yourRankRightNow}} {{ getPlayerRank(userName) }} </p>
          <p v-if="getPlayerRank(userName)!=1">{{uiLabels.youAreBehind}}{{ getPlayerAhead(userName) }} {{ uiLabels.with }} {{ getPointsBehind(userName) }} {{ uiLabels.points }} </p>
        </div>

        <!-- Om användaren inte hann svara -->
        <div v-else class="feedback-icon-wrapper">
          <div class="icon-circle icon-wrong">✖</div>
          <p> {{ uiLabels.tooSlow }}</p>
          <p>{{ uiLabels.yourPointsRightNow }} {{ this.gameData.participants.find(p => p.name === userName).scoreGame1 }}</p>
          <p> {{uiLabels.yourRankRightNow}} {{ getPlayerRank(userName) }} </p>
          <p v-if="getPlayerRank(userName)!=1"> {{ uiLabels.youAreBehind }} {{ getPlayerAhead(userName) }} {{ uiLabels.with }} {{ getPointsBehind(userName) }} {{ uiLabels.points }}</p>
        </div>
  
        <div v-if="isAdmin">
          <button class="button blue small" v-if="!isLastQuestion" @click="nextQuestion">{{ uiLabels.nextQuestion }}</button>
          <button class="button blue small" v-else @click="nextQuestion"> {{ uiLabels.showResults }}</button>
        </div>
      
      </div>
      
 <!-- Score board--> 
      <div v-else-if="currentPhase === 'scoreBoard'">
        <h2>{{ uiLabels.scoreboard }}</h2>
          <ul>
            <li 
               v-for="(p, index) in sortedParticipants" 
              :key="index" 
              :class="{ 'top-player': index === 0 }"
            >
              #{{ index + 1 }} {{ p.name }}: {{ p.scoreGame1 }} {{ uiLabels.points }}
            </li>
          </ul>
      </div>
  </div> 
</template>

<script>
/* 

GLÖM EJ ATT ÄNDRA SPRÅKET TILL LOCALSTORAGE





*/

import QuestionComponent from './QuestionComponent.vue';
const socket = io("localhost:3000");
import io from 'socket.io-client'; 

export default {
  name: 'GeneralQuizComponent',
  components: {
    QuestionComponent
  },
  props: {
    gameData: { type: Object, required: true },
    gamePin: { type: String, required: true },
    uiLabels: { type: Object, required: true },
    isAdmin: { type: Boolean, required: true },
    isPlaying: { type: Boolean, required: true },
  },

  data() {
    return {
      lang: sessionStorage.getItem("lang") || "en",
      questions: [],
      currentQuestionIndex: 0,
      currentPhase: 'startPhase',
      countdownProgress: 100,
      userName: sessionStorage.getItem('userName'),
      currentAnswer: null,
      countDownNumber: 3,
      pointsTime: 0,
      playerAnsweredRight: false,
    };
  },

  computed: {
    isLastQuestion() {
      return this.currentQuestionIndex >= this.questions.length - 1;
    },
    sortedParticipants() {
      return [...this.gameData.participants].sort(
        (a, b) => b.scoreGame1 -a.scoreGame1
      );
    }
  },

  created() {
    socket.emit("joinSocketRoom", this.gamePin);
      
    // När servern skickar frågorna, sätt dem i `questions`
    socket.on('sendingQuestions', quizQuestions => {
      this.questions = quizQuestions.questions;
    });
      
    socket.on("startQuestion", (currentQuestionIndex) =>{
      this.currentQuestionIndex = currentQuestionIndex
      this.goToNextPhase();
    })
    // Be om frågorna från servern
    socket.emit('getQuestions', this.lang, this.gamePin, "generalQuiz");
  },
 
  methods: {
    startQuiz(){
      socket.emit("startingQuestion", {
          gamePin: this.gamePin, 
          currentQuestionIndex: this.currentQuestionIndex
        })
      },
      onAnswer(answerData) {
      const participant = this.gameData.participants.find(
        (p) => p.name === this.userName
      );
      

      this.currentAnswer = answerData;
      this.currentPhase = "answeredPhase";

      if (answerData.isCorrect) {
        const points = Math.floor((this.countdownProgress / 100) * 1000);
        this.playerAnsweredRight = true;
        participant.scoreGame1 += points;
        this.updatePoints(participant);
      }
    },
    updatePoints(participant) {
      socket.emit("updatePlayerPoints", {
        gamePin: this.gamePin,
        userName: this.userName,
        newScore: participant.scoreGame1
      })
    },
    nextQuestion() {
      this.currentQuestionIndex++;
      socket.emit("startingQuestion", {
        gamePin: this.gamePin,
        currentQuestionIndex: this.currentQuestionIndex,
      });
    },
    
    goToNextPhase(){
        switch (this.currentPhase) {
          case "startPhase":
            this.currentPhase = 'introPhase';
            this.startCountdown(3)
            break;

          case "introPhase":
            this.currentPhase = "questionPhase";
            this.startCountdown(10)
            break;
          
          case "questionPhase":
            if(this.currentAnswer!=null){
              this.currentPhase = "answeredPhase"}
            else{
                this.currentPhase="feedbackPhase";
              }
            break;

          case "answeredPhase":
            this.currentPhase="feedbackPhase"
            break;
            
          case "feedbackPhase":
            if(this.currentQuestionIndex > this.questions.length - 1) {
              this.currentPhase = "scoreBoard"
              // Close down game component after 30 seconds.
              setTimeout(()=> {
                this.$emit('gameCompleted');
              }, 30000)
            }
            else{
              this.currentAnswer = null;
              this.currentPhase = "introPhase";
              this.startCountdown(3)
            } 
            break;
        }
      },
      startCountdown(duration) {
        const updateInterval = 100; 
        const startTime = Date.now();
        const endTime = startTime + duration * 1000 
        const totalTime = duration * 1000; 
        this.pointsTime = totalTime;

        this.timeIsUp = false;

        this.countDownNumber = duration;


        const interval = setInterval(() => {
            const now = Date.now();
            let remainingTime = endTime - now;
            
            if (remainingTime < 0) remainingTime = 0;

            const progress = (remainingTime / totalTime) * 100;
            this.countdownProgress = progress;

            const timeLeftInMilliSeconds = remainingTime;
            this.timeLeftOnAnswer = timeLeftInMilliSeconds;
            const timeLeftInSeconds = Math.ceil(remainingTime/1000);
            this.countDownNumber = timeLeftInSeconds

            if (remainingTime <= 0) {
                clearInterval(interval);
                this.countdownProgress = 0;
                this.timeIsUp = true;
                console.log(this.currentPhase);

                setTimeout(() => {
                  this.goToNextPhase(); 
                }, 200)    
            }
        }, 
        updateInterval); 
        },
      getPlayerRank(userName) {
        const rank = this.sortedParticipants.findIndex(p => p.name === userName) + 1;
        return rank || "N/A"; // Returnerar "N/A" om spelaren inte hittas
      },
      getPointsBehind(userName) {
        const sorted = this.sortedParticipants; // Använd den sorterade listan
        const rank = sorted.findIndex(p => p.name === userName); // Hitta spelarens rank (0-indexerad)
        
        if (rank > 0) {
          // Jämför spelarens poäng med spelaren precis före
          const pointsBehind = sorted[rank - 1].scoreGame1 - sorted[rank].scoreGame1;
          return pointsBehind;
        }

        // Om spelaren är först (rank 0), finns ingen att jämföra med
        return null;
    },
    getPlayerAhead(userName) {
      const sorted = this.sortedParticipants; // Använd den sorterade listan
      const rank = sorted.findIndex(p => p.name === userName); // Hitta spelarens rank (0-indexerad)
        
      if (rank > 0) {
          // Returnera namnet på spelaren precis före
        return sorted[rank - 1].name;
        }
        // Om spelaren är först (rank 0), finns ingen att jämföra med
      return null;
      },
    }
 };
</script>

<style scoped>
.start-button{
  background-color: green;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;  
  display: inline-block;
  font-size: 16px;
  margin: 30px 4px;
  padding: 15px;
  text-align: center;
  text-decoration: none;  
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.startbutton:hover{
  background-color: rgb(8, 179, 8);
  box-shadow: 0 0 15px 5px rgba(8, 179, 8, 0.5); 
  transform: scale(1.05);
}
.intro-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px; /* Sätt höjd så att siffran är centrerad */
  background: black; /* Kanske bakgrundsfärg för "filmisk" känsla */
}

.countdown-number {
  color: white;
  font-size: 8rem;
  font-weight: bold;
}

/* Övergångsklasser för namnet "countdown-flash" */
.countdown-flash-enter-active,
.countdown-flash-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}

.countdown-flash-enter {
  opacity: 0;
  transform: scale(2);
}

.countdown-flash-leave-to {
  opacity: 0;
  transform: scale(0.1);
}

.countdown-bar {
  width: 100%;
  height: 20px;
  background-color: #ddd;
  position: relative;
  margin-top: 10px;
}

.progress {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.2s ease;
}

.feedback-icon-wrapper {
  display: flex;
  flex-direction: column; /* Ikon överst, text under */
  align-items: center;
  justify-content: center;
  margin-top: 20px;
}

/* Själva cirkeln */
.icon-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;     /* Storlek på bocken/krysset */
  width: 100px;        /* Bredd/höjd på cirkeln */
  height: 100px;
  border-radius: 50%;  /* Gör den rund */
  color: #fff;         /* Vit text */
  margin-bottom: 10px; /* Liten space under cirkeln */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
}

/* Grön cirkel (rätt) */
.icon-correct {
  background-color: #4caf50; /* Grön */
}

/* Röd cirkel (fel) */
.icon-wrong {
  background-color: #f44336; /* Röd */
}

.top-player {
  font-weight: bold;
  color: gold;
}

</style>


