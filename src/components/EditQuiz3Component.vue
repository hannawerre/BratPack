<!-- ÄNDRA CSS OCH CLASSES SÅ ATT DET ÄR SAMMA SOM FÖR QUIZ 1 -->


<template>
    <div v-if="isModalOpen" class="modal-background" @click.self="closeModal">
        <div class="modal-content">
            <h1>Edit {{ GameName }}</h1>
            <p>Here you can add questions to the game</p>
            <br>
            <p>Quiz nr3</p>

            
                <button @click="addAlternative" id="alternatative-button">Add alternative</button>

            
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

    .modal-content {
        background-color: white;
        padding: 2rem;
        border-radius: 8px;
        text-align: center;
        max-width: 500px;
        width: 90%;
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
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
    #alternatative-button{
        background-color: green;
    }
    #close-button {
        background-color: rgb(213, 8, 8);
    }

    #close-button:hover{
        background-color: rgb(247, 44, 44);
        box-shadow: 0 0 5px 2px rgba(245, 37, 37, 0.5);
        transform: scale(1.05);
    }

    #alternatative-button:hover {
        background-color: rgb(8, 179, 8);
        box-shadow: 0 0 15px 5px rgba(8, 179, 8, 0.5);
        transform: scale(1.05);
    }
    
    .alternative-row {
        display: flex;
        align-items: center; 
        gap: 10px;
        margin: 10px 0;
    }


</style>
