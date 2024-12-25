<template>
    <div v-if="isModalOpen" class="edit-modal-background" @click.self="closeModal">
        <div class="edit-modal-content">
            <h1>Edit {{ GameName }}</h1>
            <p>Here you can add questions to the game</p>
            <br>
            <p>Add question</p>
            <input v-model="question" placeholder="Add question" class="question"> </input>
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
            
                <button @click="addAlternative" id="alternatative-button">Add alternative</button>
                <button @click="submitQuestion" id="submit-button">Submit</button>
                <button @click="closeModal" id="close-button">Close</button>
            </div>
    </div>
</template>
  
<script setup>
import { ref, defineProps, defineExpose , defineEmits} from 'vue';

    const props = defineProps({
        GameName: String
        
    });

    const emit = defineEmits(["modal-opened", "modal-closed"]);

    const isModalOpen = ref(false);
    const question = ref("");
    const alternatives = ref([{ text: "", isCorrect: false }]);


    const addAlternative = () => {
        console.log("Adding alternative");
        alternatives.value.push({ text: "", isCorrect: false }); 
    };

    const submitQuestion = () => {
        
    }

    const openModal = () => {
        isModalOpen.value = true;
        emit('modal-opened');
    };
    const closeModal = () => {
        isModalOpen.value = false;
        emit('modal-closed');
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
        width: 40px;
        height: 40px;
        cursor: pointer;
        border: solid white;
    }
    

    label {
        font-size: 1rem;
        color: #333;
        font-weight: bold;

    }

    .alternative-row {
        display: flex;
        align-items: center; 
        gap: 10px;
        margin: 10px 0;
    }


</style>
