<template>
    <div>
    <!-- Visa en frågekomponent per fråga -->
    <div v-for="questionObj in questions" :key="questionObj.id">
      <QuestionComponent 
        :question="questionObj" 
        @answer="onAnswer"
      />
    </div>
  </div>
    

</template>



<script>
import QuestionComponent from './QuestionComponent.vue';
const socket = io("localhost:3000");
import io from 'socket.io-client'; 


export default {
    name: 'GeneralQuizComponent',
    components: {
        QuestionComponent
    },

    props: {
        gameData :{
            type: Object,
            required: true
        },
        gamePin: {
            type: String, 
            required: true
        }
    },

    data: function(){
        return {
            lang: localStorage.getItem("lang") || "en",
            questions: []
        }
    },

    created: function() {
        socket.on('generalQuestions', quizQuestions => this.questions = quizQuestions.questions)
        socket.emit('getQuestions', this.lang)
    }
}


</script>

<style>


</style>