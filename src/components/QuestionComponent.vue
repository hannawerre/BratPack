<template>
  <div>
    <h3>{{ question.question }}</h3>
    <ul>
      <li v-for="answerObj in question.answers" :key="answerObj.id">
        <button @click="answer(question.id, answerObj)">
          {{ answerObj.answer }}
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
    answer(questionId, answerObj) {
      // Skicka ett objekt med all nödvändig data
      this.$emit("answer", {
        questionId: questionId,
        answerId: answerObj.id,
        isCorrect: answerObj.isCorrect,
        answerText: answerObj.answer
      });
    }
  }
};
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