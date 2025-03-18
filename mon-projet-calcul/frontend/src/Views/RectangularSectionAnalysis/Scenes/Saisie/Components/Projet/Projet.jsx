
import TableElem from "../../../../../../Components/TableElem/TableElem";
import CardElem from "../../../../../../Components/CardElem/CardElem";
import {
    Grid,
    Radio,
    RadioGroup,
    FormControlLabel,
    Box,
    Typography,
    TextField,
  } from '@material-ui/core';
import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

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

const Projet = ({
  state,
  setState
}) => {
  const classes = useStyles();
  const handleChangeProjectData = (prop) => (event) => {
    const newData = {
      ...state.data,
      [prop]: {
        ...state.data[prop],
        value: event.target.value
      }
    }
    const updatedState = {
      ...state,
      data: {
        ...state.data,
        ...newData
      }
    }

    setState(updatedState);
  }
  console.log("state",state.data)
  return(
    <Grid item md={12} >
      <CardElem title={'Projet'} subtitle={'Données du projet'} elevation={0}>
        <Grid container spacing={3} style={{display:'flex', alignItems:'center'}}>
          <Grid item xs ={8}>
            <div style={{display:'flex', alignItems:'center'}}>
              <Typography >Nom de l'affaire </Typography>
              <TextField  
                variant="outlined"  
                placeholder="Nom du projet"  
                style={{ width: '450px', backgroundColor:'rgb(240, 240, 240)', marginLeft:'22px'}}  
                value={state?.data?.projet?.value} 
                onChange={handleChangeProjectData("projet")}
              />
            </div>
            <div style={{display:'flex', alignItems:'center', marginTop:'10px'}}>
              <Typography >Nom du fichier </Typography>
              <TextField  
                variant="outlined" 
                placeholder="Nom du fichier" 
                style={{ width: '450px', backgroundColor:'rgb(240, 240, 240)', marginLeft:'30px'}} 
                value={state?.data?.file?.value} 
                onChange={handleChangeProjectData("file")} 
              />
            </div>
          </Grid>
          {/* <Grid>
            <RadioGroup  aria-labelledby="demo-radio-buttons-group-label" defaultValue="imposed" name="radio-buttons-group" spacing={0} style={{display:'flex',flexDirection:'column'}}> 
              <FormControlLabel  classes={{label: classes.label}} value="calculated"control= {<Radio size='small'/>} label='Dessin Géometrie Type'/>
              <FormControlLabel  classes={{label: classes.label}} value="Frettage"control= {<Radio size='small'/>} label='Dessin Géometrie Saisie'/>
            </RadioGroup>
          </Grid> */}
        </Grid>
      </CardElem>
    </Grid>
  )
}
export default Projet;