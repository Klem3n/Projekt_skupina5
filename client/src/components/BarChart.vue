<script>
//Importing Bar class from the vue-chartjs wrapper
import { Bar } from "vue-chartjs";
//Exporting this so it can be used in other components
export default {
  extends: Bar,
  props: {
    napisi: Array,
    vrednosti: Array,
    title: String,
    barva: String
  },
  data() {
    return {
      datacollection: {
        //Data to be represented on x-axis
        labels: this.napisi,
        datasets: [
          {
            label: "Data One",
            backgroundColor: this.barva,
            pointBackgroundColor: "white",
            borderWidth: 1,
            pointBorderColor: "#249EBF",
            //Data to be represented on y-axis
            data: this.vrednosti
          }
        ]
      },
      //Chart.js options that controls the appearance of the chart
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              },
              gridLines: {
                display: true
              }
            }
          ],
          xAxes: [
            {
              gridLines: {
                display: false
              }
            }
          ]
        },
        legend: {
          display: false
        },
        title: {
          display: true,
          position: "top",
          text: this.title
        },
        responsive: true,
        maintainAspectRatio: false
      }
    };
  },
  mounted() {
    //renderChart function renders the chart with the datacollection and options object.
    this.renderChart(this.datacollection, this.options);
  }
};
</script>