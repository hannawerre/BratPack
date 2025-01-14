<template>
  
  <div>
      <!-- Start Phase -->
      <div v-if="currentPhase === 'startPhase'">
        <h1> {{ uiLabels.GameView.generalTrivia }}</h1>
        <div v-if="isAdmin">
          <button class="button blue small" @click="startQuiz"> {{ uiLabels.GameView.startQuiz }}</button>
        </div>
        <div v-else> {{ uiLabels.GameView.waitingOnAdmin }}</div>
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
      
      <!-- Feedback Phase -->
      <div v-else-if="currentPhase === 'feedbackPhase'">
        <div v-if="currentAnswer && currentAnswer.isCorrect  && this.isPlaying" class="feedback-icon-wrapper">
          <div class="icon-circle icon-correct">✔</div>
          <p class="big-text"> {{ uiLabels.GameView.correct }}</p>
          <p v-if="getPlayerRank(userName)!=1"> {{uiLabels.GameView.youAreBehind}} <strong> {{getPlayerAhead(userName)}} {{ " " }}</strong> {{ uiLabels.GameView.with }} {{ getPointsBehind(userName) }} {{ uiLabels.GameView.points }} </p>
        </div>

        <div v-else-if="currentAnswer  && this.isPlaying" class="feedback-icon-wrapper">
          <div class="icon-circle icon-wrong">✖</div>

          <br>
           <p>{{ uiLabels.GameView.wrong }}</p>
          <p v-if="getPlayerRank(userName)!=1">{{uiLabels.GameView.youAreBehind}}{{getPlayerAhead(userName)}} {{ uiLabels.GameView.with }} {{ getPointsBehind(userName) }} {{ uiLabels.GameView.points }} </p>
        </div>

        <!-- Om användaren inte hann svara -->
        <div v-else-if="this.isPlaying" class="feedback-icon-wrapper">
          <div class="icon-circle icon-wrong">✖</div>
        
          <p> {{ uiLabels.GameView.tooSlow }}</p>
          <p v-if="getPlayerRank(userName)!=1"> {{ uiLabels.GameView.youAreBehind }}{{ getPlayerAhead(userName) }} {{ uiLabels.GameView.with }} {{ getPointsBehind(userName) }} {{ uiLabels.GameView.points }}</p>
        </div>
  
        <div v-if="isAdmin">
          <button class="button blue small" v-if="!isLastQuestion" @click="nextQuestion">{{ uiLabels.GameView.nextQuestion }}</button>
          <button class="button blue small" v-else @click="nextQuestion"> {{ uiLabels.GameView.showResults }}</button>
        </div>
      
      </div>
      
 <!-- Score board--> 
      <div v-else-if="currentPhase === 'scoreBoard'">
        <p class="big-text">{{ uiLabels.GameView.gameOver }}</p>
      </div>
  </div> 
</template>

<script>


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
    userName: { type: String, required: true},
    isPlaying: { type: Boolean, required: true}
  
  },

  data() {
    return {
      lang: sessionStorage.getItem("lang") || "en",
      questions: [],
      currentQuestionIndex: 0,
      currentPhase: 'startPhase',
      countdownProgress: 100,
      currentAnswer: null,
      countDownNumber: 3,
      pointsTime: 0,
      playerAnsweredRight: false,
      localPoints: 0
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
      if(!this.isPlaying){
        this.questions.forEach((question=> {
          question.answers = [];
        }))
      }
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
      handleLanguageChange(newLang) {
        this.lang = newLang;
        sessionStorage.setItem("lang", newLang);
        socket.emit("getUILabels", this.lang);
    },
      onAnswer(answerData) {
        this.currentAnswer = answerData;
        
        if (answerData.isCorrect) {
          const points = Math.floor((this.countdownProgress / 100) * 1000);
          this.playerAnsweredRight = true;
          this.localPoints += points;
          
      }
    },
    updatePoints() {
      
      if(this.isPlaying){
      socket.emit("updatePlayerPoints", {
        gamePin: this.gamePin,
        userName: this.userName,
        newScore: this.localPoints
      })
    }},
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
            this.updatePoints();
            this.currentPhase="feedbackPhase";
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
        return rank || "N/A"; 
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
.intro-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px; /* Sätt höjd så att siffran är centrerad */
    /* Kanske bakgrundsfärg för "filmisk" känsla */
}

.countdown-number {
  color: #1d3557;
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
  height: 8px;
  background-color: #ddd;
  position: relative;
  margin-top: 10px;
  border-radius: 5px;

}

.progress {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.2s ease;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
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


