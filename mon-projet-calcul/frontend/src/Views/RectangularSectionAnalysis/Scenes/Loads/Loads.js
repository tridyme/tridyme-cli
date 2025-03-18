import React, { useState, useEffect } from 'react';
import {
  Grid,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  Typography,
  Select,
  MenuItem,
  Box,
  TextField,
  Table,
	Input
} from '@material-ui/core';
import TableElem from '../../../../Components/TableElem/TableElem';
// import CardElem from '../../../../Components/CardElem/CardElem';
import { makeStyles } from '@material-ui/core/styles';
import Graphe from '../Graphe/Graphe';
import RectangularSection from '../../Utils/Calculations/RectangularSection';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { NumericFormat } from 'react-number-format';
import Results from "../Results/Results";

import { ButtonElem } from '@tridyme/react-components';
import { InputElem } from '@tridyme/react-components';
import { CardElem } from '@tridyme/react-components';
import { InputTableElem } from '@tridyme/react-components';

const useStyles = makeStyles((theme) => ({
  root: {
    '& .MuiTableCell-root': {
      border: 'none', // Remove border for all table cells
    },
  },

  label: {
    fontFamily: 'sans-serif',
    fontSize: '14px',
    width: '100%',
    lineHeight: '1',
    // textTransform:'lowercase'
  },

  tableCell: {
    lineHeight: '1.5', // Adjust the value as needed for desired line spacing
  },

  tableContainer: {
    border: '1px solid #000',
    marginBottom: '10px',
    padding: '10px',
    marginRight: theme.spacing(1),
    flex: '1',
  },

  tableTitle: {
    marginLeft: '0.5rem',
    fontSize: '16px',
    fontWeight: 'bolder'
  },
}));

