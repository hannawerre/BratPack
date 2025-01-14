<template>
  <div>
      <!-- Start Phase -->
      <div v-if="currentPhase === 'startPhase'">
        <h1> {{ uiLabels.GameView.generalTrivia }}</h1>
        <div v-if="isAdmin">
          <button @click="startQuiz" class="button blue small"> {{ uiLabels.GameView.startQuiz }}</button>
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

      <!-- Feedback Phase -->
      <div v-else-if="currentPhase === 'feedbackPhase'">
        
        <div v-if="checkCorrectAnswer && this.isPlaying" class="feedback-icon-wrapper">
          <div class="icon-circle icon-correct">✔</div>
          <p class="big-text"> {{ uiLabels.GameView.correct }}</p>
          <p v-if="getPlayerRank(userName)!=1"> {{uiLabels.GameView.youAreBehind}} <strong> {{getPlayerAhead(userName)}} {{ " " }}</strong> {{ uiLabels.GameView.with }} {{ getPointsBehind(userName) }} {{ uiLabels.GameView.points }} </p>
          
         </div>
        <div v-else-if="currentAnswer  && this.isPlaying" class="feedback-icon-wrapper">
          <div class="icon-circle icon-wrong">✖</div>
          <p class="big-text"> {{ uiLabels.GameView.youWereWrong }}</p>
          <p v-if="getPlayerRank(userName)!=1"> {{uiLabels.GameView.youAreBehind}} <strong> {{getPlayerAhead(userName)}} {{ " " }}</strong> {{ uiLabels.GameView.with }} {{ getPointsBehind(userName) }} {{ uiLabels.GameView.points }} </p>
          </div>

        <!-- Om användaren inte hann svara -->
        <div v-else-if= "this.isPlaying" class="feedback-icon-wrapper">
          <div class="icon-circle icon-wrong">✖</div>
          <p class="big-text"> {{ uiLabels.GameView.tooSlow }}</p>
          <p v-if="getPlayerRank(userName)!=1"> {{uiLabels.GameView.youAreBehind}} <strong> {{getPlayerAhead(userName)}} {{ " " }}</strong> {{ uiLabels.GameView.with }} {{ getPointsBehind(userName) }} {{ uiLabels.GameView.points }} </p>      
        </div>
  
        <div v-if="isAdmin">
          <button v-if="!isLastQuestion" @click="nextQuestion">{{ uiLabels.GameView.nextQuestion }}</button>
          <button v-else @click="nextQuestion"> {{ uiLabels.GameView.showResults }}</button>
        </div>
      
      </div>
      

 <!-- Score board--> 
      <div v-else-if="currentPhase === 'scoreBoard'">
            <p>{{ uiLabels.GameView.gameOver }}</p>
      </div>
  </div> 
