import React from 'react';
import { Grid } from '@material-ui/core';
import ChartElem from '../../../../Components/ChartElem/ChartElem';
import CardElem from '../../../../Components/CardElem/CardElem';

const Graphe = ({  
  state,
  setState,
  handleChange,
  hasSteel 
}) => {
  const b = state.data?.b?.value;
  const h = state.data?.h?.value;
  const c = state.data?.c?.value;
  const c_prime = state.data?.cPrime?.value;

  const AsSupR = state.data?.AsSupR?.value;
  const AsInfR = state.data?.AsInfR?.value;

  const chartPoints = [
    { x: 0, y: 0 },
    { x: b, y: 0 },
    { x: b, y: h },
    { x: 0, y: h },
    { x: 0, y: 0 },
  ];
  
  // const e = 0.03;
  const eInf = c;
  const diam = 0.016;
  const lowerSteel = [
    { x: eInf, y: c },
    { x: eInf , y: c+diam },
    { x: b-eInf, y: c+diam },
    { x: b-eInf, y: c },
    { x: eInf, y: c },
  ];

  const eSup = c_prime;
  const upperSteel = [
    { x: eSup, y: h-c_prime-diam },
    { x: eSup , y: h-c_prime },
    { x: b-eSup, y: h-c_prime },
    { x: b-eSup, y: h-c_prime-diam },
    { x: eSup, y: h-c_prime-diam },
  ];
  const updatedChartPoints = [...chartPoints, lowerSteel, upperSteel];


  const dataPoints = [
    updatedChartPoints,
  ];

  const dataForChart = [
    ...dataPoints.map((data, index) => ({
      chartTitle: index,
      value: data,
      axisName: { x: 'l ', y: 'h ' },
      unit: { x: 'm', y: 'm' },
      bordColor: index === 0 ? ['rgba(59, 57, 59, 1)'] : 'red',
    })),
    hasSteel && {
      chartTitle: 'lowerSteel',
      value: lowerSteel,
      axisName: { x: 'l ', y: 'h ' },
      unit: { x: 'm', y: 'm' },
      backColor: 'red',
      bordColor: 'red',
      text: 'Lower Steel',
    },
    hasSteel && {
      chartTitle: 'upperSteel',
      value: upperSteel,
      axisName: { x: 'l ', y: 'h ' },
      unit: { x: 'm', y: 'm' },
      backColor: 'red',
      bordColor: 'red',
      text: 'Upper Steel',
    },
  ];
  
  return (
    <Grid container>
      <Grid item md={12}>
        <CardElem title={'Graphique'} subtitle={'Section rectangulaire'} elevation={0}>
          <ChartElem
            dataForChart={dataForChart}
            Xmin={0}
            Xmax={Math.max(b, h)}
            Ymin={0}
            Ymax={Math.max(b, h)}
            ldisplay={true}
            AsSupR={AsSupR}
            AsInfR={AsInfR}
          />
        </CardElem>
      </Grid>
    </Grid>
  );
};

export default Graphe;
