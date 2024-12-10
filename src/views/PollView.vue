<template>
<Nav :hideNav="false" 
      :uiLabels="uiLabels" 
      :lang="lang"
      @language-changed="handleLanguageChange">
    </Nav>
  <div>

    <h1>{{uiLabels.Welcome}}</h1>
    {{pollId}}
    <QuestionComponent v-bind:question="question"
              v-on:answer="submitAnswer($event)"/>
    <hr>
    <span>{{submittedAnswers}}</span>


  </div>
</template>

<script>
// @ is an alias to /src
import Nav from '@/components/ResponsiveNav.vue'
import QuestionComponent from '@/components/QuestionComponent.vue';
import io from 'socket.io-client';

const socket = io("localhost:3000");

export default {
  name: 'PollView',
  components: {
    QuestionComponent, 
    Nav,
  },
  data: function () {
    return {
      Welcome: "Welcome to the poll!",
      question: {
        q: "",
        a: []
      },
      pollId: "inactive poll",
      submittedAnswers: {},
      uiLabels: {},
      lang: localStorage.getItem("lang") || "en",
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
    },
    handleLanguageChange(newLang) {
      this.lang = newLang;
      localStorage.setItem("lang", newLang);
      socket.emit("getUILabels", this.lang);
    }
  }
}
</script>



<style scoped>
h1 {
  margin-top: 0;
  color: black;
}
</style>