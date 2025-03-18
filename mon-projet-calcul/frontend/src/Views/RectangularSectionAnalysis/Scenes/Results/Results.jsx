
import React from 'react';
import {
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  Table,
  Typography
} from '@material-ui/core';
import { Check as CheckIcon, GridOnSharp } from '@material-ui/icons';
import { Clear } from '@material-ui/icons';
import TableElem from '../../../../Components/TableElem/TableElem';
import CardElem from '../../../../Components/CardElem/CardElem';
import { makeStyles } from '@material-ui/core/styles';
import Graphe from '../Graphe/Graphe';
import { NumericFormat } from 'react-number-format';
// import initialState from './Utils/initialState';

const useStyles = makeStyles((theme) => ({
  root: {
    '& .MuiTableCell-root': {
      border: 'none', // Remove border for all table cells
    },
  },
  
  label: {
    fontFamily:'sans-serif',
    fontSize: '14px',
    width : '100%',
    lineHeight:'1'
    // textTransform:'lowercase'
  },

  tableCell: {
    lineHeight: '1.5', // Adjust the value as needed for desired line spacing
  },
  
  tableContainer :{
    border:'1px solid #000',
    marginBottom : '10px',
    padding:'10px',
    marginRight: theme.spacing(1),
    flex:'1',
  },
  
  tableTitle :{
    marginLeft:'0.5rem', 
    fontSize:'16px', 
    fontWeight:'bolder'
  }
}));

const Results = ({
  state,
  setState,
  handleChange,
}) => {
  const classes = useStyles();

  function roundToDecimalPlaces(number, decimalPlaces) {
    const factor = 10 ** decimalPlaces;
    return Math.round(number * factor) / factor;
  }
  function couleurAsR(sup, min) { 
    if (sup <= 0 || sup < min) {
      return 'red';
    } else {
      return 'blue';
    }
  }


  return(
    <Grid container spacing={3}>
      
      <Grid item md ={12}>
        <CardElem title={'Détails de calcul'} subtitle={'Flexion composée'} elevation={0}>
          <Grid item xs={12} container>
            <Grid item xs={12}>
              <TableElem 
                columns={[]}
                data={state.data}
                ui={["d","dPrime", "fcm", "fcd", "fctm", "fyd", "mud", "alphau", "zu","sigmaS", "AsMin", "AsMax"]}
                onChange={handleChange}
                isDisable = {true} 
              />
            </Grid>
          </Grid>
        </CardElem>
      </Grid>
    </Grid>  
  )    
}
export default Results