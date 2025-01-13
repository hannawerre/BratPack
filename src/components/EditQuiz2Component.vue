<template>
    <div v-if="isModalOpen" class="modal-edit-background" @click.self="closeModal">
      <div v-if="isModalOpen" class="modal-edit-wrapper" @click.self="closeModal">
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
  
        <div class="modal-edit-content" @click.stop>
          <button class="modal-edit-close-button" @click="closeModal">
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


</style>