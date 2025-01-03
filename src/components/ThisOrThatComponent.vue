<template>
    <div>
        <p>Chosen Participant: {{ this.chosenParticipant }}, answer: {{ this.correctAnswer }}</p>
        <button @click="beginGame()">Begin Game</button>
        <button @click="updateGame()">Update</button>
        <br>
        <p>Current question: {{currentQuestion}}</p>
        <button @click="correctQuestion()">Correct question</button>
        <p>Participants: {{ this.participants }}</p>
  </div>
  

    <div>
    <!-- Rules -->
    <div v-if="showRules">
        TODO: Fixa så regler syns i rätt språk.
        <div class="countdown-bar">
        <div class="progress" :style="{ width: countdownProgress + '%' }"></div>
      </div>
    </div>
    <!-- Phase 1: Display Chosen Participant -->
    <div v-if="showParticipant">
      <h2>Chosen participant: {{ chosenParticipant }}</h2>
      <div class="countdown-bar">
        <div class="progress" :style="{ width: countdownProgress + '%' }"></div>
      </div>
    </div>

    <!-- Phase 2: Display Question -->
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

    <!-- Phase 3: Display Correct Answer -->
    <div v-if="showAnswer">
      <h2>Correct Answer: {{ correctAnswer }}</h2>
      <p>{{ numCorrect }} participants got it correct!</p>
      <div class="countdown-bar">
        <div class="progress" :style="{ width: countdownProgress + '%' }"></div>
      </div>
    </div>
    
  </div>

    <!-- <div v-if="displayQuestion">
        <QuestionComponent
            v-if="questions?.questions?.[currentQuestion]"
            :question="questions.questions[currentQuestion]"
            @answer="onAnswer"
        />
    </div>
    <div v-else>
        hejsan
    </div> -->
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
            lang: localStorage.getItem("lang") || "en",
            questions: [],
            countdownProgress: 100,
            currentQuestion: 0,
            displayQuestion: false, // ta bort
            participants: {}, //Name and score in this manner: [{name: sebbe, points: 0}, {...}, ...]
            myAnswers: [],
            chosenParticipant: null,
            correctAnswer: null,
            numCorrect:21
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
        socket.on('roundUpdate', (ThisOrThat) => {
            this.participants = ThisOrThat.participants;
            this.chosenParticipant = ThisOrThat.chosenParticipant;
            // TODO: display the correct answer texxt
            this.correctAnswer = ThisOrThat.correctAnswers[this.currentQuestion]; // Correct answer for previous question
            this.currentQuestion = ThisOrThat.currentQuestion; // Next question
            console.log("roundUpdate: ", ThisOrThat);
        });
        socket.on("nextRound", ()=> {
            this.startRound();
        })
        this.setupGame();
    },
    methods: {
        setupGame: function() {
            socket.on('getQuestions_ThisOrThat', questions => this.questions = questions);
            socket.on('setup_ThisOrThat', (ThisOrThat) => {
                this.participants = ThisOrThat.participants;
                this.chosenParticipant = ThisOrThat.chosenParticipant;
            })
            socket.emit('setup_ThisOrThat', this.gamePin, this.lang);
        },
        displayRules() {
            this.startCountdown(30, "rules")
        },
        startRound() {
            socket.emit("startRound", this.gamePin);
            this.showParticipant = true;
            this.showQuestion = false;
            this.showAnswer = false;
            this.startCountdown(5, "participant");
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
                this.showParticipant = false;
                this.showQuestion = true;
                this.startCountdown(15, "question");
            } else if (currentPhase === "question") {
                this.showQuestion = false;
                this.showAnswer = true;
                //this.revealCorrectAnswer();
                this.startCountdown(10, "answer");
            }
        },
        revealCorrectAnswer() {
            this.correctAnswer = "Pizza"; // Replace with actual logic
            this.numCorrect = 69; // Replace with actual logic
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
        onAnswer(questionId, answerId) { 
            // TODO: Just nu används inte questionId! /sebbe
            socket.emit('answer_ThisOrThat', this.gamePin, this.userName, answerId)
            console.log("User: ", this.userName, "just answered");
        },
        correctQuestion(){
            socket.emit("correctQuestion_ThisOrThat", this.gamePin, this.currentQuestion);
            this.currentQuestion+=1;
        },
        chosenParticipantAnswer: function(answer) {
            socket.emit("chosenParticipantAnswer", answer, this.gamePin);
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
</style>