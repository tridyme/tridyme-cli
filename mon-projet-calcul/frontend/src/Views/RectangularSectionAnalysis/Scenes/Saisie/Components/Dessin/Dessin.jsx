

import {
    Grid,
    Radio,
    RadioGroup,
    FormControlLabel
  } from '@material-ui/core';
import React, { useState } from 'react';

const Dessin = (classes) => {
    
    return(
        <Grid item md={6} style={{display:'flex', justifyContent:'flex-end'}}>
            <RadioGroup>
                <FormControlLabel classes={{label: classes.label}} value="Dessin Géometrie Type" control={<Radio  size='small'/>} label="Dessin Géometrie Type" />
                <FormControlLabel classes={{label: classes.label}} value="Dessin Géometrie Saisie" control={<Radio size='small'/>} label="Dessin Géometrie Saisie" />
            </RadioGroup>
        </Grid>          
       
    )
}
export default Dessin;