<template>
  <div>
    {{pollId}}
    <QuestionComponent v-bind:question="question"
              v-on:answer="submitAnswer($event)"/>
    <hr>
    <span>{{submittedAnswers}}</span>

    <hr>
    <TimerComponent />
    <hr/>
  </div>
</template>

<script>
// @ is an alias to /src
import QuestionComponent from '@/components/QuestionComponent.vue';
import io from 'socket.io-client';
import TimerComponent from '../components/TimerComponent.vue';
const socket = io("localhost:3000");

export default {
  name: 'PollView',
  components: {
    QuestionComponent,
    TimerComponent
    
  },
  data: function () {
    return {
      question: {
        q: "",
        a: []
      },
      pollId: "inactive poll",
      submittedAnswers: {}
    }
  },
  created: function () {
    this.pollId = this.$route.params.id;
    socket.on( "questionUpdate", q => this.question = q );
    socket.on( "submittedAnswersUpdate", answers => this.submittedAnswers = answers );
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.emit( "getUILabels", this.lang );
    socket.emit( "joinPoll", this.pollId );
  },
  methods: {
    submitAnswer: function (answer) {
      socket.emit("submitAnswer", {pollId: this.pollId, answer: answer})
    }
  }
}
</script>
