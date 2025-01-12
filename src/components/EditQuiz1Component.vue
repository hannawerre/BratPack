<template>
    <div v-if="isModalOpen" class="modal-background" @click.self="closeModal">
      <div v-if="isModalOpen" class="modal-wrapper" @click.self="closeModal">
        <div class="questions-list" @click.stop>
          <h2>Questions</h2>
          <ul>
  <li v-for="(question, index) in savedQuestions" :key="index" class="question-item">
    <div class="question-container">
      <!-- Left side: Question and answers -->
      <div class="question-details">
        <strong class="question-title">Q{{ index + 1 }}: {{ question.question }}</strong>
        <ul>
          <li v-for="(answer, i) in question.answers" :key="i" class="answer-item">
            {{ answer.answer }} 
            <span v-if="answer.isCorrect">(Correct)</span>
          </li>
        </ul>
      </div>

      <!-- Right side: Remove button -->
      <button 
        @click="removeQuestion(index)" 
        class="remove-button" 
        title="Remove this question">
        &times;
      </button>
    </div>
  </li>
</ul>
        </div>
  
        <div class="modal-content" @click.stop>
          <h1>Edit {{ GameName }}</h1>
          <p>Here you can add questions to the game</p>
          <br />
          <div class="radio-buttons-container">
            <label>
                <input 
                type="radio"
                :value="false"
                v-model="useCustomQuestions"
                />
                Use standard questions
            </label>
            <label>
                <input 
                type="radio"
                :value="true"
                v-model="useCustomQuestions"
                />
                Use own questions
            </label>
            </div>
          <br />
  
          <p>Add question</p>
          <input 
            v-model="question" 
            placeholder="Add question" 
            class="question"
          />
  
          <div v-for="(alt, index) in alternatives" :key="index" class="alternative-row">
            <input
              v-model="alt.text"
              :placeholder="`Alternative`"
            />
            <input
              type="checkbox"
              v-model="alt.isCorrect"
              :id="`check-${index}`"
            />
            <label :for="`check-${index}`">Correct</label>
          </div>
  
          <button @click="addAlternative" id="alternatative-button">
            Add alternative
          </button>
          <button @click="saveQuestion" id="save-button">
            Save question
          </button>
          <button @click="closeModal" id="close-button">
            Close
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, defineProps, defineExpose, defineEmits } from 'vue';
  
  const props = defineProps({
    GameName: String
  });
  
  const emit = defineEmits([
    "modal-opened",
    "modal-closed",
    "questions-saved-generalQuiz"
]);
    
    const isModalOpen = ref(false);

    const useCustomQuestions = ref(false);

    const question = ref("");
    const alternatives = ref([
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
]);

    const savedQuestions = ref([]);

    const addAlternative = () => {
    if (alternatives.value.length >= 4) {
        return;
    }
    console.log("Adding alternative");
    alternatives.value.push({ text: "", isCorrect: false });
  };

    const openModal = () => {
        isModalOpen.value = true;
        emit('modal-opened');
    };

    const saveQuestion = () => {

        if (question.value.trim() !== "") {
        const hasCorrectAnswer = alternatives.value.some((alt) => alt.isCorrect);

        // Check if at least two alternatives have text
        const nonEmptyAlternatives = alternatives.value.filter((alt) => alt.text.trim() !== "");

        if (nonEmptyAlternatives.length < 2) {
          console.error("At least two alternatives must have text.");
          alert("Please provide at least two alternatives with text.");
          return;
        }

        if (!hasCorrectAnswer) {
          console.error("At least one alternative must be marked as correct.");
          alert("Please mark at least one alternative as correct.");
          return;
        }

      
        
        
            const newQuestionId = savedQuestions.value.length + 1;
            
            const newQuestionObj = {
                id: newQuestionId,
                question: question.value, 
                answers: alternatives.value.map((alt, index) => ({
                    id: index + 1,
                    answer: alt.text,
                    isCorrect: alt.isCorrect
                }))
            };

        savedQuestions.value.push(newQuestionObj);
        console.log("Currently saved questions:", savedQuestions.value);

        question.value = "";
        alternatives.value = [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            ];
    };
    };
    const removeQuestion = (index) => {
      savedQuestions.value.splice(index, 1);
    }
    const closeModal = () => {
        console.log("useCustomQuestions", useCustomQuestions.value);
        console.log("savedquestions", savedQuestions.value);

        isModalOpen.value = false;
        emit(
            "questions-saved-generalQuiz",
            savedQuestions.value,
            useCustomQuestions.value
        );
        console.log("useCustomQuestions", useCustomQuestions.value);
        console.log("savedquestions", savedQuestions);

        emit('modal-closed');

        alternatives.value = alternatives.value.filter((alt, index) => {
        return index === 0 || alt.text.trim() !== "";
        });
        while (alternatives.value.length < 2) {
        alternatives.value.push({ text: "", isCorrect: false });
  }
    };

    defineExpose({
        openModal,
        closeModal,
    });
  </script>
  
  <style scoped>

