<script>
import { Line } from "vue-chartjs";
export default {
  extends: Line,
  props: {
    labels: [String],
    data: [Number]
  },
  data() {
    return {
      datacollection: {
        labels: this.props.labels,
        datasets: [
          {
            label: "Data One",
            backgroundColor: "#f87979",
            pointBackgroundColor: "white",
            borderColor: "#f87979",
            borderWidth: 3,
            pointBorderColor: "#249EBF",
            data: this.props.data,
            fill: false
          }
        ]
      },
      options: {
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