<template>
  <div>
    <h3>{{ question.question }} (ID: {{ question.id }})</h3>
    <ul>
      <li v-for="answerObj in question.answers" :key="answerObj.id">
        <!-- Här visar vi alla variabler: id, answer, isCorrect -->
        <button @click="answer(answerObj)">
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
    answer: function (answerObj) {
      this.$emit("answer", answerObj);
    } 
  }
}
</script>


<style scoped>
button{
  color: white;
  font-size: 16px;
  background-color: var(--our-orange);
  min-width: 30px;
  min-height: 30px;
  margin: 5px;

}
button:hover {
  background-color: var(--border-orange);
}

</style>