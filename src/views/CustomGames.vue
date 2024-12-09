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
        <input type="checkbox" id="game1" name="games" value="game1" v-model="selectedGames">
        <label for="game1">Game 1</label>
        <button class="edit-button" @click="editGame('game1')">Edit</button>
    </div>
  
    <div>
        <input type="checkbox" id="game2" name="games" value="game2" v-model="selectedGames">
        <label for="game2">Game 2</label>
        <button class="edit-button" @click="editGame('game2')">Edit</button>
    </div>
  
    <div>
        <input type="checkbox" id="game3" name="games" value="game3" v-model="selectedGames">
        <label for="game3">Game 3</label>
        <button class="edit-button" @click="editGame('game3')">Edit</button>
    </div>
  
    <div>
        <input type="checkbox" id="game4" name="games" value="game4" v-model="selectedGames">
        <label for="game4">Game 4</label>
        <button class="edit-button" @click="editGame('game4')">Edit</button>
    </div>
  
    <div class="startbutton-container">
        <button class="startbutton" @click="startGame">Start Game</button>
    </div>
  
  
</template>
  
<script>
  export default {
    name: 'CustomGames',
    components: {
  
    },
  
  data: function() {
      return{
          amountMinutes: 60,
          selectedGames: [],
          players: ['Player 1']
        };
    },
  methods: {
  
      incrementMinutes: function() {
            this.amountMinutes += 10;
        },
  
      decrementMinutes: function () {
          if(this.amountMinutes > 10){
            this.amountMinutes -= 10;
        }
      },
  
      startGame: function () {
          if (this.selectedGames.length === 0) {
              alert("Please select at least one game.");
              return;
        }
  
          if (this.players.length === 0) {
              alert("No players have joined yet.");
              return;
        }
  
          const gameConfig = {
              time: this.amountMinutes,
              games: this.selectedGames,
              players: this.players,
        };        
      }
    }
  }
</script>

<style>

.decrementbutton{
	background-color: red;
	border-radius: 4px;
	color: white;
}

.incrementbutton{
	background-color: green;
	border-radius: 4px;
	color: white;

}

.startbutton{
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

.startbutton:hover{
    background-color: rgb(8, 179, 8);
    box-shadow: 0 0 15px 5px rgba(8, 179, 8, 0.5); 
    transform: scale(1.05);
}



  
  
  </style>