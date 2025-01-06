<template>
  <div v-if="currentPhase === 'startPhase'">
    <h1> {{ uiLabels.generalTrivia }}</h1>

    <div v-if="isAdmin">
      <button @click="startQuiz">
        Start quiz
      </button>
    </div>
    <div v-else>
      Väntar på att admin ska starta quizet...
    </div> 
  </div>

  <div v-else-if="currentPhase === 'introPhase'" class="intro-wrapper">
    <transition name="countdown-flash" mode="out-in">
      <h1
        v-if="countDownNumber >= 0"
        :key="countDownNumber"
        class="countdown-number">
        {{ countDownNumber }}
      </h1>
    </transition>

  </div>




  <div v-else-if="currentPhase === 'questionPhase' ">
 
    <QuestionComponent
      v-if="questions.length > 0"
      :question="questions[currentQuestionIndex]"
      :isAdmin="isAdmin"
      @answer="handleAnswer" 
    />
    <div class="countdown-bar">
        <div class="progress" :style="{ width: countdownProgress + '%' }"></div>
    </div>

  </div>

  <div v-else-if="currentPhase === 'answeredPhase'">
    <h2>Du har svarat!</h2>
    <p>Vänta tills tiden går ut...</p>
    
    <!-- Ex. Du kan fortfarande visa nedräkningen om du vill -->
    <div class="countdown-bar">
      <div class="progress" :style="{ width: countdownProgress + '%' }"></div>
    </div>
  </div>

  <div v-else-if="currentPhase === 'feedbackPhase'">
    <div v-if="isAdmin">
      <button @click="nextQuestion">Nästa fråga</button>
    </div>
    <!-- FEEDBACKPHASE (icke-admin) -->
    <div v-else>
    <!-- När man svarat rätt -->

      <div v-if="currentAnswer && currentAnswer.isCorrect" class="feedback-icon-wrapper">
        <div class="icon-circle icon-correct">✔</div>
        <p>Du hade rätt</p>
        <p v-for="participant in this.gameData.participants"> Din poäng är just nu: {{ participant.scoreGame1 }}</p>
      </div>

    <!-- När man svarat fel -->
      <div v-else-if="currentAnswer" class="feedback-icon-wrapper">
        <div class="icon-circle icon-wrong">✖</div>
        <p>Du hade fel</p>
      </div>

    <!-- För långsam eller ej svarat -->
      <div v-else class="feedback-icon-wrapper">
        <div class="icon-circle icon-wrong">✖</div>
        <p>Oooops, för långsam...</p>
      </div>
    
    </div>
  </div>


  <div v-else-if="currentPhase === 'feedbackPhase' && isAdmin">
    <button @click="nextQuestion">Nästa fråga</button>
  </div>

  
  <div v-else-if="currentPhase === 'scoreBoard'">
    <h2>Scoreboard</h2>
    <ul>
      <li v-for="(p, index) in this.gameData.participants" :key="index">
        {{ p.name }}: {{ p.scoreGame1}}
      </li>
    </ul>
  </div>
</template>

<script>

import QuestionComponent from './QuestionComponent.vue';
import Nav from './ResponsiveNav.vue';
import {socket} from '../socketClient.js';

export default {
  name: 'GeneralQuizComponent',
  components: {
    QuestionComponent,
    Nav
  },
  props: {
    gameData: {
      type: Object,
      required: true
    },
    gamePin: {
      type: String,
      required: true
    },
    uiLabels: {
      type: Object,
      required: true

    },
    isAdmin: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      lang: localStorage.getItem("lang") || "en",
      questions: [],
      currentQuestionIndex: 0,
      currentPhase: 'startPhase',
      countdownProgress: 100,
      userName: sessionStorage.getItem('userName'),
      currentAnswer: null,
      countDownNumber: 3,
      timeLeftOnAnswer: 0,
      pointsTime: 0,
      timeIsUp: false,
      playerAnsweredRight: false,
      localGameData: JSON.parse(JSON.stringify(this.gameData))
    };
  },
  created() {
  
      socket.on("updateGameData", gameData => {
        this.localGameData = gameData;
      })
    // När servern skickar frågorna, sätt dem i `questions`
      socket.on('generalQuestions', quizQuestions => {
          this.questions = quizQuestions.questions;
    });
      socket.on("startGeneralQuizQuestion", (currentQuestionIndex) =>{
        this.currentQuestionIndex = currentQuestionIndex
        console.log("startar fråga...")
        this.goToNextPhase();
      })

      
    
    socket.on("allParticipantsAnswered", () => {
      if (!this.isAdmin){
        this.currentPhase = "feedbackPhase";
      }});
    
    // Be om frågorna från servern
    socket.emit('getQuestions', this.lang);

  },
 
  


 
  methods: {
    updatePoints(participant) {
      console.log("försöker uppdatera poäng")
      socket.emit("updatePlayerPoints", {
            gamePin: this.gamePin,
            userName: this.userName,
            newScore: participant.scoreGame1,
            playerAnsweredRight: this.playerAnsweredRight
          })

    },
    startQuiz(){
      socket.emit("startingQuizQuestion", {
          gamePin: this.gamePin, 
          currentQuestionIndex: this.currentQuestionIndex
        })
      console.log("starta quiz")
      
    },

    handleAnswer(answer){
      if(this.isAdmin){
        return;
      }
      this.onAnswer(answer)
    },

    onAnswer(answer) {
      this.currentAnswer = answer;
      this.currentPhase = "answeredPhase"
      
      const participant = this.gameData.participants.find(p => p.name === this.userName) //för att se till att rätt deltagres poäng uppdateras
      if(answer.isCorrect){
          
          const leftOverTime = this.timeLeftOnAnswer;
          const fraction = leftOverTime / this.pointsTime;
          const points = Math.floor(fraction *1000);

          this.playerAnsweredRight = true;
          participant.scoreGame1 += points;
          console.log(participant.name, participant.scoreGame1)

          
      }
      
      this.updatePoints(participant);

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
            if(!this.isAdmin){
              this.currentPhase = "answeredPhase"
            }
            else{
              this.currentPhase="feedbackPhase"
            }
            break;
          
          case "answeredPhase":
            this.currentPhase="feedbackPhase"
            break;
            
          case "feedbackPhase":
            if(this.currentQuestionIndex < this.questions.length - 1) {
              this.playerAnsweredRight = false;
              this.currentQuestionIndex++;
              this.currentPhase = "introPhase";
              this.startCountdown(3)
            } else{
              this.currentPhase = "scoreBoard"
            }
            break;
          

        }
      },
      nextQuestion () {
        if (this.currentQuestionIndex < this.questions.length - 1) {
          this.currentQuestionIndex++;
      }
        socket.emit("startingQuizQuestion", {
          gamePin: this.gamePin, 
          currentQuestionIndex: this.currentQuestionIndex
        })
       

      }
    }
    };
</script>

<style scoped>
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

</style>


