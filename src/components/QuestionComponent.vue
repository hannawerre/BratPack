<template>
  <div>
    <h3>{{ question.question }}</h3>
    <ul>
      <li
        v-for="answerObj in question.answers"
        :key="answerObj.id"
        :class="{ selected: selectedAnswer === answerObj.id, dimmed: selectedAnswer && selectedAnswer !== answerObj.id }"
      >
        <button
          :disabled="!!selectedAnswer" 
          @click="selectAnswer(question.id, answerObj)"
        >
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
  data() {
    return {
      selectedAnswer: null 
    };
  },
  emits: ["answer"],
  methods: {
  selectAnswer(questionId, answerObj) {
    if (!this.selectedAnswer) {
      this.selectedAnswer = answerObj.id; 
      
      const answerEvent = {
        questionId: questionId,
        answerId: answerObj.id,
      };
      if (answerObj.hasOwnProperty('isCorrect')) {
        answerEvent.isCorrect = answerObj.isCorrect;
      }
      this.$emit("answer", answerEvent);
    }
  }
}
};
</script>



<style scoped>
ul {
  list-style: none; 
  padding: 0; 
  display: flex;
  flex-wrap: wrap; 
  justify-content: center; 
  gap: 10px; 
}

li.answer-option {
  flex: 1 1 calc(33.333% - 20px); 
  display: flex;
  justify-content: center;
}

li.answer-option:nth-child(4n), 
li.answer-option:nth-child(4n-1),
li.answer-option:nth-child(4n-2),
li.answer-option:nth-child(4n-3) {
  flex: 1 1 calc(50% - 20px);
}

button {
  color: white;
  font-size: 18px;
  background: linear-gradient(45deg, #ff8c42, #da6822); /* --our-orange till --border-orange */
  border: none;
  border-radius: 10px; 
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

button:hover {
  background: linear-gradient(45deg, #ffad66, #ff8c42); /* Ljusare orange till --our-orange */
  transform: translateY(-3px);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
}

button:active {
  transform: translateY(2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.selected button {
  background: linear-gradient(45deg, #da6822, #b5511a); /* --border-orange till en mörkare nyans */
  transform: scale(1.1);
  color: white;
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
}

.dimmed button {
  background: linear-gradient(45deg, #ff8c42, #b5511a); /* --our-orange till en mörkare nyans */
  opacity: 0.6;
  pointer-events: none;
}

</style>