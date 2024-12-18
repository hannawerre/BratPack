<template>
    <div v-if="isModalOpen" class="modal-background" @click.self="closeModal">
        <div class="modal-content">
            <h1>Edit {{ GameName }}</h1>

            
            <button @click="closeModal">Close</button>
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

    const openModal = () => {
        isModalOpen.value = true;
        emit('modal-opened');
    };
    const closeModal = () => {
        isModalOpen.value = false;
        emit('modal-closed');
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
    }

    button {
        background-color: green;
        border: none;
        border-radius: 6px;
        color: white;
        cursor: pointer;
        display: inline-block;
        font-size: 16px;
        margin: 30px 4px;
        padding: 15px;
        text-align: center;
        text-decoration: none;
        transition: background-color 0.3s ease, box-shadow 0.3s ease;
    }

    button:hover {
        background-color: rgb(8, 179, 8);
        box-shadow: 0 0 15px 5px rgba(8, 179, 8, 0.5);
        transform: scale(1.05);
    }

    h1 {
        margin-bottom: 1rem;
    }
</style>