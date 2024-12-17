<template>
    <div v-if="isModalOpen" class="modal-background" @click.self="closeModal">
        <div id="modal-content">
            <h1>Edit {{ GameName }}</h1>
            <button @click="closeModal">{{ close }}</button>
        </div>
    </div>
</template>
  
<script setup>
import { ref, defineProps, defineExpose } from 'vue';

    props = defineProps({
        GameName: String,
        close: String,
    });

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
</style>