<template>
  <nav :class="{'hide': hideNav}">
    <div id="Logo">
      <router-link to="/">
        <img src="/img/logo_pwr_hour2.0.png" alt="Logo" />
      </router-link>
    </div>
    <div>
      <!-- TODO: timer here? /sebbe -->
      <span>  </span>
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
    };
  },
  methods: {
    emitLanguageChangeToParent(newLang) {
      this.$emit('language-changed', newLang);
    }
  }
};
</script>

<style scoped>
nav {
  position: sticky;
  top: 10px;
  left: 0;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: auto;
  background-color: rgba(190, 52, 52, 0);
  color: #000;
  padding: 0 1rem;
  box-sizing: border-box;
  
  
}

nav > div:nth-child(2) {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.5rem;
  border: double 9px #5b7C99;
  padding: 2px;
}

#Logo img {
  
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
