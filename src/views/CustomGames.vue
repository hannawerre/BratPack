<template>
    <h1>Game PIN: 123456</h1>
    
    <div>
        <p>Choose the time in minutes:</p>
        <div class="button-container">
            <button class="decrement-button" @click="decrementMinutes">-</button>
                {{ amountMinutes }}
            <button class="increment-buttton" @click="incrementMinutes">+</button>
        </div>
    </div>
  
    <h2>Choose your custom games below:</h2>
  
    <div>
      <input type="checkbox" id="game1" name="games" value="game1">
      <label for="game1">Game 1</label>
      <button class="edit-button" @click="editGame('game1')">Edit</button>
    </div>

    <div>
      <input type="checkbox" id="game2" name="games" value="game2">
      <label for="game2">Game 2</label>
      <button class="edit-button" @click="editGame('game2')">Edit</button>
    </div>

    <div>
      <input type="checkbox" id="game3" name="games" value="game3">
      <label for="game3">Game 3</label>
      <button class="edit-button" @click="editGame('game3')">Edit</button>
    </div>

    <div>
      <input type="checkbox" id="game4" name="games" value="game4">
      <label for="game4">Game 4</label>
      <button class="edit-button" @click="editGame('game4')">Edit</button>
    </div>

    <div class="startbutton-container">
        <button @click="startGame">Start Game</button>

    </div>
  
  
  </template>
  
  <script>
  export default {
    name: 'CustomGames',
    components: {
  
    },
  
    data: function() {
        return{
            amountMinutes: 60
        };
    },
    methods: {
        incrementMinutes: function() {
            this.amountMinutes += 10;
        },
        decrementMinutes: function () {
          if(this.amountMinutes > 10){
            this.amountMinutes -= 10;
        }},
        startGame: function () {

          
        }
    }
  
  }
  </script>
  