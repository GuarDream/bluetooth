// Initial data (you can replace this with real-time data)

let stepsData = {
  labels: [],
  datasets: [{
      label: 'Steps Taken',
      data: [],
      fill: false,
      borderColor: '#007bff',
      borderWidth: 2,
      pointBackgroundColor: '#007bff',
      pointRadius: 5,
      pointHoverRadius: 7,
      pointHoverBackgroundColor: 'rgba(0, 123, 255, 0.8)'
  }]
};

const ctx = document.getElementById('exerciseChart').getContext('2d');

const exerciseChart = new Chart(ctx, {
  type: 'line',
  data: stepsData,
  options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
          yAxes: [{
              ticks: {
                  beginAtZero: true,
                  fontColor: '432C81'
              },
              gridLines: {
                  color: 'rgba(0, 0, 0, 0.1)'
              }
          }],
          xAxes: [{
              ticks: {
                  fontColor: '#495057'
              },
              gridLines: {
                  color: 'rgba(0, 0, 0, 0)'
              }
          }]
      },
      legend: {
          display: true,
          labels: {
              fontColor: '#495057'
          }
      },
      tooltips: {
          mode: 'index',
          intersect: false,
          backgroundColor: '#007bff',
          titleFontColor: '#fff',
          bodyFontColor: '#fff',
          callbacks: {
              label: function(tooltipItem, data) {
                  return data.datasets[tooltipItem.datasetIndex].label + ': ' + tooltipItem.yLabel;
              }
          }
      }
  }
});

// Function to add new data to the chart
function addData(chart, label, data) {
  chart.data.labels.push(label);
  chart.data.datasets.forEach((dataset) => {
      dataset.data.push(data);
  });
  chart.update();
}

// Simulating real-time data update (replace with your actual data fetching mechanism)
setInterval(() => {
  const newStepCount = Math.floor(Math.random() * 1000) + 5000; // Simulate new step count
  const currentDate = new Date();
  const timeLabel = currentDate.getHours() + ':' + currentDate.getMinutes() + ':' + currentDate.getSeconds();
  addData(exerciseChart, timeLabel, newStepCount);
}, 5000); // Update every 3 seconds
