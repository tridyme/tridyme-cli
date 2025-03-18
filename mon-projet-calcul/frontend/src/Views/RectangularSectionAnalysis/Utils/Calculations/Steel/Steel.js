
import regression from 'regression';
import Mathematic from "../General/Mathematic";
import { AssignmentIndSharp } from '@material-ui/icons';


class Steel {
  constructor(data){
    this.data = data;
    this.mathematic = new Mathematic();
  }

  fctm() { //Résistance à la traction du béton
    const fck = this.data.fck.value;
    let value = 0;
    if (fck > 50) {
      value = 2.12 * Math.log(1 + (fck + 8) / 10);
    } else {
      value = 0.3 * fck ** (2 / 3);
    }
    return this.mathematic.round(value,2) ;
  }

  fyd() { //Limite d'élasticité de l'acier
    const fyk = this.data.fyk.value;
    const gammas = this.data.gammas.value;
    return this.mathematic.round(fyk / gammas,2);
  }

}

export default Steel;