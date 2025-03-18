
import initialState from "../../../../Utils/initialState";
import TableElem from "../../../../../../Components/TableElem/TableElem";
import {
  Grid,
  Radio,
  RadioGroup,
  Button,
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  List, 
  ListItem, 
  ListItemText,
  Box,
  FormControl,
  FormControlLabel,
  Typography,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper 
} from '@material-ui/core';
import React, { useState } from 'react';
// import CardElem from "../../../../../../Components/CardElem/CardElem";
import RectangularSection from '../../../../Utils/Calculations/RectangularSection';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import './style.css';

import { ButtonElem } from '@tridyme/react-components';
import { InputElem } from '@tridyme/react-components';
import { CardElem } from '@tridyme/react-components';
import { InputTableElem } from '@tridyme/react-components';


const Geometrie = ({state,setState, handleChange}) => {
  const [openDialog, setOpenDialog] = useState(false);

  const sections = [
    { id: 1, label: "5 x 12.5", calculSection: "4.7 x 12.2", b: 4.7, h: 12.2 },
    { id: 2, label: "5 x 15.0", calculSection: "4.7 x 14.7", b: 4.7, h: 14.7 },
    { id: 3, label: "5 x 16.5", calculSection: "4.7 x 16.2", b: 4.7, h: 16.2 },
    { id: 4, label: "5 x 17.5", calculSection: "4.7 x 17.2", b: 4.7, h: 17.2 },
    { id: 5, label: "5 x 20.0", calculSection: "4.7 x 19.7", b: 4.7, h: 19.7 },
    { id: 6, label: "5 x 22.5", calculSection: "4.7 x 22.2", b: 4.7, h: 22.2 },
    { id: 7, label: "5 x 25.0", calculSection: "4.7 x 24.7", b: 4.7, h: 24.7 },
    { id: 8, label: "6.5 x 10.0", calculSection: "6.3 x 9.7", b: 6.3, h: 9.7 },
    { id: 9, label: "6.5 x 11.5", calculSection: "6.3 x 11.2", b: 6.3, h: 11.2 },
    { id: 10, label: "6.5 x 12.5", calculSection: "6.3 x 12.2", b: 6.3, h: 12.2 },
    { id: 11, label: "6.5 x 15.0", calculSection: "6.3 x 14.7", b: 6.3, h: 14.7 },
    { id: 12, label: "6.5 x 16.5", calculSection: "6.3 x 16.2", b: 6.3, h: 16.2 },
    { id: 13, label: "6.5 x 17.5", calculSection: "6.3 x 17.2", b: 6.3, h: 17.2 },
    { id: 14, label: "6.5 x 20.0", calculSection: "6.3 x 19.7", b: 6.3, h: 19.7 },
    { id: 15, label: "6.5 x 22.5", calculSection: "6.3 x 22.2", b: 6.3, h: 22.2 },
    { id: 16, label: "6.5 x 25.0", calculSection: "6.3 x 24.7", b: 6.3, h: 24.7 },
    { id: 17, label: "7.5 x 7.5", calculSection: "7.2 x 7.2", b: 7.2, h: 7.2 },
    { id: 18, label: "7.5 x 10.0", calculSection: "7.2 x 9.7", b: 7.2, h: 9.7 },
    { id: 19, label: "7.5 x 11.5", calculSection: "7.2 x 11.2", b: 7.2, h: 11.2 },
    { id: 20, label: "7.5 x 12.5", calculSection: "7.2 x 12.2", b: 7.2, h: 12.2 },
    { id: 21, label: "7.5 x 15.0", calculSection: "7.2 x 14.7", b: 7.2, h: 14.7 },
    { id: 22, label: "7.5 x 16.5", calculSection: "7.2 x 16.2", b: 7.2, h: 16.2 },
    { id: 23, label: "7.5 x 17.5", calculSection: "7.2 x 17.2", b: 7.2, h: 17.2 },
    { id: 24, label: "7.5 x 20.0", calculSection: "7.2 x 19.7", b: 7.2, h: 19.7 },
    { id: 25, label: "7.5 x 22.5", calculSection: "7.2 x 22.2", b: 7.2, h: 22.2 },
    { id: 26, label: "7.5 x 25.0", calculSection: "7.2 x 24.7", b: 7.2, h: 24.7 },
    { id: 27, label: "7.5 x 28.0", calculSection: "7.2 x 27.7", b: 7.2, h: 27.7 },
    { id: 28, label: "7.5 x 30.0", calculSection: "7.2 x 29.7", b: 7.2, h: 29.7 },
    { id: 29, label: "10.0 x 10.0", calculSection: "9.7 x 9.7", b: 9.7, h: 9.7 },
    { id: 30, label: "10.0 x 11.5", calculSection: "9.7 x 11.2", b: 9.7, h: 11.2 },
    { id: 31, label: "10.0 x 12.5", calculSection: "9.7 x 12.2", b: 9.7, h: 12.2 },
    { id: 32, label: "10.0 x 15.0", calculSection: "9.7 x 14.7", b: 9.7, h: 14.7 },
    { id: 33, label: "10.0 x 16.5", calculSection: "9.7 x 16.2", b: 9.7, h: 16.2 },
    { id: 34, label: "10.0 x 17.5", calculSection: "9.7 x 17.2", b: 9.7, h: 17.2 },
    { id: 35, label: "10.0 x 20.0", calculSection: "9.7 x 19.7", b: 9.7, h: 19.7 },
    { id: 36, label: "10.0 x 22.5", calculSection: "9.7 x 22.2", b: 9.7, h: 22.2 },
    { id: 37, label: "10.0 x 25.0", calculSection: "9.7 x 24.7", b: 9.7, h: 24.7 },
    { id: 38, label: "10.0 x 28.0", calculSection: "9.7 x 27.7", b: 9.7, h: 27.7 },
    { id: 39, label: "10.0 x 30.0", calculSection: "9.7 x 29.7", b: 9.7, h: 29.7 }
  ];

  const handleChangeNbLiens = (prop) => (event) => {
    const newData = {
      ...state.data,
      [prop]: {
        ...state.data[prop],
        value: event.target.value
      }
    };
    const calculatedData = new RectangularSection(newData).analysis();
    const updatedState = {
      ...state,
      data: {
        ...newData,
        ...calculatedData
      }
    }

    setState(updatedState);
  } 

  const handleEditSection = (section) => {
    const newData = {
      ...state.data,
      ["b"]: {
        ...state.data["b"],
        value: (section.b)*10
      },
      ["h"]: {
        ...state.data["h"],
        value: (section.h)*10
      }
    };
    const calculatedData = new RectangularSection(newData).analysis();
    const updatedState = {
      ...state,
      data: {
        ...newData,
        ...calculatedData
      }
    }

    setState(updatedState);
    setOpenDialog(false);
  }

  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);

  const handleRowClick = (section, index) => {
    setSelectedRow(index);
    setSelectedSection(section);
  };

  return(
    <Grid container spacing={3}> 
      <Grid item md ={12} >
        <CardElem title={'Geométrie'} subtitle={'Caractéristiques géométriques'} elevation={0}>
          <Grid item md ={12}>
            {/* <TableElem 
              columns={[]}
              data={state.data}
              ui={state.ui.geometrie}
              onChange={handleChange}
            />  */}

             <InputTableElem
                headers={["Nom", "Valeur", "Unité", "Description"]}
                keys={["label", "value", "unit", "description"]}
                data={state.data}
                ui={state.ui.geometrie}
                onChange={handleChange}
                style = {{columnsWidth :['10%' , '30%', '10%', '50%']}}
              />
          </Grid>
        </CardElem>
      </Grid>
    </Grid>
  )
}
export default Geometrie;