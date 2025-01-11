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
        <h2 v-if="showChosenParticipantNoAnswer">Chosen Participant {{ this.chosenParticipant }} didn't answer</h2>
        <h2 v-else>Correct Answer: {{ questions.questions[currentQuestion].answers[correctAnswer-1].answer }}</h2>

      <!-- Display all participants and highlight those who got it right -->
      <div v-for="[key,value] in Object.entries(participants)" :key="key">
        <p v-if="correctParticipants.includes(key)" class="correctParticipant">Correct!: {{ key }}: {{ value.points }}</p>
        <p v-else>{{ key }}: {{ value.points }}</p>
      </div>
      <div class="countdown-bar">
        <div class="progress" :style="{ width: countdownProgress + '%' }"></div>
      </div>
    </div>

    <!-- Game Phase 4: Display Final Results -->
    <div v-if="currentPhase === 'showFinalResults'">
        <h2>Final results</h2>
        <div v-for="[key,value] in Object.entries(participants)" :key="key">
        <p>{{ key }}: {{ value.points }}</p>
      </div>
    </div>
    
  </div>
</template>

<script>
import QuestionComponent from './QuestionComponent.vue';
const socket = io("localhost:3000");
import io from 'socket.io-client'; 

export default {
    name: 'ThisOrThatComponent',
    components: {
        QuestionComponent
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
        userName: {
            type: String,
            required: true
        }
    },

    data: function(){
        return {
            currentPhase: 'showRules',
            showChosenParticipantNoAnswer: false,

            lang: localStorage.getItem("lang") || "en",
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
        socket.emit('joinSocketRoom', this.gamePin);

        socket.on('roundUpdate', (ThisOrThat) => this.roundUpdate(ThisOrThat));
        socket.on("nextRound", (nextQuestion, chosenParticipant) => {
            console.log("--> socket.on(nextRound) with nextQuestion:", nextQuestion, " and chosenParticipant:", chosenParticipant)
            this.startRound(nextQuestion, chosenParticipant)
        });
            
        this.setupGame();
    },
    methods: {
        setupGame: function() {
            socket.on('getQuestions_ThisOrThat', questions => this.questions = questions);
            socket.on('setup_ThisOrThat', (ThisOrThat) => {
                this.participants = ThisOrThat.participants;
                this.chosenParticipant = ThisOrThat.chosenParticipant;
            });
            socket.emit('setup_ThisOrThat', this.gamePin, this.lang);
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
                
                socket.emit("startRound", this.gamePin);
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
            socket.emit('answer_ThisOrThat', this.gamePin, this.userName, answerData.answerId)
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
        }
    },
    mounted() {
        this.displayRules();
    }
}

</script>

<style>
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

/* Doesn't work at the moment */
.correctParticipant {
    text-decoration: underline;
    text-decoration-color: green;
}
</style>