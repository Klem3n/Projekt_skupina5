<template>
  <div>
    <Navbar />
    <section class="hero is-link is-fullheight-with-navbar">
      <div class="hero-body">
        <div class="container imagesContainer">
          <div v-for="item in imagesArray" :key="item.url">
            <img :src="item" style="padding: 10px;" />
          </div>
        </div>
      </div>
    </section>
    <Footer />
  </div>
</template>

<script>
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default {
  name: "Home",
  components: {
    Navbar,
    Footer
  },
  data: function() {
    return {
      locationArray: [],
      imagesArray: []
    };
  },
  methods: {},
  beforeMount() {
    axios.get("http://localhost:5000/api/v1/kamere").then(response => {
      console.log(response);
      for (var i = 0; i < 138; i++) {
        this.locationArray[i] = response.data[i].name;
        this.imagesArray[i] = response.data[i].url;
      }
    });
  },
  mounted() {
    console.log("Mounted");
  }
};
</script>

<style scoped>
.imagesContainer {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  margin: 30px;
  justify-items: center;
  row-gap: 15px;
}

@media (max-width: 475px) {
  .imagesContainer {
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    margin: 10px;
  }
}

.hero {
  background-color: white;
}
</style>