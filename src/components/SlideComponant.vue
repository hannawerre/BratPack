
<template>
  <div>
    <div :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SlideComponent',
  data() {
    return {
      currentIndex: 0, // Håller reda på aktiv sida
    };
  },
  computed: {
    totalPages() {
      return this.$slots.default ? this.$slots.default().length : 0;
    },
  },
  mounted() {
    this.adjustPageWidth(); // Justera bredden när komponenten monteras
    window.addEventListener('resize', this.adjustPageWidth); // Lyssna på fönsterstorlek
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.adjustPageWidth);
  },
  methods: {
    adjustPageWidth() {
      if (this.$refs.pagesContainer) {
        const pageCount = this.$slots.default ? this.$slots.default().length : 0;
        this.$refs.pagesContainer.style.width = `${pageCount * 100}%`;
      }
    },
    slide(direction) {
      if (direction === 'next' && this.currentIndex < this.totalPages - 1) {
        this.currentIndex++;
      } else if (direction === 'prev' && this.currentIndex > 0) {
        this.currentIndex--;
      }
      this.$emit('slideChanged', this.currentIndex); // Emitera händelse vid slide
    },
  },
};
</script>