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
    updateMiniClock(timerDisplay) {
      console.log("TimerDispaly from responsiveNav= ", this.miniClock);
      this.miniClock = timerDisplay;
  }
  },
  
  created: function() {
    socket.on('update-timer', (timerDisplay) => {
    console.log("Mottar timerDisplay:", timerDisplay);
    this.miniClock = timerDisplay;
  })},
  beforeDestroy() {
    socket.off('update-timer'); // Avregistrerar händelsen
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





