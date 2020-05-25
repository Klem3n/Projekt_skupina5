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
    <Footer />
  </div>
</template>

<script>
import Navbar from "./Navbar";
import Footer from "./Footer";
// import Chart from 'chart.js';

export default {
  name: "Home",
  components: {
    Navbar,
    Footer
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