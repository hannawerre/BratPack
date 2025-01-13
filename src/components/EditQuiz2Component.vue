<template>
    <div v-if="isModalOpen" class="modal-background" @click.self="closeModal">
      <div v-if="isModalOpen" class="modal-wrapper" @click.self="closeModal">
        <AlertModal
          :title="'Alert'"
          :message="alertMessage"
          :isOpen="isAlertOpen"
          @close="handleModalClose"
        />
        
        <div
        v-if="isSmallScreen"
        class="toggle-button"
        style="background: var(--border-orange)"
        @click="toggleListVisibility"
      >
        <p>{{ isListVisible ? uiLabels.EditQuizComponent.hideQuestions + '&#9650;' : uiLabels.EditQuizComponent.showQuestions + '&#9660;' }}</p>
      </div>

    <div class="questions-list" @click.stop :class="{ 'limited-height': isListVisible && isSmallScreen }">
      <h2>{{ uiLabels.EditQuizComponent.question }}</h2>
          <ul>
            <li v-for="(question, index) in savedQuestions" :key="index" class="question-item" v-show="!isSmallScreen || isListVisible">
                <div class="question-container">
                <!-- Left side: Question and answers -->
                <div class="question-details">
                    <strong class="question-title">{{ question.question }}</strong>
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
          <button class="modal-close-button" @click="closeModal">
            &times;
          </button>
          <h1>{{ uiLabels.EditQuizComponent.edit }} {{ GameName }}</h1>
          <p>{{ uiLabels.EditQuizComponent.hereAddQuestions }}</p>
          <br />
          <div class="radio-buttons-container">
            <label>
                <input 
                type="radio"
                :value="false"
                v-model="useCustomQuestions"
                />
                {{ uiLabels.EditQuizComponent.standardQuestions }}
            </label>
            <label>
                <input 
                type="radio"
                :value="true"
                v-model="useCustomQuestions"
                />
                {{ uiLabels.EditQuizComponent.ownQuestions }}
            </label>
            </div>

          <br />
          <input 
            v-model="question" 
            :placeholder="uiLabels.EditQuizComponent.addQuestion" 
            class="question"
          />

          <button @click="saveQuestion" id="save-button">
            {{ uiLabels.EditQuizComponent.saveQuestion }}
          </button>

        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, defineProps, defineExpose, defineEmits, onMounted, onUnmounted } from 'vue';
  import AlertModal from '@/components/AlertModal.vue';


  const props = defineProps({
    GameName: String,
    uiLabels: Object
  });
  
  const emit = defineEmits([
    "modal-opened",
    "modal-closed",
    "questions-saved-whosMostLikelyTo"
]);
    const alertMessage = ref('');      
    const isAlertOpen = ref(false);
    
    const isModalOpen = ref(false);

    const isListVisible = ref(false);
    const toggleText = ref("Show questions");

    const useCustomQuestions = ref(false);

    const question = ref("");
   

    function triggerValidationError(message) {
    const finnsFel = true;
    if (finnsFel) {
      alertMessage.value = message;
      isAlertOpen.value = true; 
    }
  }
  function handleModalClose() {
    isAlertOpen.value = false;
  }

    const savedQuestions = ref([]);

    const isSmallScreen = ref(window.innerWidth < 1024);

    function handleResize() {
      isSmallScreen.value = window.innerWidth < 1024;
    };

    onMounted(() => {
      window.addEventListener("resize", handleResize);
    });

    onUnmounted(() => {
      window.removeEventListener("resize", handleResize);
    });

    const toggleListVisibility = () => {
      isListVisible.value = !isListVisible.value;
      toggleText.value = isListVisible.value ? "Hide questions" : "Show questions";
    };


    const openModal = () => {
        isModalOpen.value = true;
        emit('modal-opened');
    };

  

    const saveQuestion = () => {

    if (question.value.trim() !== "") {

        const newQuestionId = savedQuestions.value.length + 1;
        
        const newQuestionObj = {
            id: newQuestionId,
            question: question.value, 
        };

        savedQuestions.value.push(newQuestionObj);
        console.log("Currently saved questions:", savedQuestions.value);

        question.value = "";

    } else {
        triggerValidationError("Please enter a question");
    }


    };
    const removeQuestion = (index) => {
      savedQuestions.value.splice(index, 1);
    }
    const closeModal = () => {
        console.log("useCustomQuestions", useCustomQuestions.value);
        console.log("savedquestions", savedQuestions.value);

        isModalOpen.value = false;
        emit(
            "questions-saved-whosMostLikelyTo",
            savedQuestions.value,
            useCustomQuestions.value
        );

        emit('modal-closed');

    };

    defineExpose({
        openModal,
        closeModal,
    });
  </script>
  
  <style scoped>

