
import regression from 'regression';
import Mathematic from "../General/Mathematic";
import { AssignmentIndSharp } from '@material-ui/icons';


class Geometry {
  constructor(data){
    this.data = data;
    this.mathematic = new Mathematic();
  }

  d() { // Distance du c.g des armatures tendues à la fibre la plus comprimée d’une section
    const h = this.data.h.value;
    const c = this.data.c.value;
    return this.mathematic.round(h - c,2);
  }

  dPrime() { //Distance du c.g des aciers comprimés à la fibre de béton la plus comprimée
    const cPrime = this.data.cPrime.value;
    return cPrime;
  }

}

export default Geometry;