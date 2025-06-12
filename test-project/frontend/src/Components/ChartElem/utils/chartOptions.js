const chartOptions = (d,Xmin,Xmax,Ymin,Ymax,AsSupR, AsInfR) => {
  const data=d[0];

  return {
    showLines: true,
    animation: false,
    legend: {
      display: false
    },
    tooltips: {
      // enabled: true, // Set tooltips to always be visible
      // mode: 'index', // Display all tooltips
      callbacks: {
        label: (t) => {
          if (t.datasetIndex === 0) {
            const numx = t.xLabel.toFixed(3);
            const numy = t.yLabel.toFixed(3);
            return `X: ${numx} Y: ${numy}`;
          }
          
          return '';
        },
        title: (tooltipItems) => {
          const index = tooltipItems[0].datasetIndex;
          if (index === 1) {
            return [`AsInf = ${AsInfR} cm²`];
          } else if (index === 2) {
            return [`Assup = ${AsSupR} cm²`];
          }
          return '';
        },
        labelColor: (tooltipItems) => {
          const index = tooltipItems.datasetIndex;
          return {
            borderColor: 'red',
            backgroundColor: 'red',
          };
        },
      },
      
    },
    
    elements: {
      point: { radius: 1 }
    },
    scales: {
      xAxes: [{
        type: 'linear',
        position: 'bottom',
        ticks: {
          min: Xmin,
          max: Xmax,
          // stepSize: DeltaMax
        },
        scaleLabel: {
          display: true,
          labelString: `${data.axisName.x}(${data.unit.x})`
        }
      }],
      yAxes: [{
        type: 'linear',
        position: 'bottom',
        ticks: {
          min: Ymin,
          max: Ymax,
          // stepSize: DeltaMax
        },
        scaleLabel: {
          display: true,
          labelString: `${data.axisName.y}(${data.unit.y})`
        }
      }]
    },

    
  };
};

export default chartOptions;