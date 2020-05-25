<template>
  <div>
    <Navbar />
    <section class="hero is-link is-fullheight-with-navbar">
      <div class="hero-body">
        <div class="container grid">
          <line-chart></line-chart>
        </div>
      </div>
    </section>
    <Footer />
  </div>
</template>

<script>
import Navbar from "./Navbar";
import Footer from "./Footer";
import LineChart from "@/components/LineChart";

export default {
  name: "Home",
  components: {
    Navbar,
    Footer,
    LineChart
  },
  data: function() {},
  methods: {},
  mounted() {
    console.log("Mounted");
  }
};
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}
.hero {
  background-color: white;
}
</style>