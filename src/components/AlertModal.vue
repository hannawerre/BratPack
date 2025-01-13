<template>
    <div class="modal-background" v-if="isOpen">
      <div class="modal-wrapper">
        <div class="modal-content">
          <h2>{{ title }}</h2>
          <p>{{ message }}</p>
          <button @click="handleClose">OK</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, defineProps, defineEmits } from 'vue';
  
  const props = defineProps({

    title: {
      type: String,
      default: 'Meddelande'
    },

    message: {
      type: String,
      default: ''
    },

    isOpen: {
      type: Boolean,
      default: false
    }
  });
  

  const emit = defineEmits(['close']);

  function handleClose() {
    emit('close');
  }
  </script>
  
  <style scoped>
  .modal-background {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9999; 
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .modal-wrapper {
    background: #fff;
    border-radius: 8px;
    max-width: 500px;
    width: 90%;
    padding: 1.5rem;
    box-shadow: 0 2px 12px rgba(0,0,0,0.4);
  }
  
  .modal-content {
    text-align: center;
  }
  
  button {
    background-color: #d55;
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    cursor: pointer;
    margin-top: 1rem;
  }
  
  button:hover {
    background-color: #f44;
  }
  </style>
  