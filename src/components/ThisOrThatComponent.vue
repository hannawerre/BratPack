<template>
    <div>
    <!-- Rules -->
    <div v-if="currentPhase === 'showRules'">
        <!-- TODO: Fixa så regler syns i rätt språk. -->
         <h3>{{ uiLabels.ThisOrThat.rules1 }}</h3>
         <h3>{{ uiLabels.ThisOrThat.rules2 }}</h3>
         <h3>{{ uiLabels.ThisOrThat.rules3 }}</h3>
        <div class="countdown-bar">
        <div class="progress" :style="{ width: countdownProgress + '%' }"></div>
      </div>
    </div>

    <!-- Game Phase 1: Display Chosen Participant -->
    <div v-if="currentPhase === 'showChosenParticipant'">
      <h2>{{ uiLabels.ThisOrThat.chosenParticipant }}: {{ chosenParticipant }}</h2>
      <div class="countdown-bar">
        <div class="progress" :style="{ width: countdownProgress + '%' }"></div>
      </div>
    </div>

    <!-- Game Phase 2: Display Question -->
    <div v-if="currentPhase === 'showQuestion'">
        <h2>{{ uiLabels.ThisOrThat.chosenParticipant }}: {{ chosenParticipant }}</h2>
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
      {{ uiLabels.ThisOrThat.chosenParticipant }} {{ this.chosenParticipant }} {{ uiLabels.ThisOrThat.didntAnswer }}
    </h2>
    <h2 v-else class="correct-answer-message">
      {{ uiLabels.ThisOrThat.correctAnswer }}: {{ questions.questions[currentQuestion].answers[correctAnswer-1].answer }}
    </h2>

    <!-- Countdown Bar -->
    <div class="countdown-bar">
      <div class="progress" :style="{ width: countdownProgress + '%' }"></div>
    </div>
  </div>

  <!-- Game Phase 4: Display Final Results -->
  <div v-if="currentPhase === 'showFinalResults'" class="final-results">
    <h2>{{ uiLabels.ThisOrThat.finalResults }}</h2>
    <!-- Countdown Bar -->
    <div class="countdown-bar">
      <div class="progress" :style="{ width: countdownProgress + '%' }"></div>
    </div>
  </div>
    
  </div>
</template>

<script>
import QuestionComponent from './QuestionComponent.vue';

export default {
    name: 'ThisOrThatComponent',
    components: {
        QuestionComponent
    },

    props: {
        socket: {
            type: Object
        },
        lang: {
            type: String
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
        this.socket.emit('joinSocketRoom', this.gamePin);

        this.socket.on('roundUpdate', (ThisOrThat) => {

            this.roundUpdate(ThisOrThat)});
            this.socket.on("nextRound", (nextQuestion, chosenParticipant) => {
            
            this.startRound(nextQuestion, chosenParticipant)
        });
            
        this.setupGame();
    },
    methods: {
        setupGame: function() {
            this.socket.on('getQuestions', questions => this.questions = questions);
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

            // If out of sync, this will clear the old progress bar.
            clearInterval(this.countdown);

            this.showChosenParticipantNoAnswer = false;
            this.chosenParticipant = chosenParticipant;
            this.currentQuestion = nextQuestion;

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
            
            this.socket.emit('answer_ThisOrThat', this.gamePin, this.userName, answerData.answerId)
            console.log("User: ", this.userName, "just answered");
        },
        setCorrectParticipants: function() {
            const correctParticipants = [];

            for(let [key, value] of Object.entries(this.participants)){

                if(value.answers[this.currentQuestion] && value.answers[this.currentQuestion] === this.correctAnswer){ 
                    correctParticipants.push(key);
                }
            }
            this.correctParticipants = correctParticipants;
        },
    },
    mounted() {
        this.displayRules();
    },
    unmounted(){
      if(this.countdown){
        clearInterval(this.countdown);
      }
      this.socket.off('roundUpdate');
      this.socket.off('nextRound');
    }
    
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
  color: rgb(192, 0, 0);
  font-weight: bold;
}

/* General text styling */
p {
  font-size: 1rem;
  color: #333;
}
</style>