/* Spara h1 i denna view */
  h1 {
    font-size: 1.5rem;
    margin: 10px;
  }

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
  
  background-color: var(--our-orange);
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
  
  border-radius: 8px;
  background-color: #fff;
  border-radius: 8px;
  text-align: center;
  margin-left: 360px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}
.modal-close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  background-color: rgb(213, 8, 8);
  font-size: 2rem;
  cursor: pointer;
  line-height: 1;

  /* Om du vill ha en rund bakgrund när man hovrar:
  border-radius: 50%;
  padding: 0.25rem 0.5rem;
  */

  /* Transition för en smidig hover-effekt */
  transition: background-color 0.3s, color 0.3s;
}

.modal-close-button:hover {
  background-color: rgb(247, 44, 44);
  box-shadow: 0 0 5px 2px rgba(245, 37, 37, 0.5);
  transform: scale(1.05);
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
  margin: 5px 5px;
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

.questions-list {
  /* Din befintliga styling för > 768px: */
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 280px;
  max-height: 80vh;
  overflow-y: auto;
  
  background-color: var(--our-orange);
  color: #000;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.limited-height {
  max-height: 500px !important;
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
  align-items: center;
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

.alternative-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}

.toggle-button {
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3px;
  font-size: 1.2rem;
  background-color: var(--our-blue); /* Bakgrundsfärg för knappen */
  border-radius: 5px;
  font-size: 12px;
  margin-bottom: 15px;
}
.toggle-button:hover {
  background-color: var(--our-lightBlue); /* Bakgrundsfärg för knappen vid hover */
}
.toggle-button span {
  display: inline-block; /* Visa som inline-block för att kunna styra visuellt */
}

.toggle-button span:first-child {
  display: inline; /* Första delen av knappen syns alltid */
}

.toggle-button span:last-child {
  display: none; /* Andra delen döljs */
}

.toggle-button[style*="none"] span:last-child {
  display: inline; /* Visa pilen när listan är synlig */
}

.toggle-button[style*="none"] span:first-child {
  display: none; /* Dölj pilen när listan är dold */
}

@media (max-width: 1024px) {

  .toggle-button {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: var(--border-orange);
  color: #000;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  z-index: 99999;
  box-sizing: border-box;
  padding: 0 10px;
}

.questions-list {
  position: fixed;
  /* Set the top to the same height as toggle-button */
  top: 50px;
  left: 0;
  width: 100%;

  /* Start hidden above the screen */
  transform: translateY(-100%);
  transition: transform 0.3s ease;
  z-index: 9999;
  
  /* Hide horizontal overflow in case the content is wide */
  overflow-y: auto;
  overflow-x: hidden;

  /* Subtract the toggle-button height from 100vh if you want to avoid overlap */
  max-height: calc(100vh - 50px);
  border-radius: 0;
  margin: 0;
  box-sizing: border-box;
}

/* When isListVisible is true, slide it down */
.questions-list.limited-height {
  transform: translateY(0);
}

/* The modal wrapper etc. can remain as is */
.modal-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  z-index: 1000;
  display: flex; 
  flex-direction: column;
  align-items: center; 
  justify-content: flex-start; 
  padding-top: min(200px, 15%)
}

.modal-content {
  margin-left: 0;
  width: 90%;
  max-width: 600px;
  margin: 0 auto 40px auto; 
}
.modal-close-button {
    background-color: rgb(213, 8, 8);
    font-size: 2rem;
    cursor: pointer;
    line-height: 1;
    border: none;
    /* Ev. rund bakgrund: border-radius: 50%; */
    /* Ev. liten padding för en cirkulär knapp: padding: 0.25rem 0.5rem; */
  } 

  input[type="radio"],
  input[type="checkbox"] {
    transform: scale(1.7);
    margin: 10px;     /* Ännu större på mobil */
  }

}

</style>