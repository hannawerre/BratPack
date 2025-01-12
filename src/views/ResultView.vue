<template>
    <Nav :hideNav="false"
  :uiLabels="uiLabels"
  :lang="lang"
  @language-changed="handleLanguageChange">
  </Nav>

  <div>
    lang: {{ lang }}
    {{ question.q }}
  </div>
  <BarsComponent v-bind:labels="question.a" v-bind:data="submittedAnswers"/>

  <span>{{ submittedAnswers }}</span>
</template>

<script>
// @ is an alias to /src
import Nav from '@/components/ResponsiveNav.vue'
import BarsComponent from '@/components/BarsComponent.vue';
import io from 'socket.io-client';
const socket = io("ws://localhost:3000");

export default {
  name: 'ResultView',
  components: {
    BarsComponent,
    Nav
  },
  data: function () {
    return {
      lang: sessionStorage.getItem("lang") || "en",
      pollId: "",
      question: "",
      submittedAnswers: {},
      uiLabels: {},
    }
    
  },
  created: function () {
    this.pollId = this.$route.params.id
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.on("submittedAnswersUpdate", update => this.submittedAnswers = update);
    socket.on("questionUpdate", update => this.question = update );
    socket.emit( "getUILabels", this.lang );
    socket.emit( "joinPoll", this.pollId );
  },
  methods: {
    handleLanguageChange(newLang) {
      this.lang = newLang;
      sessionStorage.setItem("lang", newLang);
      socket.emit("getUILabels", this.lang);
    }
  }
}
</script>
