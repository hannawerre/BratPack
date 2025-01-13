<template>
    <div id="Language">
      <button @click="emitLanguageChange">
        {{ uiLabels.Lang }}
        <div id="flagFrame">
            <img :src="`/public/img/${this.lang}.png`" alt="Language">
        </div>
      </button>
    </div>
</template>

<script>
import io from 'socket.io-client';
const socket = io("localhost:3000");

export default {
    name:"LanguageSwitcher",
    props: {
    uiLabels: {
      type: Object,
      default: () => ({ changeLanguage: "Change Language" })
    },
    lang: {
      type: String,
      default: 'en'
    }
  },
    methods: {
        emitLanguageChange() {
        const newLang = this.lang === 'en' ? 'sv' : 'en';
      this.$emit('language-changed', newLang);
        },
    }
}
</script>

<style scoped>
#Language button {
  cursor: pointer;
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: black;
  font-weight: 500;
}
#flagFrame {
    width: 40px;
    height: 40px;
    margin-left: 5px;
    margin-right: 10px;
    border-radius: 50%;
    overflow: hidden;
}
#flagFrame img {
    display: flex;
    justify-content: center;
    align-items: center;
    width: auto;
    height: 100%;    
    object-fit: cover;
}
</style>