<script>
import { Line } from "vue-chartjs";

export default {
  extends: Line,
  props: {
    napisi: Array,
    vrednosti: Array
  },
  data: function() {
    return {
      datacollection: {
        labels: this.napisi,
        datasets: [
          {
            label: "Data One",
            backgroundColor: "#f87979",
            pointBackgroundColor: "white",
            borderColor: "#f87979",
            borderWidth: 3,
            pointBorderColor: "#f87979",

            data: this.vrednosti,
            fill: false
          }
        ]
      },
      options: {
        elements: {
          point: {
            radius: 0
          }
        },
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              },
              gridLines: {
                display: false
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
          text: "Trenutna porazdelitev hitrosti (km/h)"
        },
        responsive: true,
        maintainAspectRatio: false,
        fill: false
      }
    };
  },
  mounted() {
    this.renderChart(this.datacollection, this.options);
  }
};
</script>