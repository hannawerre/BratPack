<template>
    <TimerComponent/>
    <p>{{ this.gamePin }}</p>
    <p>{{ this.userName }}</p>
    <p>{{ this.gameData }}</p>
</template>


<script>
    const socket = io("localhost:3000");
    import io from 'socket.io-client';  // kanske behövs /sebbe
    import TimerComponent from '../components/TimerComponent.vue';

    export default{
        name: 'GameStart',
        components: {
            TimerComponent
        },
        data: function(){
            return {
                gamePin: '',
                userName: '',
                gameData: {}
            }
        },
        created: function() {
            
            socket.on('updateGameData', gameData => {
                this.gameData = gameData;
                console.log("Updated gameData to: ", this.gameData)
            });
            this.setup();
            // This will ensure the client will listen to messages emitted to the socket room. :)
            socket.emit('joinSocketRoom', this.gamePin);
        },
        mounted: function() {
            socket.emit('updateAllGameData', this.gamePin);
            console.log("Sent 'updateAllGameData' to gamePin: ", this.gamePin)

        },
        methods: {
            setup: function(){
                this.gamePin = this.$route.params.gamePin;
                this.userName = sessionStorage.getItem('userName');
                socket.emit('requestGameData', this.gamePin);
            }
        }
    }

</script>