.modal-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-wrapper {
  position: relative;
  width: 100%;
  max-width: 1200px;
  min-height: 600px;
}

.questions-list {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 280px; 
  max-height: 80vh;
  overflow-y: auto;
  
  background-color: orange;
  color: #000; /* Dark text for contrast on orange */
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.questions-list h2 {
  margin-top: 0;
  text-align: center;
  font-size: 1.2rem;
  margin-bottom: 10px;
}

.questions-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.questions-list li {
  margin-bottom: 15px;
}

.questions-list li strong {
  display: block;
  margin-bottom: 5px;
  font-size: 0.95rem;
  color: #333;
}

.questions-list li ul {
  margin-left: 1rem;
}

.questions-list li ul li {
  margin-bottom: 4px;
  font-size: 0.9rem;
}

.modal-content {
  position: relative;
  margin: 30px auto 0 auto;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-sizing: border-box;
  
  background-color: #fff;
  border-radius: 8px;
  text-align: center;
  margin-left: 360px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.radio-buttons-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 15px;
}

.radio-buttons-container label {
  display: flex;
  gap: 6px;
  align-items: center;
}

input[type="radio"] {
  accent-color: #4caf50;
  margin: 0;
  width: 22px;
  height: 22px;
  cursor: pointer;
}

.question {
  margin: 10px 0;
  box-sizing: border-box;
}

input[type="text"],
input[placeholder] {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
input[type="text"]:focus,
input[placeholder]:focus {
  border-color: #4caf50;
  box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
  outline: none;
}

input[type="checkbox"] {
  accent-color: #4caf50;
  margin: 0;
  width: 22px;
  height: 22px;
  cursor: pointer;
}

button {
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  display: inline-block;
  font-size: 16px;
  margin: 20px 4px;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}


#alternatative-button {
  background-color: green;
}
#alternatative-button:hover {
  background-color: rgb(8, 179, 8);
  box-shadow: 0 0 15px 5px rgba(8, 179, 8, 0.5);
  transform: scale(1.05);
}

#save-button {
  background-color: green;
}
#save-button:hover {
  background-color: rgb(8, 179, 8);
  box-shadow: 0 0 15px 5px rgba(8, 179, 8, 0.5);
  transform: scale(1.05);
}

.question-item {
  margin-bottom: 15px;
  padding: 10px;
  background: rgb(255, 153, 0); 
  border: 1px solid rgb(0, 0, 0); 
  border-radius: 5px;
}

.question-container {
  display: flex;
  justify-content: space-between;
}

.question-details {
  flex: 1; 
}

.question-title {
  margin: 0 0 10px;
  font-weight: bold;
}


.answer-item {
  list-style: none; 
  margin-bottom: 5px;
}


.remove-button {
  border: none;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  background-color: rgb(213, 8, 8); 
  color: white;
  
  border-radius: 5px;
  width: 40px;
  height: 40px;
  padding: 0;
}

.remove-button:hover {
  background-color: rgb(247, 44, 44);
  box-shadow: 0 0 5px 2px rgba(245, 37, 37, 0.5);
}


#close-button {
  background-color: rgb(213, 8, 8);
}
#close-button:hover {
  background-color: rgb(247, 44, 44);
  box-shadow: 0 0 5px 2px rgba(245, 37, 37, 0.5);
  transform: scale(1.05);
}


.alternative-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}
  
  
  @media (max-width: 1024px) {
  .modal-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    display: flex; 
    flex-direction: column;
    align-items: center; 
    justify-content: flex-start; 
    padding-top: 40px; 
  }

 
  .questions-list {
    position: static;
    transform: none;
    width: 90%;
    max-width: 600px;
    margin: 0 auto 20px auto;
    border-right: none;
    border-bottom: 2px solid #ccc; 
  }

  .modal-content {
    position: static;
    margin-left: 0;
    width: 90%;
    max-width: 600px;
    margin: 0 auto 40px auto; 
  }
}

  </style>