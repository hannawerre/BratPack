<template>
<p>{{question.q}}</p>
<button v-for="a in question.a" v-on:click="answer(a)" v-bind:key="a">
  {{ a }}
</button>
</template>
<script>
export default {
  name: 'QuestionComponent',
  props: {
    question: Object
  },
  emits: ["answer"],
  methods: {
    answer: function (answer) {
      this.$emit("answer", answer);
    } 
  }
}
</script>

<style scoped>
button{
  color: white;
  font-size: 16px;
  background-color: black;
  min-width: 30px;
  min-height: 30px;
  margin: 5px;

}
button:hover {
  background-color: rgb(90, 90, 240);
}

</style>