// import functions from "./Functions/Functions";
import Concrete from "./Concrete/Concrete";
import Steel from "./Steel/Steel";
import Geometry from "./Geometry/Geometry";
import Loads from "./Loads/Loads";
import Reinforcement from "./Reinforcement/Reinforcement";

// import Materials from "./Eurocode/Materials"; 

class RectangularSection {
  constructor(data) {
    this.data = data;
    // Calcul de MaterialProperties
    // const classe = this.data.classe.value;
    // const classeProperties = Materials[classe];
    // Instanciation de la classe Functions avec MaterialProperties
    // this.functions = new functions(this.data);
    this.concrete = new Concrete(this.data);
    this.steel = new Steel(this.data);
    this.geometry = new Geometry(this.data);
    this.loads = new Loads(this.data);
    this.reinforcement = new Reinforcement(this.data, this.concrete, this.steel, this.geometry, this.loads );

  }

  analysis() {
    return{
      // permanentLoadStrongAxis :{
      //   ...this.data.permanentLoadStrongAxis,
      //   value : this.functions.PermanentLoadStrongAxis(),
      // },

      d :{
        ...this.data.d,
        value : this.geometry.d(),  
      },

      dPrime :{
        ...this.data.dPrime,
        value : this.geometry.dPrime(),
      },
            
      fcm :{
        ...this.data.fcm,
        value : this.concrete.fcm(),
      },
      
      fcd :{
        ...this.data.fcd,
        value : this.concrete.fcd(),
      },

      fctm :{
        ...this.data.fctm,
        value : this.steel.fctm(),
      },

      fyd :{
        ...this.data.fyd,
        value : this.steel.fyd(),
      },

      Meq :{
        ...this.data.Meq,
        value : this.loads.Meq(),
      },

      AsMin :{
        ...this.data.AsMin,
        value : this.reinforcement.AsMin(),
      },

      AsMax :{
        ...this.data.AsMax,
        value : this.reinforcement.AsMax()
      },
      
      mud :{
        ...this.data.mud,
        value : this.reinforcement.mud(),
      },

      cas :{
        ...this.data.cas,
        value : this.reinforcement.cas(),
      },


      alphau :{
        ...this.data.alphau,
        value : this.reinforcement.alphau(),
      },

      zu :{
        ...this.data.zu,
        value : this.reinforcement.zu(),
      },

      sigmaS :{
        ...this.data.sigmaS,
        value : this.reinforcement.sigmaS(),
      },

      AsSup :{
        ...this.data.AsSup,
        value : this.reinforcement.AsSup(),
      },

      AsInf :{
        ...this.data.AsInf,
        value : this.reinforcement.AsInf()
      },

      AsSupR :{
        ...this.data.AsSupR,
        value : this.reinforcement.AsSupR(),
      },

      AsInfR :{
        ...this.data.AsInfR,
        value : this.reinforcement.AsInfR(),
      },

      conclusion :{
        ...this.data.conclusion,
        value : this.reinforcement.conclusion(),
      },

    }
  }
}

export default RectangularSection;