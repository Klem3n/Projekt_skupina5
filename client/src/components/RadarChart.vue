<script>
import { Radar } from "vue-chartjs";

export default {
  extends: Radar,
  props: {
    napisi: Array,
    vrednosti: Array,
    title: String,
    barva: String
  },
  data() {
    return {
      datacollection: {
        labels: this.napisi,
        datasets: [
          {
            label: this.title,
            backgroundColor: "rgba(179,181,198,0.2)",
            borderColor: "rgba(179,181,198,1)",
            pointBackgroundColor: "rgba(179,181,198,1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(179,181,198,1)",
            data: this.vrednosti
          }
        ]
      },
      options: {
        scale: {
          angleLines: {
            display: false
          },
          ticks: {
            suggestedMin: 50,
            suggestedMax: 100
          }
        }
      }
    };
  },
  mounted() {
    this.renderChart(this.datacollection, this.options);
  }
};
</script>