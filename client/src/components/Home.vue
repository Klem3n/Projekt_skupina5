<template>
  <div>
    <Navbar />
    <section class="hero is-link is-fullheight-with-navbar">
      <div class="hero-body">
        <div class="container grid">
          <line-chart :napisi="labele"></line-chart>
          <div v-if="isGostotaFetching === true">
            <lottie-player
              src="https://assets3.lottiefiles.com/packages/lf20_03MqnD.json"
              background="transparent"
              speed="1"
              style="width: 50vw; height: 50vh;"
              loop
              autoplay
            ></lottie-player>
          </div>
          <bar-chart v-else :napisi="gostotaNapisi" :vrednosti="gostotaVrednosti"></bar-chart>
        </div>
      </div>
    </section>
    <Footer />
  </div>
</template>

<script>
import Navbar from "./Navbar";
import Footer from "./Footer";
import axios from "axios";
import LineChart from "@/components/LineChart";
import BarChart from "@/components/BarChart";

export default {
  name: "Home",
  components: {
    Navbar,
    Footer,
    LineChart,
    BarChart
  },
  data: function() {
    return {
      labele: ["Test1", "test2", "test"],
      cifre: new Array(10, 20, 30, 40, 50),
      gostotaNapisi: new Array(
        "Gost promet z zastoji",
        "Povečan promet",
        "Normalen promet",
        "Ni prometa"
      ),
      gostotaVrednosti: new Array(),
      isGostotaFetching: true
    };
  },
  methods: {},
  beforeMount() {
    // Gostota Prometa
    axios.get("http://localhost:5000/api/v1/gostota").then(response => {
      console.log(response);
      for (var i = 0; i < 4; i++) {
        this.gostotaVrednosti[i] = response.data[i].val;
        this.isGostotaFetching = false;
      }
    });
  },
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