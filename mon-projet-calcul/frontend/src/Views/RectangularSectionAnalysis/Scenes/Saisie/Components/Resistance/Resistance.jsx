
import initialState from "../../../../Utils/initialState";
import TableElem from "../../../../../../Components/TableElem/TableElem";
import {
  Grid,
  Box,
  Typography,
  TextField,
  MenuItem,
  RadioGroup,
  FormControl,
  FormControlLabel,
  Radio,
  Select,
  Checkbox
} from '@material-ui/core';
import React, { useState } from 'react';
// import CardElem from "../../../../../../Components/CardElem/CardElem";
import RectangularSection from '../../../../Utils/Calculations/RectangularSection';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { ButtonElem } from '@tridyme/react-components';
import { InputElem } from '@tridyme/react-components';
import { CardElem } from '@tridyme/react-components';
import { InputTableElem } from '@tridyme/react-components';


const Resistance = ({
  state,
  setState,
  handleChange,
}) => {

  return(
    <Grid container spacing={1}>
      <Grid item xs={12} >
        <CardElem title={'Béton'} subtitle={'Caractéristiques du béton'} elevation={0}>
          {/* <TableElem 
            columns={[]}
            data={state.data}
            ui={state.ui.concrete}
            onChange={handleChange}
          /> */}
          
          <InputTableElem
            headers={["Nom", "Valeur", "Unité", "Description"]}
            keys={["label", "value", "unit", "description"]}
            data={state.data}
            ui={state.ui.concrete}
            onChange={handleChange}
            style = {{columnsWidth :['10%' , '30%', '10%', '50%']}}
          /> 
          
        </CardElem>
      </Grid>
      <Grid item xs={12} >
        <CardElem title={'Acier'} subtitle={"Caractéristiques de l'acier"} elevation={0}>
          {/* <TableElem 
            columns={[]}
            data={state.data}
            ui={state.ui.steel}
            onChange={handleChange}
          />  */}
          <InputTableElem
            headers={["Nom", "Valeur", "Unité", "Description"]}
            keys={["label", "value", "unit", "description"]}
            data={state.data}
            ui={state.ui.steel}
            onChange={handleChange}
            style = {{columnsWidth :['10%' , '30%', '10%', '50%']}}
          />
        </CardElem>
      </Grid>
    </Grid> 
  )
}
export default Resistance;