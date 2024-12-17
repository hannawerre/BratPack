<template>


  <div>
    <h1>Power Hour</h1>
 
    <div class="input-container">
      <button @click="adjustMinutes(-10)">-</button>
          {{ minutesInput }}
      <button @click="adjustMinutes(10)">+</button>
    </div>
 
 
    <button @click="startTimer">Starta Timer</button>
 
 
    <p>{{ timerDisplay }}</p>
  </div>
 </template>
 
 
 <script>

import io from 'socket.io-client';
const socket = io("localhost:3000");

 export default {
  name: "Timer",
  data() {
    return {
      minutesInput: 60,     
      timerInterval: null,  
      timerDisplay: "",      
      countDownDate: null, 
      alarmSound: null,    
      lastMinute: null  
    };
  },
  mounted() {
   
    this.alarmSound = new Audio('/audio/alarm.mp3'); 
    this.silenceSound = new Audio('/audio/silence.mp3'); 
  },
  methods: {
    adjustMinutes(delta) {
     
      this.minutesInput += delta;
      if (this.minutesInput < 11) {
        this.minutesInput = 10; 
      }
    },
    startTimer() {
      if (isNaN(this.minutesInput) || this.minutesInput <= 0) {
        this.timerDisplay = "Skriv in antal minuter i rutan";
        return;
      }

      this.countDownDate = new Date().getTime() + this.minutesInput * 60 * 1000;
      
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }

      this.lastMinute = null;
      this.timerInterval = setInterval(this.updateTimer, 1000);
    },
    sendUpdateTimer () {
      console.log("TimerDispaly from timercomponant= ", this.timerDisplay);
      socket.emit('update-timer', this.timerDisplay);
    },


    updateTimer() {
      const now = new Date().getTime();
      const distance = this.countDownDate - now;
 
 
      
      if (distance < 0) {
        clearInterval(this.timerInterval);
        this.timerDisplay = "Tiden är slut!";
        this.playAlarm(); 
        return;
      }
 
 
      
      const totalSeconds = Math.floor(distance / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
 
 
      
      if (hours > 0) {
        this.timerDisplay = `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        this.timerDisplay = `${minutes}m ${seconds}s`;
      } else {
        this.timerDisplay = `${seconds}s`;
      }
 
 
      
      if (this.lastMinute === null)  {

        this.lastMinute = minutes;
        this.playSilence();
      } if (totalSeconds % 60 === 0) {
        this.lastMinute = minutes;

        this.playAlarm();
        
      }
      this.sendUpdateTimer();
    },

    playSilence() {
      if (this.silenceSound) {
        this.silenceSound.play();
      }
    },

    playAlarm() {
      if (this.alarmSound) {
        this.alarmSound.play();
      }
    }
   
  },
  beforeDestroy() {
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  },
 };
 </script>
 
 
 <style scoped>
 h1 {
  text-align: center;
  font-size: 50px;
  margin-top: 0px;
 }
 p {
  text-align: center;
  font-size: 150px;
  margin-top: 0px;
 }
 .input-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
 }
 input[type="number"] {
  -webkit-appearance: none;
  -moz-appearance: textfield;
  appearance: none;
  text-align: center;
  font-size: 20px;
  width: 80px;
 }
 button {
  cursor: pointer;
  padding: 10px 15px;
  border-radius: 5px;
  font-size: 20px;
  border: none;
  background-color: #ddd;
 }
 button:hover {
  background-color: green;
  color: white;
 }
 </style>