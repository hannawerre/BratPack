<template>
  <div class="scoreboard-container">
    <h2>{{ uiLabels.GameView.scoreboard }}</h2>
    <transition-group name="fade" tag="ul" class="scoreboard">
      <li
        v-for="participant in sortedParticipants"
        :key="participant.name"
        class="scoreboard-item"
        :class="{ 'highlight': participant.highlighted }"
      >
        <span class="player-name">{{ participant.name }}</span>
        <span class="player-score">{{ participant.totalScore }}</span>
      </li>
    </transition-group>
  </div>
</template>

  
  <script>
  export default {
    name: "ScoreBoardComponent",
    props: {
      participants: {
        type: Array,
        required: true,
      },
      uiLabels: {
        type: Object
      }
    },
    data() {
        return {
            participantsWithHighlight: this.participants.map(participant => ({
            ...participant,
            highlighted: false,
            })),
        };
    },
    computed: {
      sortedParticipants() {

        return this.participants
          .map((participant) => ({
            ...participant,
            totalScore:
              participant.scoreGame1 +
              participant.scoreGame2 +
              participant.scoreGame3
          }))
          .sort((a, b) => b.totalScore - a.totalScore);
      },
    },
  };
  </script>
  <style scoped>

  .scoreboard-container {
    max-width: 400px;
    margin: 20px auto;
    text-align: center;
    font-family: 'Arial', sans-serif;
    background-color: #1d3557;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  h2 {
    color: #f4f4f9;
    margin-bottom: 20px;
    font-size: 1.5rem;
  }
  

  .scoreboard {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  
  .scoreboard-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    background-color: #457b9d;
    border-radius: 5px;
    margin-bottom: 10px;
    color: white;
    font-size: 1.2rem;
    font-weight: bold;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .scoreboard-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .player-name {
    flex: 1;
    text-align: left;
  }
  
  .player-score {
    flex: 0 0 auto;
    text-align: right;
    color: #f1faee;
  }
  
 
  .fade-enter-active,
  .fade-leave-active {
    transition: all 0.5s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    transform: translateY(-20px);
  }

.scoreboard-item.highlight {
  color: #2d6a4f; 
  animation: greenText 2s ease-in-out;
}

@keyframes greenText {
  0% {
    color: #f4f4f9; 
  }
  100% {
    color: #2d6a4f; 
  }
}

@media (max-width: 650px) {
  .scoreboard-container {
    max-width: 90%;
    margin: 20px auto;
    padding: 10px;
  }

  h2 {
    font-size: 1.2rem;
    margin-bottom: 15px;
  }

  .scoreboard-item {
    font-size: 1rem;
    padding: 10px;
    margin-bottom: 10px;
  }
}

  </style>  