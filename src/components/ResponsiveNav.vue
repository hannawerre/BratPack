<template>
  <nav :class="{'hide': hideNav}">
    <div id="Logo">
      <router-link to="/">
        <img src="/img/logo_pwr_hour2.0.png" alt="Logo" />
      </router-link>
    </div>
    <div>
      <span> {{ miniClock }} </span> 
    </div>
    <div id="Language">
      <LanguageSwitcher 
        :lang="lang" 
        :uiLabels="uiLabels"
        @language-changed="emitLanguageChangeToParent"
      />
    </div>
  </nav>
</template>

<script>
import LanguageSwitcher from './LanguageSwitcher.vue'
import io from 'socket.io-client';
const socket = io("localhost:3000");

export default {
  name: 'ResponsiveNav',
  components: {
    LanguageSwitcher
  },
  props: {
    hideNav: {
      type: Boolean,
      default: false
    },
    uiLabels: {
      type: Object,
      default: () => ({ home: 'Home', about: 'About', changeLanguage: 'Change Language' })
    },
    lang: {
      type: String,
      default: 'en'
    }
  },
  data() {
    return {
      miniClock: "", 
    };
  },
  methods: {
    emitLanguageChangeToParent(newLang) {
      this.$emit('language-changed', newLang);
    },

    playAlarm() {
      console.log("Spelar alarm...");
      const alarmSound = new Audio('/audio/alarm.mp3');
      alarmSound.play().then(() => {
        console.log("Alarm spelas.");
      }).catch((error) => {
        console.error("Kunde inte spela upp alarmet:", error);
      });
    },

    playSilence() {
      console.log("Spelar tystnad...");
      const silenceSound = new Audio('/audio/silence.mp3');
      silenceSound.play().then(() => {
        console.log("Silence spelas.");
      }).catch((error) => {
        console.error("Kunde inte spela upp Silence:", error);
      });
    }
  }, 
  created() {
    console.log("Testing sound playback...");

    const silenceSound = new Audio('/audio/silence.mp3');
    silenceSound.play().then(() => {
        console.log("Silence sound played successfully.");
    }).catch(error => {
        console.error("Failed to play silence:", error);
    });

    

    
    socket.on('update-timer', ({ timerDisplay, soundType }) => {
        console.log("TimerDisplay received in ResponsiveNav:", timerDisplay, "SoundType:", soundType);

        this.miniClock = timerDisplay;

        if (soundType === 'alarm') {
            this.playAlarm();
        } else if (soundType === 'silence') {
            this.playSilence();
        }
    });
},
  beforeDestroy() {
   // Clean up the socket listener when the component is destroyed
    socket.off('update-timer');
  }
};
</script>

<style scoped>
nav {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 3rem;
  background-color: rgba(0,0,0,0);
  color: #000;
  padding: 0 1rem;
  box-sizing: border-box;
}

#Logo img {
  padding-top: 30px;
  margin-top: 5px;
  height: 90px;
  cursor: pointer;
}

#Links {
  display: flex;
  gap: 1.5rem;
}

#Links a {
  color: black;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
  cursor: pointer;
}

.hide {
  display: none;
}
</style>
