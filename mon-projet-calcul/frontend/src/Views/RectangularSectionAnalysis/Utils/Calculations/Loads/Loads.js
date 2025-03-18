
import regression from 'regression';
import Mathematic from "../General/Mathematic";
import { AssignmentIndSharp } from '@material-ui/icons';



class Loads {
  constructor(data){
    this.data = data;
    this.mathematic = new Mathematic();
  }

  Meq() { //Moment equivalent
    const Med = this.data.Med.value;
    const Ned = this.data.Ned.value;
    const d = this.data.d.value;
    const h = this.data.h.value;
    let emin = 0;
    if (Ned > 0) {
      emin = Math.max(20 * 0.001, h / 30);
    }
    const value = Math.abs(Med) + (Ned * ((d - h / 2) + emin)); // Attention signe moment
    return this.mathematic.round(value,2);
  }

}

export default Loads;