
import React from 'react';
import {
  Grid,
  Button,
  Table
} from '@material-ui/core';
import AperçuTable from './Components/AperçuTable';
import Graphe from '../Graphe/Graphe';
import ReactToPrint from "react-to-print"
import socotec from './Components/AperçuTable/logo.svg'
import { Check as CheckIcon } from '@material-ui/icons';
import { Clear } from '@material-ui/icons';

import { CardElem } from '@tridyme/react-components';
import { InputTableElem } from '@tridyme/react-components';

const Aperçu = ({
  state,
  setState,
  handleChange,
}) => {
  let cref = React.useRef()
  const border = `solid 0.5px #000000`;
  const date = new Date(Date.now());
  const projectName = state.data.projet.value;
  const fileName = state.data.file.value;

  return (
    <Grid container spacing={3}>
      <Grid item md={12} style={{ textAlign: "right" }}>
        <ReactToPrint trigger={() => <Button color="#0082DE" variant='contained' style={{ marginTop: '1rem', backgroundColor: '#0082DE', color: 'white' }} >Imprimer</Button>} content={() => cref} />
      </Grid>
      <br /><br />
      <div ref={(el) => (cref = el)} style={{ paddingLeft: '30px', paddingRight: '30px', paddingTop: '30px', width: '100%' }}>
        <Grid item md={12}>
          <table style={{ width: "100%" }}>
            <tbody>
              <tr >
                <td width={'10%'} style={{ borderTop: border, borderBottom: border, borderLeft: border, borderRight: border, textAlign: "center" }}><img src={socotec} /></td>
                <td width={'80%'} style={{ borderTop: border, borderBottom: border, borderLeft: border, borderRight: border, textAlign: "center" }}>EC2-Ferraillage - Version v0.0.0</td>
                <td width={'10%'} style={{ borderTop: border, borderBottom: border, borderLeft: border, borderRight: border, textAlign: "center" }}> {date.toLocaleDateString()}</td>
              </tr>
            </tbody>
          </table>
          <div style={{ fontSize: 24, marginTop: '1rem', marginBottom: '1rem' }}>Données saisies</div>
          <p><strong> Nom de l'affaire :  {projectName}</strong></p>
          {/* <p><strong> Nom du fichier :  {fileName}</strong></p> */}
          <Grid item md = {10}>
          <p style={{ marginTop: '1rem', fontSize: '1rem' }}> <strong> Hypothèses </strong></p>
          {/* <AperçuTable
            columns={[]}
            data={state.data}
            ui={["h", "b", "c", "cPrime", "fck", "alphacc", "gammac", "fyk", "gammas", "E"]}
            onChange={handleChange}
            isDisable={true}
          /> */}
          <InputTableElem
            headers={["Nom", "Valeur", "Unité", "Description"]}
            keys={["label", "value", "unit", "description"]}
            data={state.data}
            ui={["h", "b", "c", "cPrime", "fck", "alphacc", "gammac", "fyk", "gammas", "E"]}
            onChange={handleChange}
            style = {{columnsWidth :['10%' , '30%', '10%', '50%']}}
            disabled = {true}
          />
          <p style={{ marginTop: '1rem', fontSize: '1rem' }}> <strong> Donnés de Charges </strong></p>
          {/* <AperçuTable
            columns={[]}
            data={state.data}
            ui={["Ned", "Med"]}
            onChange={handleChange}
            isDisable={true}
          /> */}
          <InputTableElem
            headers={["Nom", "Valeur", "Unité", "Description"]}
            keys={["label", "value", "unit", "description"]}
            data={state.data}
            ui={["Ned", "Med"]}
            onChange={handleChange}
            style = {{columnsWidth :['10%' , '30%', '10%', '50%']}}
            disabled = {true}
          />
          <p style={{ marginTop: '1rem', fontSize: '1rem' }}> <strong> Vérifications </strong></p>
          {/* <AperçuTable
            columns={[]}
            data={state.data}
            ui={["d", "dPrime", "fcm", "fcd", "fctm", "fyd", "mud", "alphau", "zu", "sigmaS", "AsMin", "AsMax"]}
            onChange={handleChange}
            isDisable={true}
          /> */}
          <InputTableElem
            headers={["Nom", "Valeur", "Unité", "Description"]}
            keys={["label", "value", "unit", "description"]}
            data={state.data}
            ui={["d", "dPrime", "fcm", "fcd", "fctm", "fyd", "mud", "alphau", "zu", "sigmaS", "AsMin", "AsMax"]}
            onChange={handleChange}
            style = {{columnsWidth :['10%' , '30%', '10%', '50%']}}
            disabled = {true}
          />
          <p style={{ marginTop: '1rem', fontSize: '1rem' }}> <strong> Ferraillage </strong></p>
          {/* <AperçuTable
            columns={[]}
            data={state.data}
            ui={["AsSup", "AsInf"]}
            onChange={handleChange}
            isDisable={true}
          /> */}
          <InputTableElem
            headers={["Nom", "Valeur", "Unité", "Description"]}
            keys={["label", "value", "unit", "description"]}
            data={state.data}
            ui={["AsSup", "AsInf"]}
            onChange={handleChange}
            style = {{columnsWidth :['10%' , '30%', '10%', '50%']}}
            disabled = {true}
          />

          </Grid>
         
        </Grid>
        <Grid item md={12} ref={(el) => (cref = el)}>
          <div style={{ maxWidth: "400px" }}>
            <Graphe state={state} setState={setState} handleChange={handleChange} hasSteel={true} />
          </div>
        </Grid>
      </div>
    </Grid>
  )
}
export default Aperçu