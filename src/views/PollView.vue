<template>
<<<<<<< HEAD
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
=======
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
>>>>>>> cf3d38646ce55796d98a1f283b33315edbdaf6da
  </template>
  
  <script>
  // @ is an alias to /src
  import Nav from '@/components/ResponsiveNav.vue'
  import QuestionComponent from '@/components/QuestionComponent.vue';
  import io from 'socket.io-client';
  
  const socket = io("localhost:3000");
  
  export default {
<<<<<<< HEAD
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
  hasAnswerd: false,
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
  
  if (this.hasAnswerd) {
  alert("You have already answered this question")
  return;
  }
  this.hasAnswerd = true;
  socket.emit("submitAnswer", {pollId: this.pollId, answer: answer})
  },
  handleLanguageChange(newLang) {
  this.lang = newLang;
  localStorage.setItem("lang", newLang);
  socket.emit("getUILabels", this.lang);
  }
  }
  }
=======
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
        lang: sessionStorage.getItem("lang") || "en",
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
        sessionStorage.setItem("lang", newLang);
        socket.emit("getUILabels", this.lang);
      }
    }
  }
>>>>>>> cf3d38646ce55796d98a1f283b33315edbdaf6da
  </script>
  
  
  
  <style scoped>
  h1 {
<<<<<<< HEAD
  margin-top: 0;
  color: black;
=======
    margin-top: 0;
    color: black;
>>>>>>> cf3d38646ce55796d98a1f283b33315edbdaf6da
  }
  </style>