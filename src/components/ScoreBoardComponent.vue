<template>
  <div class="scoreboard-container">
    <h2>Scoreboard</h2>
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
        // Calculate total score and sort participants in descending order
        return this.participants
          .map((participant) => ({
            ...participant,
            totalScore:
              participant.scoreGame1 +
              participant.scoreGame2 +
              participant.scoreGame3 +
              participant.scoreGame4,
          }))
          .sort((a, b) => b.totalScore - a.totalScore);
      },
    },
    methods: {
        highlightPlayer(name) {
            const participant = this.participantsWithHighlight.find(
                (p) => p.name === name
            );
            if (participant) {
                participant.highlighted = true;
                setTimeout(() => {
                participant.highlighted = false;
                }, 1000); // Keep the highlight for 1 second
            }
        },
        updateScore(playerName, points) {
            const player = this.participantsWithHighlight.find((p) => p.name === playerName);
            if (player) {
                player.scoreGame4 += points;
                this.highlightPlayer(playerName); // Trigger highlight when score is updated
            }
        },
    },
  };
  </script>
  <style scoped>
  /* Scoreboard container styling */
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
  
  /* Scoreboard list styling */
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
  
  /* Player name and score styling */
  .player-name {
    flex: 1;
    text-align: left;
  }
  
  .player-score {
    flex: 0 0 auto;
    text-align: right;
    color: #f1faee;
  }
  
  /* Fade animation for reordering */
  .fade-enter-active,
  .fade-leave-active {
    transition: all 0.5s ease;
  }
  
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    transform: translateY(-20px);
  }
/* Green shine effect */
.scoreboard-item.highlight {
  color: #2d6a4f; /* Green text color */
  animation: greenText 2s ease-in-out;
}

@keyframes greenText {
  0% {
    color: #f4f4f9; /* Default color */
  }
  100% {
    color: #2d6a4f; /* Green text */
  }
}
  </style>
  