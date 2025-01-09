<template>
    <div v-if="isModalOpen" class="modal-background" @click.self="closeModal">
      <!-- The .modal-wrapper holds both the questions-list and the modal-content -->
      <div v-if="isModalOpen" class="modal-wrapper" @click.self="closeModal">
        <!-- Questions list pinned to the left edge of the screen -->
        <div class="questions-list" @click.stop>
          <h2>Questions</h2>
          <ul>
            <li v-for="(question, index) in savedQuestions" :key="index">
              <strong>Q{{ index + 1 }}: {{ question.question }}</strong>
              <ul>
                <li v-for="(answer, i) in question.answers" :key="i">
                  {{ answer.answer }} 
                  <span v-if="answer.isCorrect">(Correct)</span>
                </li>
              </ul>
            </li>
          </ul>
        </div>
  
        <!-- Modal content centered in the screen -->
        <div class="modal-content" @click.stop>
          <h1>Edit {{ GameName }}</h1>
          <p>Here you can add questions to the game</p>
          <br>
          <div class="checkboxes-container">
            <label>
              <input 
                type="checkbox"
                v-model="useStandardQuestions"
              />
              Use standard questions
            </label>
            <label>
              <input 
                type="checkbox"
                v-model="useOwnQuestions"
              />
              Use own questions
            </label>
          </div>
          <br>
  
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
    "questions-saved-quiz1"
  ]);
  
  const isModalOpen = ref(false);
  
  const useStandardQuestions = ref(true);
  const useOwnQuestions = ref(false);
  
  const question = ref("");
  const alternatives = ref([{ text: "", isCorrect: false }]);
  const savedQuestions = ref([]);
  
  const addAlternative = () => {
    console.log("Adding alternative");
    alternatives.value.push({ text: "", isCorrect: false }); 
  };
  
  const openModal = () => {
    isModalOpen.value = true;
    emit('modal-opened');
  };
  
  const saveQuestion = () => {
    if (question.value.trim() !== "") {
      const hasCorrectAnswer = alternatives.value.some(alt => alt.isCorrect);
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
  
      // Reset form
      question.value = "";
      alternatives.value = [{ text: "", isCorrect: false }];
    }
  };
  
  const closeModal = () => {
    if(!useStandardQuestions.value && !useOwnQuestions.value){
      alert("Please select at least one option: 'Use standard questions' or 'Use own questions'.");
      return;
    }
  
    isModalOpen.value = false;
    emit(
      "questions-saved-quiz1",
      savedQuestions.value,
      useStandardQuestions.value,
      useOwnQuestions.value,
      "Quiz1"
    );
    
    emit('modal-closed');
    // Clean up empty alternatives except the first one
    alternatives.value = alternatives.value.filter((alt, index) => {
      return index === 0 || alt.text.trim() !== "";
    });
  };
  
  defineExpose({
    openModal,
    closeModal,
  });
  </script>
  
  <style scoped>

/* 
  ----- Base Layout (screens >= 1024px) -----

  The question list is pinned to the left side and 
  the modal content is centered by margin-left.
*/
.modal-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  /* Use flex so we can center the modal-wrapper */
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

/* Orange, rounded box for the question list */
.questions-list {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 280px; /* Slightly wider */
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
  /* Extra left margin to avoid overlap with the questions-list */
  margin-left: 360px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

/* Checkboxes */
.checkboxes-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 15px;
}
.checkboxes-container label {
  display: flex;
  gap: 6px;
  align-items: center;
}

.question {
  margin: 10px 0;
  box-sizing: border-box;
}

/* Generic input styling */
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

/* Buttons */
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

/* Add alternative button */
#alternatative-button {
  background-color: green;
}
#alternatative-button:hover {
  background-color: rgb(8, 179, 8);
  box-shadow: 0 0 15px 5px rgba(8, 179, 8, 0.5);
  transform: scale(1.05);
}

/* Save question button */
#save-button {
  background-color: green;
}
#save-button:hover {
  background-color: rgb(8, 179, 8);
  box-shadow: 0 0 15px 5px rgba(8, 179, 8, 0.5);
  transform: scale(1.05);
}

/* Close button */
#close-button {
  background-color: rgb(213, 8, 8);
}
#close-button:hover {
  background-color: rgb(247, 44, 44);
  box-shadow: 0 0 5px 2px rgba(245, 37, 37, 0.5);
  transform: scale(1.05);
}

/* Alternatives row */
.alternative-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}
  
  /* --- Responsive adjustments for screens below 1024px --- */
  @media (max-width: 1024px) {
  /* The entire wrapper is fixed and scrollable inside if needed */
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
    justify-content: flex-start; /* stack from top down */
    padding-top: 40px; /* some space at the top */
  }

  /* The orange list is no longer absolute; it’s pinned at the top, centered horizontally */
  .questions-list {
    position: static;
    transform: none;
    width: 90%;
    max-width: 600px;
    margin: 0 auto 20px auto;
    border-right: none;
    border-bottom: 2px solid #ccc; /* optional dividing line under list */
  }

  /* The modal itself is also fixed, centered horizontally just below the list */
  .modal-content {
    position: static;
    margin-left: 0;
    width: 90%;
    max-width: 600px;
    margin: 0 auto 40px auto; /* space below the modal */
  }
}

  </style>