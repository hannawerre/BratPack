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
                  <ul>
                  <li v-for="(answer, i) in question.answers" :key="i" class="answer-item">
                      {{ answer.answer }} 
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
  
        <div class="modal-edit-content" @click.stop>
        

          <button class="modal-edit-close-button" @click="closeModal">
            &times;
          </button>

          <h1>{{ uiLabels.EditQuizComponent.edit }} {{ GameName }}</h1>
          <p>{{ uiLabels.EditQuizComponent.hereAddQuestion }}</p>
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
  
          <div v-for="(alt, index) in alternatives" :key="index" class="alternative-row">
            <input
              v-model="alt.text"
              :placeholder="uiLabels.EditQuizComponent.alternative"
            />
          </div>
  
          <button @click="addAlternative" id="alternatative-button">
            {{ uiLabels.EditQuizComponent.addAlternative }}
          </button>
          <button @click="saveQuestion" id="save-button">
            {{ uiLabels.EditQuizComponent.saveAlternatives }}
          </button>

        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, defineProps, defineExpose, defineEmits, onMounted, onUnmounted} from 'vue';
  import AlertModal from '@/components/AlertModal.vue';

  const props = defineProps({
    GameName: String,
    uiLabels: Object
  });
  
  const emit = defineEmits([
    "modal-opened",
    "modal-closed",
    "questions-saved-thisOrThat",
]);

    const alertMessage = ref('');      
    const isAlertOpen = ref(false);
    
    const isModalOpen = ref(false);

    const isListVisible = ref(false);
    const toggleText = ref("Show questions");

    const useCustomQuestions = ref(false);

    const alternatives = ref([
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
]);

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

    const toggleListVisibility = () => {
        isListVisible.value = !isListVisible.value;
        toggleText.value = isListVisible.value ? "Hide questions" : "Show questions";
    };

    const saveQuestion = () => {

        const nonEmptyAlternatives = alternatives.value.filter((alt) => alt.text.trim() !== "");

        if (nonEmptyAlternatives.length < 2) {
          triggerValidationError("At least two alternatives must have text.");
          return;
        }

            const newQuestionId = savedQuestions.value.length;
            
            const newQuestionObj = {
                id: savedQuestions.value.length,
                    question: `Question ${newQuestionId + 1}`,
                    answers: nonEmptyAlternatives.map((alt, index) => ({
                    id: index + 1,
                    answer: alt.text,
                }))
            };

        savedQuestions.value.push(newQuestionObj);

        console.log("Currently saved questions:", savedQuestions.value);

        alternatives.value = [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            ];
    };
    const removeQuestion = (index) => {
      savedQuestions.value.splice(index, 1);
    }
    const closeModal = () => {
        console.log("useCustomQuestions", useCustomQuestions.value);
        console.log("savedquestions", savedQuestions.value);

        isModalOpen.value = false;
        emit(
            "questions-saved-thisOrThat",
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
  
 