const Loads = ({
  state,
	data,
	ui,
  onChange,
  setState,
  handleChange,
  isDisable,
}) => {
  
  // const [columns, setColumns] = useState(["nom", "valeur", "unitées", "description"]);
	const [rows, setRows] = useState([]);
	useEffect(() => {
		setRows(ui)
	}, []);
  
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
  function couleurConclusion(texte) { 
    if ( texte === "Conclusion: Augmenter la section du béton !" || texte ==="Erreur") {
      return 'red';
    } else {
      return 'black';
    }
  }

  const headers = ["Nom", "Valeur", "Unité", "Description"] 
  const columnsWidth = ['10%' , '30%', '10%', '50%']
  const headersResults = ["Nom", "Valeur calculée", "Valeur à appliquer", "Unité", "Description"] 
  const columnsWidthResults = ['10%' , '20%', '20%', '10%', '40%']
  return (
    <Grid container spacing={3} justifyContent='space-between'>
      <Grid item lg={8} md={8} sm={8} xs={12}>
        <Grid container spacing={3} direction='column'>
          <Grid item xs={12}>
            {/* <CardElem title={"Efforts"} subtitle={"Charges à l'ELU"} elevation={0}>
              <TableElem
                columns={[]}
                data={state.data}
                ui={state.ui.load}
                onChange={handleChange}
              />
            </CardElem> */}
              <CardElem title={"Efforts"} subtitle={"Charges à l'ELU"} elevation={0}>
                <Table style={{width:'100%'}}>
                  <thead>
                  <tr key={0}>
                    {headers.map((header, index) => (
                      <td key={index} style={{ textAlign: 'center', fontWeight:'bold' ,  width: columnsWidth?.[index] }}>{header}</td>
                    ))}
                  </tr>
                  </thead>
                  <tbody>
                    <tr >
                      {/* data={state.data} */}
                      <td style={{textAlign:'center'}}>{`${state.data.Med.label}`}</td>
                      <td  >
                        <NumericFormat
                          style={{ border: 0, backgroundColor: 'white', width: '100%', color: 'blue', textAlign:'center' }}
                          type="text"
                          onChange={handleChange("Med")}
                          value={roundToDecimalPlaces(state.data.Med.value, 2)}
                          disabled={false}
                        />
                      </td>
                      <td style={{textAlign:'center'}}>{`${state.data.Med.unit.value}`}</td>
                     
                      <td style={{textAlign:'center'}}>{`${state.data.Med.description}`}</td>
                    </tr>

                    <tr >
                      <td style={{textAlign:'center'}}>{`${state.data.Ned.label}`}</td>
                      <td style={{textAlign:'center'}} >
                        <NumericFormat
                          style={{ border: 0, backgroundColor: 'white', width: '100%', color:  'blue', textAlign:'center' }}
                          type="text"
                          onChange={ handleChange("Ned")}
                          value={roundToDecimalPlaces(state.data.Ned.value, 2)}
                          disabled={false}
                        />
                      </td>
                      <td style={{textAlign:'center'}}>{`${state.data.Ned.unit.value}`}</td>
                      <td style={{textAlign:'center'}}>{`${state.data.Ned.description}`}</td>
                    </tr>
                  </tbody>
                </Table>
              </CardElem> 
          </Grid>  
          <Grid item xs={12}>   
            <CardElem title={"Résultats"} subtitle={"Sections d'acier calculées et théoriques"} elevation={0}>
              <Table style={{width:'100%'}} >
                <thead>
                <tr key={0}>
                  {headersResults.map((header, index) => (
                    <td key={index} style={{ textAlign: 'center', fontWeight:'bold' ,  width: columnsWidthResults?.[index] }}>{header}</td>
                  ))}
                </tr>
                </thead>
                <tbody>
                  <tr >
                    {/* data={state.data} */}
                    <td style={{textAlign:'center'}} >{`${state.data.AsSup.label}`} </td>
                    <td style={{textAlign:'center'}} >
                      <NumericFormat
                        style={{ border: 0, textAlign:'center', backgroundColor: 'white', width: '100%', color: 'black' }}
                        type="text"
                        onChange={handleChange}
                        value={roundToDecimalPlaces(state.data.AsSup.value, 2)}
                        disabled={true}
                      />
                    </td>
                    <td  >
                      <NumericFormat
                        style={{ border: 0, textAlign:'center' , backgroundColor: 'white', width: '100%', color: 'black' }} //'#32CD32' --> limegreen
                        type="text"
                        onChange={handleChange}
                        value={roundToDecimalPlaces(state.data.AsSupR.value, 2)}
                        disabled={true}
                      />
                    </td>
                    <td style={{textAlign:'center'}} >{`${state.data.AsSup.unit.value}`} </td>
                    <td style={{textAlign:'center'}} > {`${state.data.AsSup.description}`} </td>
                  </tr>
                  <tr >
                    <td style={{textAlign:'center'}}>{`${state.data.AsInf.label}`}</td>
                    <td  >
                      <NumericFormat
                        style={{ border: 0, textAlign:'center', backgroundColor: 'white', width: '100%', color: 'black' }}
                        type="text"
                        onChange={handleChange}
                        value={roundToDecimalPlaces(state.data.AsInf.value, 2)}
                        disabled={true}
                      />
                    </td>
                    <td  >
                      <NumericFormat
                        style={{ border: 0, textAlign:'center', backgroundColor: 'white', width: '100%', color: 'black' }} //'#32CD32' --> limegreen
                        type="text"
                        onChange={handleChange}
                        value={roundToDecimalPlaces(state.data.AsInfR.value, 2)}
                        disabled={true}
                      />
                    </td>
                    <td style={{textAlign:'center'}}>{`${state.data.AsInf.unit.value}`}</td>
                    <td style={{textAlign:'center'}}>{`${state.data.AsInf.description}`}</td>
                  </tr>
                </tbody>
              </Table>
            </CardElem>
          </Grid>
        </Grid>
      </Grid>

      <Grid item lg={4} md={6} sm={8} xs={12}>
        <div style={{ maxWidth: "400px" }}>
          <Graphe state={state} setState={setState} handleChange={handleChange} hasSteel={true} />
        </div>
      
      </Grid>
        
      <Grid item xs={12}>
        {/* <Typography style={{color:  couleurConclusion(state.data.conclusion.value)}}>
          { state.data.conclusion.value}
        </Typography> */}
      <CardElem title={"Détails de calcul"} subtitle={"Flexion composée"} elevation={0}>
        <InputTableElem
          headers={["Nom", "Valeur", "Unité", "Description"]}
          keys={["label", "value", "unit", "description"]}
          data={state.data}
          ui={["d", "dPrime", "fcm", "fcd", "fctm", "fyd", "mud", "alphau", "zu", "sigmaS", "AsMin", "AsMax"]}
          onChange={handleChange}
          style = {{columnsWidth :['10%' , '30%', '10%', '50%']}}
          disabled = {true}
        />
        </CardElem>
      </Grid>
      
        {/* <Grid item xs={12}>
          <CardElem title={'Détails de calcul'} subtitle={'Flexion composée'} elevation={0}>
            <Grid item xs={12} container>
              <Grid item xs={12}>
                <TableElem
                  columns={[]}
                  data={state.data}
                  ui={["d", "dPrime", "fcm", "fcd", "fctm", "fyd", "mud", "alphau", "zu", "sigmaS", "AsMin", "AsMax"]}
                  onChange={handleChange}
                  isDisable={true}
                />
              </Grid>
            </Grid>
          </CardElem>
        </Grid> */}
    </Grid>
  )
}
export default Loads