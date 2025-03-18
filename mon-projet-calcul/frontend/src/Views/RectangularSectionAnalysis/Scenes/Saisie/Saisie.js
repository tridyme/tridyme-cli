
import React from 'react';
import {
  Grid,
} from '@material-ui/core';
import Resistance from './Components/Resistance/Resistance';
import Geometrie from './Components/Geometrie/Geometrie';
import Dessin from './Components//Dessin/Dessin';
import Projet from './Components//Projet/Projet';
// import CardElem from '../../../../Components/CardElem/CardElem';
import Graphe from '../Graphe/Graphe';

import { ButtonElem } from '@tridyme/react-components';
import { InputElem } from '@tridyme/react-components';
import { CardElem } from '@tridyme/react-components';
import { InputTableElem } from '@tridyme/react-components';

const Saisie = ({
  state,
  setState,
  handleChange,
}) => {
  return (
    <Grid container spacing={3}>
      {/* <Grid item md ={12} style={{display:'flex'}}>
        <Projet state ={state} setState = {setState} />
      </Grid> */}
      <Grid item md={12} container spacing={3}>
        <Grid item md={6}>
          <Geometrie state={state} setState={setState} handleChange={handleChange} />
          <Resistance state={state} setState={setState} handleChange={handleChange} />
        </Grid>
        <Grid item lg={4} md={6} sm={8} xs={12}>
          <Graphe state={state} setState={setState} handleChange={handleChange} hasSteel={false} />
        </Grid>
      </Grid>
    </Grid>
  )
}
export default Saisie