<template>
<div>
    {{ minutes }}:{{ seconds }}

    <!-- Mute Button -->
    <button @click="toggleMute" class="mute-button">
      <i :class="muted ? 'icon-muted' : 'icon-unmuted'"></i>
    </button>
</div>
</template>


<script>
const socket = io("localhost:3000");
import io from 'socket.io-client'; 

export default {
    props: {
        gamePin: {
            type: String, 
            required: true
        },
        selectedMinutes: {
            type: Number,
            required: true
        }
    },
    data: function() {
        return {
            remainingTime: 3600, //60 minutes default
            localTimer:null,
            syncInterval:null,
            muted: false, 
        };
    },
    computed: {
        minutes() {
            return Math.floor(this.remainingTime / 60);
        },
        seconds() {
            const seconds = this.remainingTime % 60;
            return seconds < 10 ? `0${seconds}` : `${seconds}`; // Ensure 2 digits
        }
    },
    methods: {
        start(){
            this.localTimer = setInterval(() => {
                if (this.remainingTime > 0) {
                    this.remainingTime--;
                }
                if (this.remainingTime % 60 === 0 && !this.muted) this.ringBell()
            }, 1000);

            this.syncInterval = setInterval(this.syncWithServer, 10000); // Request sync with server once every 10 seconds.
        },
        syncWithServer() {
            socket.emit('requestGameTime', this.gamePin, (response) => {
                if (response.error) {
                    console.error(response.error);
                } 
                else {
                    this.remainingTime = response.remainingTime;
                }
            });
        },
        ringBell() {
            const bell = new Audio('/audio/alarm.mp3'); 
            bell.play().then(() => {

            }).catch((error) => {
                console.error("Kunde inte spela upp alarmet:", error);
            });;
        },
        toggleMute() {
            this.muted = !this.muted; 
        }
    },
    mounted() {
        this.syncWithServer()
        this.start();
    },
    beforeUnmount() {
        clearInterval(this.localTimer);
        clearInterval(this.syncInterval);
    },
};
</script>

<style>
/* General button styling */
.mute-button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 30px;
}

/* Speaker icon (unmuted) */
.icon-unmuted::before {
  content: "\f028"; /* FontAwesome speaker icon code */
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  color: #000; /* Color of the speaker icon */
}

/* Speaker icon with a line (muted) */
.icon-muted::before {
  content: "\f6a9"; /* FontAwesome speaker icon with a line code */
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  color: #000; /* Color of the muted icon */
}
</style>