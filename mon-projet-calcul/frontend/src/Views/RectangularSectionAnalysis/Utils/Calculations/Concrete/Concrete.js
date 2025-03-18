
import regression from 'regression';
import Mathematic from "../General/Mathematic";
import { AssignmentIndSharp } from '@material-ui/icons';




class Concrete {
  constructor(data){
    this.data = data;
    this.mathematic = new Mathematic();

  }

  fcm(){ // Résistance moyenne à la compression du béton 
    const fck = this.data.fck.value;
    return  fck + 8;
  }

  fcd() { // Contrainte de compression du béton
    const fck = this.data.fck.value;
    const alphacc = this.data.alphacc.value;
    const gammac = this.data.gammac.value;
    return  this.mathematic.round( alphacc * fck / gammac,2);
  }
}

export default Concrete;