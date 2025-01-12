<template>
    <div>
    <!-- Rules -->
    <div v-if="currentPhase === 'showRules'">
        <!-- TODO: Fixa så regler syns i rätt språk. -->
         <h3>One participant will be chosen for each round</h3>
         <h3>The task is to pick the same answer as the chosen one</h3>
         <h3>How well do you know your fellow mates?</h3>
        <div class="countdown-bar">
        <div class="progress" :style="{ width: countdownProgress + '%' }"></div>
      </div>
    </div>

    <!-- Game Phase 1: Display Chosen Participant -->
    <div v-if="currentPhase === 'showChosenParticipant'">
      <h2>Chosen participant: {{ chosenParticipant }}</h2>
      <div class="countdown-bar">
        <div class="progress" :style="{ width: countdownProgress + '%' }"></div>
      </div>
    </div>

    <!-- Game Phase 2: Display Question -->
    <div v-if="currentPhase === 'showQuestion'">
        <h2>Chosen participant: {{ chosenParticipant }}</h2>
      <QuestionComponent
        v-if="questions?.questions?.[currentQuestion]"
        :question="questions.questions[currentQuestion]"
        @answer="onAnswer"
      />
      <div class="countdown-bar">
        <div class="progress" :style="{ width: countdownProgress + '%' }"></div>
      </div>
    </div>

    <!-- Game Phase 3: Display Correct Answer -->
  <div v-if="currentPhase === 'showAnswer'">
    <!-- If chosenParticipant didn't answer -->
    <h2 v-if="showChosenParticipantNoAnswer" class="no-answer-message">
      Chosen Participant {{ this.chosenParticipant }} didn't answer
    </h2>
    <h2 v-else class="correct-answer-message">
      Correct Answer: {{ questions.questions[currentQuestion].answers[correctAnswer-1].answer }}
    </h2>

    <!-- Display all participants and highlight those who got it right -->
    <div v-for="[key,value] in Object.entries(participants)" :key="key">
      <p v-if="correctParticipants.includes(key)">
        <span class="correctParticipant">{{ key }}</span>: {{ value.points }}
      </p>
      <p v-else>
        {{ key }}: {{ value.points }}
      </p>
    </div>

    <!-- Countdown Bar -->
    <div class="countdown-bar">
      <div class="progress" :style="{ width: countdownProgress + '%' }"></div>
    </div>
  </div>

  <!-- Game Phase 4: Display Final Results -->
  <div v-if="currentPhase === 'showFinalResults'" class="final-results">
    <h2>Final Results</h2>
    <div v-for="[key,value] in Object.entries(participants)" :key="key" class="leaderboard-item">
      <p>{{ key }}: {{ value.points }}</p>
    </div>
  </div>
    
  </div>
</template>

<script>
import QuestionComponent from './QuestionComponent.vue';
//const socket = io("localhost:3000");
import io from 'socket.io-client'; 

