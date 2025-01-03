<template>
  <div>
    <h3>{{ question.question }} (ID: {{ question.id }})</h3>
    <ul>
      <li v-for="answerObj in question.answers" :key="answerObj.id">
        <!-- Här visar vi alla variabler: id, answer, isCorrect -->
        <button @click="answer(question.id, answerObj.id)">
          {{ answerObj.id }}: {{ answerObj.answer }} - Correct: {{ answerObj.isCorrect }}
        </button>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'QuestionComponent',
  props: {
    question: {
      type: Object,
      required: true
    }
  },
  emits: ["answer"],
  methods: {
    answer: function (questionId, answerId) {
      this.$emit("answer", questionId, answerId);
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