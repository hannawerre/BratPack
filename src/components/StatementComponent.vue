<template>
  <div>
   <h3>{{ statement.statement }} (ID: {{ statement.id }})</h3>
   
   <ul>
     <li v-for="participant in participants" :key="participant">
       <button @click="selectedParticipant(participant)">
         {{ participant }}
       </button>
     </li>
   </ul>
 </div>
</template>

<script>
export default {
 name: 'StatementComponent',
 props: {

   statement: {
     type: Object,
     required: true
   },
 },
 data() {
   return {
     participants: ["Douglas", "Bob", "Charlie", "David"] //exemepldata, ersätt med faktiska deltagarna
   };
 },
 emits: ["selected"],
 methods: {
   selectedParticipant(participant) {
     this.$emit("selected", {
       statementId: this.statement.id,
       selectedParticipant: participant
    });
   },
   },
};
</script>

<style scoped>
button {
 color: white;
 font-size: 16px;
 background-color: black;
 min-width: 80px;
 min-height: 40px;
 margin: 10px;
 border-radius: 5px;
}
button:hover {
 background-color: rgb(90, 90, 240);
}
</style>