<template>
  <div>
    <h3 class="question-text">{{ question.question }}</h3>
    <ul>
      <li
      class="answer-option"
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
        answerText: answerObj.answer
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
.container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
  justify-content: center;
}

ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center; 
  gap: 10px; 
  max-width: 400px;  
  margin: 0 auto; 
}
.question-text {
  font-size: 2rem; /* Gör texten större */
  font-weight: bold; /* Lägg till fetstil */
  text-align: center; /* Centrera texten */
  margin: 20px 0; /* Lägg till mellanrum runt texten */
  color: black; /* Välj en färg som passar designen */
}




li.answer-option {
  flex: 1 1 calc(50% - 20px); 
  max-width: calc(50% - 20px); 
  display: flex;
  justify-content: center; 
}

/* Anpassning för exakt fyra knappar */
ul:has(li:nth-child(4)) li.answer-option {
  flex: 1 1 calc(50% - 20px); 
  max-width: calc(50% - 20px);
}

/* Anpassning för färre än fyra knappar */
ul:not(:has(li:nth-child(4))) li.answer-option {
  flex: 1 1 calc(50% - 20px); 
  max-width: calc(50% - 20px);
}

/* Anpassning för små skärmar */
@media (max-width: 480px) {
  ul {
    max-width: 100%; 
  }

  li.answer-option {
    flex: 1 1 100%; 
    max-width: 100%;
  }



  .question-text {
    font-size: 1.5rem; /* Mindre textstorlek för små skärmar */
  }


}

button {
  color: white;
  font-size: 18px;
  background: var(--gradient-darkOrange);
  border: none;
  border-radius: 10px; 
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

button:hover {
  background: var(--gradient-lightOrange); 
  transform: translateY(-3px);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
}

button:active {
  transform: translateY(2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.selected button {
  background: linear-gradient(45deg, #da6822, #b5511a); 
  transform: scale(1.1);
  color: white;
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
}

.dimmed button {
  background: linear-gradient(45deg, #ff8c42, #b5511a); 
  opacity: 0.6;
  pointer-events: none;
}

@media screen and (max-width: 768px) {
  button {
    font-size: 16px;
    padding: 8px 16px;
  }
  
}

</style>