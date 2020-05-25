<template>
  <div>
    <Navbar />
    <section class="hero is-link is-fullheight-with-navbar">
      <div class="hero-body">
        <div class="container grid">
          <canvas id="test-chart"></canvas>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import Navbar from "./Navbar";
// import Chart from 'chart.js';

export default {
  name: "Home",
  components: {
    Navbar
  }
};
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}
</style>