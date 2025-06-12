const chartData = (data) => {
  var d=[];
  data.forEach((v)=>{
    var elt=  {
      label: v.chartTitle,
      type: 'scatter',
      data: v.value,
      backgroundColor: v.backColor,
      borderColor: v.bordColor,
      borderWidth: 3,
      lineTension: 0,
      showLine: true,
      fill: true
    } ; 
    d.push(elt);
  });
  return {
    labels: ['Scatter'],
    datasets: d
  };
};

export default chartData;