</template>
  
  <script>
 
  
  import QuestionComponent from './QuestionComponent.vue';
  import Nav from './ResponsiveNav.vue';
  const socket = io("localhost:3000");
  import io from 'socket.io-client'; 
  
  export default {
    name: 'WhosMostLikelyToComponent',
    components: {
      QuestionComponent,
      Nav
    },
    props: {
      gameData: { type: Object, required: true },
      gamePin: { type: String, required: true },
      uiLabels: { type: Object, required: true },
      userName: { type: String, required: true},
      isAdmin: { type: Boolean, required: true },
      isPlaying: {type: Boolean, required:true}
      
    },
  
    data() {
      return {
        participants: {},
        currentPhase: "startPhase",
        lang: localStorage.getItem("lang") || "en",
        questions: [], 
        currentQuestionIndex: 0,
        countdownProgress: 100,
        currentAnswer: null,
        countDownNumber: 3, 
        pointsTime: 0, 
        correctAnswer: null


      
      };
    },
  
    
  
    computed:  {
      checkCorrectAnswer() {
  // 1) Om correctAnswer saknas, avbryt
        if (!Array.isArray(this.correctAnswer)) {
          return false
        }

        // 2) Kolla ifall currentAnswer matchar nån av elementen
        return this.correctAnswer.includes(this.currentAnswer)
      },

      isLastQuestion() {
      return this.currentQuestionIndex >= this.questions.length - 1;
    }
      
    },
    created() {
      socket.on("participantsUpdate", (participants) => {
        this.participants = participants
      })
      
      this.setUpGame();
      
      socket.on("sendingQuestionsWho", questions =>{

        this.questions = questions
        if(!this.isPlaying){
          this.questions.forEach(question=> {
            question.answers = [];
          })
        }
      })
        
      socket.on("startQuestion", (currentQuestionIndex) =>{
        this.currentQuestionIndex = currentQuestionIndex
        this.goToNextPhase();
      })
      // Be om frågorna från servern
      socket.on("correctAnswerCalculated", (correctAnswer) => {
        console.log("correct answer:", correctAnswer)
        this.correctAnswer = correctAnswer;
      
      })
      socket.emit("joinSocketRoom", this.gamePin);
    },
   
    methods: {
      setUpGame: function (){
        socket.on("setUpWhosMostLikelyTo", (whosMostLikelyTo) => {
          this.participants = whosMostLikelyTo.participants; //De som spelar är de som deltar i whosMostLikely
          this.currentQuestionIndex = whosMostLikelyTo.currentQuestionIndex;
          console.log("Detta är participants:", this.participants)
          socket.emit("getQuestionsWho", this.lang, this.gamePin, this.participants);
        })
        socket.emit("settingUpWhosMostLikelyTo", this.gamePin);
      },

    
      startQuiz(){
        socket.emit("startingQuestion", {
            gamePin: this.gamePin, 
            currentQuestionIndex: this.currentQuestionIndex
          })
        },
        nextQuestion() {
          this.currentQuestionIndex++;
          socket.emit("startingQuestion", {
            gamePin: this.gamePin,
            currentQuestionIndex: this.currentQuestionIndex,
            
        });
        socket.emit("nextQuestionWhosMostLikelyTo", this.gamePin);
          
        console.log("Nu är index", this.currentQuestionIndex)
    
        console.log("Current answer:", this.currentAnswer, "Correct answer:", this.correctAnswer)
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
              socket.emit("calculateCorrectAnswer", this.gamePin);  
                this.currentPhase="feedbackPhase";s
                break;
  
  
              
            case "feedbackPhase":
              if(this.currentQuestionIndex > this.questions.length - 1) {
                this.currentPhase = "scoreBoard"
                this.$emit('gameCompleted');
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
          onAnswer(answerObj) {
            this.currentAnswer = answerObj.answerText;
            console.log(this.currentAnswer)
            socket.emit("playerAnswers", {
              gamePin: this.gamePin,
              answerObj: answerObj,
              userName: this.userName
            },

           
            
              
            )
       
          },
          getPlayerRank(userName) {
            const rank = this.sortedParticipants.findIndex(p => p.name === userName) + 1;
            return rank || "N/A"; 
          },


          getPointsBehind(userName) {
            const sorted = this.sortedParticipants;
            const rank = sorted.findIndex(p => p.name === userName); 
            
            if (rank > 0) {
              const pointsBehind = sorted[rank - 1].scoreGame1 - sorted[rank].scoreGame1;
              return pointsBehind;
            }

            
            return null;
        },
        getPlayerAhead(userName) {
          const sorted = this.sortedParticipants; 
          const rank = sorted.findIndex(p => p.name === userName); 
            
          if (rank > 0) {
            return sorted[rank - 1].name;
            }
          return null;
          },
            
      }

    }
  </script>
  
  <style scoped>
  .intro-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 300px; 
    background: black; 
  }
  
  .countdown-number {
    color: white;
    font-size: 8rem;
    font-weight: bold;
  }
 

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
    flex-direction: column; 
    align-items: center;
    justify-content: center;
    margin-top: 20px;
  }
  

  .icon-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;    
    width: 100px;        
    height: 100px;
    border-radius: 50%;  
    color: #fff;         
    margin-bottom: 10px; 
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
  }

  .icon-correct {
    background-color: #4caf50; 
  }
  
  .icon-wrong {
    background-color: #f44336;
  }
  
  .top-player {
    font-weight: bold;
    color: gold;
  }
  
  </style>