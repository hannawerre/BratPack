<template>

<div>
  <h2>{{ currentStatement }}</h2>
  <p>Rösta på den deltagare som bäst passar:</p>
  <div v-for="(participant, name) in participants" :key="name">
    <button @click="vote(name)">
      {{ name }}
    </button>
  </div>
  <p v-if="showResults">Resultat:</p>
  <ul v-if="showResults">
    <li v-for="(data, name) in participants" :key="name">
      {{ name }}: {{ calculatePercentage(data.votes) }}%
    </li>
  </ul>
</div>
</template>

<script>
import io from "socket.io-client";
const socket = io("localhost:3000");

export default {
name: "WhosMostLikelyToComponent",
props: {
  gamePin: {
    type: String,
    required: true,
  },
},
data() {
  return {
    currentStatement: "",
    participants: {},
    showResults: false,
    hasVoted: false, 
  };
},
methods: {
  vote(name) {
    if (this.hasVoted) {
      alert("Du har redan röstat!");
      return;
    }
    this.hasVoted = true; 
    socket.emit("vote_WhosMostLikelyTo", this.gamePin, this.$parent.userName, name);
  },
  resetVotingState() {
    this.hasVoted = false; 
  },


  calculatePercentage(votes) {
    const totalVotes = Object.values(this.participants).reduce((sum, p) => sum + p.votes, 0);
    return totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 100);
  },
},
created() {
  socket.on("setup_WhosMostLikelyTo", (game) => {
    this.participants = game.participants;
    this.currentStatement = game.statements[game.currentStatement];
  });

  socket.on("newStatement", (newStatement) => {
  this.showResults = false; // Dölj resultat
  this.currentStatement = newStatement.statement; // Uppdatera till nästa fråga
});
// tog bort detta : this.resetVotingState(); 


socket.on("votesUpdated", (updatedParticipants) => {
  this.participants = updatedParticipants; 
  this.showResults = true; // Visa resultat i gränssnittet
});



socket.on("gameOver", () => {
alert("Spelet är över!");
this.$router.push("/"); // Navigera tillbaka till startsidan
});


  socket.emit("setup_WhosMostLikelyTo", this.gamePin);
},
};
</script>
