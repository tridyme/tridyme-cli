import React from 'react';
import {
  Grid,
} from '@material-ui/core';

const Hypotheses = () => {
  return (
      <Grid style={{ marginTop: '20px' }}>
          <p style={{ fontSize: '20px', textAlign: 'center' }}> Calcul du ferraillage pour une section rectangulaire à l'Eurocode 2</p>
          <p style={{ lineHeight: 1.8 }}>
              Le programme permet de calculer les sections d'acier supérieur et inférieur nécessaires pour une section rectangulaire sous l'effet des efforts normaux et moments fléchissant.<br/>
          </p>
          <p>
              <span style={{ fontWeight: 'bold' }}>Conventions :</span> N {" > "} 0 Compression, MG {" > "} 0 Comprime la fibre supérieure / Tend la fibre inférieure
          </p>
          <p>
              <span style={{ fontWeight: 'bold' }}>Conventions :</span> N {" < "} 0 Traction, MG {" < "} 0 Comprime la fibre inférieure / Tend la fibre supérieure
          </p>
          <p>Prendre en considération les imperfections géométriques dans le cas de l'ELU et en compression uniquement selon la norme EC2-1-1, paragraphe 5.2(5) et (7).</p>
          <p>Bibliographie : Règles Eurocodes</p>
          <p> 
          <span style={{ fontWeight: 'bold' }}>NF EN 1992-1-1 : </span> Eurocode 2 - Calcul des structures en béton - Partie 1-1 : règles générales et règles pour les bâtiments
          </p>
          {/* <p style={{ marginLeft: '100px' }}> Règles CB71 </p> */}
      </Grid>
  );
};
export default Hypotheses