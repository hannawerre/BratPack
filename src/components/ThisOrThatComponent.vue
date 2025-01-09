<template>
    <!-- <div>
        <p>Chosen Participant: {{ this.chosenParticipant }}, answer: {{ this.correctAnswer }}</p>
        <br>
        <p>Current question: {{currentQuestion}}</p>
        <br>
        <p>Participants: {{ this.participants }}</p>
  </div> -->
  

    <div>
    <!-- Rules -->
    <div v-if="showRules">
        <!-- TODO: Fixa så regler syns i rätt språk. -->
         <h2>Rules</h2>
         <br>
         <h3>One participant will be chosen for each round</h3>
         <h3>The task is to pick the same answer as the chosen one</h3>
         <br>
         <h3>How well do you know your fellow mates?</h3>
        <div class="countdown-bar">
        <div class="progress" :style="{ width: countdownProgress + '%' }"></div>
      </div>
    </div>

    <!-- Game Phase 1: Display Chosen Participant -->
    <div v-if="showChosenParticipant">
      <h2>Chosen participant: {{ chosenParticipant }}</h2>
      <div class="countdown-bar">
        <div class="progress" :style="{ width: countdownProgress + '%' }"></div>
      </div>
    </div>

    <!-- Game Phase 2: Display Question -->
    <div v-if="showQuestion">
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
    <div v-if="showAnswer">
        <p>testmest</p>
        <!-- If chosenParticipant didn't answer -->
        <h2 v-if="showChosenParticipantNoAnswer">Chosen Participant {{ this.chosenParticipant }} didn't answer</h2>
        <h2 v-else>Correct Answer: {{ questions.questions[currentQuestion-1].answers[correctAnswer-1].answer }}</h2>

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
    <div v-if="showFinalResults">
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
    name: 'GeneralQuizComponent',
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
            showRules: true,
            showChosenParticipant: false,
            showQuestion: false,
            showAnswer: false,
            showChosenParticipantNoAnswer: false,
            showFinalResults: false,

            lang: localStorage.getItem("lang") || "en",
            questions: [],
            countdownProgress: 100,
            currentQuestion: 0,
            participants: {}, //Name and score in this manner: [{name: sebbe, points: 0}, {...}, ...]
            myAnswers: [],
            chosenParticipant: null,
            correctAnswer: null,
            correctParticipants: []
        }
    },
    created: function() {
        socket.emit('joinSocketRoom', this.gamePin);
        socket.on('getParticipants', ThisOrThat => { // Hoppas denna listener inte krockar med emits från andra spel...
            this.participants = ThisOrThat.participants;
            this.chosenParticipant = ThisOrThat.chosenParticipant;
            console.log("Updated participants to: ", this.participants);
            console.log("Updated chosenParticipant to: ", this.chosenParticipant);
        });
        socket.on("chosenParticipantAnswer", answer => this.correctAnswer = answer);
        socket.on("newChosenParticipant", participant => this.chosenParticipant = participant)

        socket.on('roundUpdate', (ThisOrThat) => this.roundUpdate(ThisOrThat));
        socket.on("nextRound", ()=> this.startRound());
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
        startRound() {
            this.showQuestion = false;
            this.showAnswer = false;
            this.showChosenParticipantNoAnswer = false;
            console.log("--> inside startRound with this.questions.questions=", this.questions.questions)
            if(this.currentQuestion < this.questions.questions.length){
                socket.emit("startRound", this.gamePin);
                this.showChosenParticipant = true;
                this.startCountdown(5, "participant");
            }
            else{
                this.startCountdown(30, "finalResults")
                this.showFinalResults = true;
            };
        },
        roundUpdate(ThisOrThat){
            this.participants = ThisOrThat.participants;
            this.chosenParticipant = ThisOrThat.chosenParticipant;

            // If chosenParticipant didn't answer.
            if(!ThisOrThat.correctAnswers[this.currentQuestion]){ 
                console.log("---> Chosen participant didn't answer")
                this.showChosenParticipantNoAnswer = true;
                this.correctParticipants = [];
            }
            else {
                // TODO: display the correct answer texxt
                this.correctAnswer = ThisOrThat.correctAnswers[this.currentQuestion]; // Correct answer for last question
                this.setCorrectParticipants();
            };
            this.currentQuestion = ThisOrThat.currentQuestion; // Next question
            console.log("roundUpdate: ", ThisOrThat);
        },
        startCountdown(duration, phase) {
            const updateInterval = 100; 
            let remainingTime = duration * 1000; 
            const totalTime = remainingTime; 

            const interval = setInterval(() => {
                const progress = (remainingTime / totalTime) * 100;
                this.countdownProgress = progress;
                if (remainingTime <= 0) {
                    clearInterval(interval);
                    this.transitionPhase(phase); 
                }
                remainingTime -= updateInterval; 
            }, updateInterval); 
        },
        transitionPhase(currentPhase) {
            if (currentPhase === "rules"){
                this.showRules = false;
                this.startRound()
            }
            else if (currentPhase === "participant") {
                this.showChosenParticipant = false;
                this.showQuestion = true;
                this.startCountdown(15, "question");
            } else if (currentPhase === "question") {
                this.showQuestion = false;
                this.showAnswer = true;
                this.startCountdown(10, "answer");
            }
        },
        revealCorrectAnswer() {
            this.correctAnswer = "Pizza"; 
            this.numCorrect = 69; 
        },
        newChosenParticipant: function() {
            // Returns a random number between 0 and the amount of players-1. 
            // Since the participants array is the same for everyone, the same participant will be chosen for everyone.
            socket.emit("newChosenParticipant", this.gamePin);
        },
        startGame: function(){
            socket.emit("startGame_ThisOrThat", this.gamePin)
        },
        updateGame: function(){ //test
            socket.emit('requestGameData', this.gamePin)
        },
        onAnswer(answerData) { 
            // TODO: Just nu används inte questionId! /sebbe
            socket.emit('answer_ThisOrThat', this.gamePin, this.userName, answerData.answerId)
            console.log("User: ", this.userName, "just answered");
        },
        // TODO: Denna används inte
        correctQuestion(){
            socket.emit("correctQuestion_ThisOrThat", this.gamePin, this.currentQuestion);
            this.currentQuestion+=1;
        },
        // TODO: Denna används inte
        chosenParticipantAnswer: function(answer) {
            socket.emit("chosenParticipantAnswer", answer, this.gamePin);
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