export default {
    name: 'ThisOrThatComponent',
    components: {
        QuestionComponent
    },

    props: {
        socket: {
            type: Object
        },
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
        userName: {
            type: String,
            required: true
        }
    },

    data: function(){
        return {
            currentPhase: 'showRules',
            showChosenParticipantNoAnswer: false,

            lang: sessionStorage.getItem("lang") || "en",
            questions: [],
            countdown:null,
            countdownProgress: 100,
            currentQuestion: 0,

            participants: {}, 
            chosenParticipant: null,
            correctAnswer: null,
            correctParticipants: []
        }
    },
    created: function() {
        //this.socket = io("localhost:3000"); // Initialize component-specific socket
        this.socket.emit('joinSocketRoom', this.gamePin);

        this.socket.on('roundUpdate', (ThisOrThat) => {
            // console.log("XXXXX Recieving roundUpdate in gamePin: ", this.gamePin, " with ThisOrThat: ", ThisOrThat)
            this.roundUpdate(ThisOrThat)});
            this.socket.on("nextRound", (nextQuestion, chosenParticipant) => {
            console.log("--> socket.on(nextRound) with nextQuestion:", nextQuestion, " and chosenParticipant:", chosenParticipant)
            this.startRound(nextQuestion, chosenParticipant)
        });
            
        this.setupGame();
    },
    methods: {
        setupGame: function() {
            this.socket.on('getQuestions_ThisOrThat', questions => this.questions = questions);
            this.socket.on('setup_ThisOrThat', (ThisOrThat) => {
                this.participants = ThisOrThat.participants;
                this.chosenParticipant = ThisOrThat.chosenParticipant;
            });
            this.socket.emit('setup_ThisOrThat', this.gamePin, this.lang);
        },
        displayRules() {
            this.startCountdown(30, "rules")
        },
        startRound(nextQuestion, chosenParticipant) {
            console.log("--> startRound with nextQuestion:", nextQuestion, " and chosenParticipant:", chosenParticipant)
            // If out of sync, this will clear the old progress bar.
            clearInterval(this.countdown);

            this.showChosenParticipantNoAnswer = false;
            this.chosenParticipant = chosenParticipant;
            this.currentQuestion = nextQuestion;
            console.log("--> inside startRound with this.questions.questions=", this.questions.questions)

            if(this.currentQuestion < this.questions.questions.length){
                
                this.socket.emit("startRound", this.gamePin);
                this.currentPhase = 'showChosenParticipant'
                this.startCountdown(5, "participant");
            }
            else{
                this.startCountdown(30, "finalResults")
                this.currentPhase = 'showFinalResults'
            };
        },
        roundUpdate(ThisOrThat){
            this.participants = ThisOrThat.participants;

            // If chosenParticipant didn't answer.
            if(!ThisOrThat.correctAnswers[this.currentQuestion]){ 
                console.log("---> Chosen participant didn't answer")
                this.showChosenParticipantNoAnswer = true;
                this.correctParticipants = [];
            }
            else {
                this.correctAnswer = ThisOrThat.correctAnswers[this.currentQuestion]; 
                this.setCorrectParticipants();
            };
            console.log("roundUpdate: ", ThisOrThat);
        },
        startCountdown(duration, phase) {
            const updateInterval = 100; 
            let remainingTime = duration * 1000; 
            const totalTime = remainingTime; 

            this.countdown = setInterval(() => {
                const progress = (remainingTime / totalTime) * 100;
                this.countdownProgress = progress;
                
                if (remainingTime <= 0) {
                    clearInterval(this.countdown);
                    this.transitionPhase(phase); 
                }
                remainingTime -= updateInterval; 
            }, updateInterval); 
        },
        transitionPhase(currentPhase) {
            if (currentPhase === "rules"){
                this.showRules = false;
                this.startRound(this.currentQuestion, this.chosenParticipant)
            }
            else if (currentPhase === "participant") {
                this.currentPhase = 'showQuestion';
                this.startCountdown(15, "question");
            } 
            else if (currentPhase === "question") {
                console.log("About to show answers with this.questions.questions =", this.questions.questions)
                this.currentPhase = 'showAnswer';
                this.startCountdown(10, "answer");
            }
            else if (currentPhase === "finalResults"){
                this.$emit('gameCompleted');
            }
        },
        onAnswer(answerData) { 
            // TODO: Just nu används inte questionId! /sebbe
            this.socket.emit('answer_ThisOrThat', this.gamePin, this.userName, answerData.answerId)
            console.log("User: ", this.userName, "just answered");
        },
        setCorrectParticipants: function() {
            const correctParticipants = [];

            for(let [key, value] of Object.entries(this.participants)){
                console.log("---> inside setCorrectParticipants for-loop with key: ", key, ", value: ", value, ", currentQuestion:", this.currentQuestion, ", correctAnswer: ", this.correctAnswer);
                if(value.answers[this.currentQuestion] && value.answers[this.currentQuestion] === this.correctAnswer){ 
                    correctParticipants.push(key);
                    console.log("---> added participant: ", key, "to correctParticipants: ", correctParticipants);
                }
            }
            this.correctParticipants = correctParticipants;
        },
        // dismantleSocket(){
        //     console.log("-->before if-statement in dismantleSocket in ThisOrThatComponent")
        //     if (this.socket) {
        //         console.log("--> Cleaning up socket in ThisOrThatComponent");

        //         // Remove listeners
        //         this.socket.off("roundUpdate");
        //         this.socket.off("nextRound");
        //         this.socket.off("getQuestions_ThisOrThat");
        //         this.socket.off("setup_ThisOrThat");

        //         // Emit leave and disconnect
        //         this.socket.emit("leaveSocketRoom", this.gamePin);
        //         this.socket.disconnect();
        //         this.socket = null;
        //     }else console.log("this.socket does not exist in ThisOrThatComponent")
        // }
    },
    mounted() {
        this.displayRules();
    },
    // beforeDestroy() {
    // this.dismantleSocket();
    // },
    // beforeRouteLeave(to, from, next) {
    // this.dismantleSocket()
    // next();
    // },
    // deactivated() {
    //     console.log("Component deactivated... Cleaning up!");
    //     this.dismantleSocket();
    // },
}

</script>

<style scoped>
/* Countdown Bar */
.countdown-bar {
  width: 100%;
  height: 8px;
  background-color: #ddd;
  position: relative;
  margin-top: 15px;
  border-radius: 5px;
}

.progress {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.2s ease;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
}

/* No Answer Message */
h2.no-answer-message {
  font-size: 1.25rem;
  color: rgb(132, 0, 0);
  font-weight: bold;
}

/* Highlighted Correct Participant */
.correctParticipant {
  font-weight: bold;
  color: #2d6a4f; /* Green color for correct participants */
}

/* General text styling */
p {
  font-size: 1rem;
  color: #333;
}
</style>

