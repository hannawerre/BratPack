<template>
    <div class="timer-container">
      <!-- Timer -->
      <div 
        id="timer" 
        class="timer" 
        :class="{'flashing': isFlashing}"
      >
        {{ minutes }}:{{ seconds }}
      </div>
  
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
      }
    },
    data: function() {
      return {
        remainingTime: 3600, // 60 minutes default
        localTimer: null,
        syncInterval: null,
        muted: false,
        isFlashing: false, // Used to trigger flashing effect
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
      start() {
        this.localTimer = setInterval(() => {
          if (this.remainingTime > 0) {
            this.remainingTime--;
          }
          if (this.remainingTime % 60 === 0) this.ringBell();
        }, 1000);
  
        this.syncInterval = setInterval(this.syncWithServer, 10000); // Request sync with server every 10 seconds.
      },
      syncWithServer() {
        socket.emit('requestGameTime', this.gamePin, (response) => {
          if (response.error) {
            console.error(response.error);
          } else {
            this.remainingTime = response.remainingTime;
          }
        });
      },
      ringBell() {
        this.isFlashing = true; // Start flashing
        if(!this.muted){
            console.error("Playing alarm!!! this.muted = ", this.muted);
            const bell = new Audio('/audio/alarm.mp3');
            bell.play().catch((error) => {
            console.error("Could not play alarm:", error);
            });
        }
        setTimeout(() => {
          this.isFlashing = false; // Stop flashing after 1 second
        }, 2000);
      },
      toggleMute() {
        this.muted = !this.muted;
        console.log("toggleMute -> this.muted = ", this.muted)
      }
    },
    mounted() {
      this.syncWithServer();
      this.start();
    },
    beforeUnmount() {
      clearInterval(this.localTimer);
      clearInterval(this.syncInterval);
    },
    unmounted() { // TODO: behövs den?
        // Disconnect socket when component is destroyed or view is changed
        if (this.socket) {
            this.socket.emit('leaveSocketRoom', this.gamePin); // Leave the room
            this.socket.disconnect(); // Disconnect the socket
            this.socket = null;
        }
    }
  };
  </script>
  
  <style scoped>
  /* Timer Container Styling */
  .timer-container {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    margin-top: 20px;
  }
  
  /* Timer Styling */
  .timer {
    font-size: 2.2rem; /* 20% smaller than before */
    font-family: 'Roboto', 'Arial', sans-serif; /* Nice font */
    font-weight: bold;
    color: #1d3557; /* Black text */
    background-color: transparent;
    text-shadow: none; /* No shadow for black text */
    margin-right: 0; /* Removed margin between the timer and button */
    padding: 10px 20px;
    border-radius: 10px;
    transition: color 0.3s ease; /* Transition for color change */
  }
  
  /* Flashing Timer Styling */
  .timer.flashing {
    color: red; /* Red color when flashing */
    animation: flash 2s infinite; /* Flash effect */
  }
  
  @keyframes flash {
    0% {
        color: #1d3557;
    }
    20% {
        color: red
    }
    40% {
        color: #1d3557;
    }
    60% {
        color: red;
    }
    100% {
        color: #1d3557;
    }
  }
  
  /* Mute Button Styling */
  .mute-button {
    background-color: transparent; /* No background */
    border: none;
    cursor: pointer;
    font-size: 24px; /* 20% smaller mute button */
    padding: 12px;
    border-radius: 50%; /* Rounded button */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease-in-out; /* Smooth transition */
    margin-left: 0; /* No space between timer and mute button */
  }
  
  /* Mute Button Hover Effect (removed background) */
  .mute-button:hover {
    transform: scale(1.1); /* Slight zoom effect */
  }
  
  /* Speaker icon (unmuted) */
  .icon-unmuted::before {
    content: "\f028"; /* FontAwesome speaker icon code */
    font-family: "Font Awesome 5 Free";
    font-weight: 900;
    color: #1d3557; /* Dark color for the speaker icon */
  }
  
  /* Speaker icon with a line (muted) */
  .icon-muted::before {
    content: "\f6a9"; /* FontAwesome speaker icon with a line code */
    font-family: "Font Awesome 5 Free";
    font-weight: 900;
    color: #1d3557; /* Dark color for the muted icon */
  }
  </style>
  