<template>
    <div>
      <h1>Editing Game</h1>
      <p>Currently editing: {{ gameId }}</p>
    </div>
  </template>
  
  <script>
  export default {
    props: ['gameId'], // Ta emot gameId från route
  };
  </script>
  