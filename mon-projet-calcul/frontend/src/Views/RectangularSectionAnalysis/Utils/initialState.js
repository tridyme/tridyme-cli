// import Eurocode5 from "./Calculations/Eurocode/Eurocode";
// const eurocode5Instance = new Eurocode5();

const initialState = {
  data: {
    projet: {
      id: 'projet',
      name: 'projet',
      label: 'projet',
      value: 'NomDeLAffaire',
      description: 'Nom du projet',
      unit: { value: '', label: '' },
      standard: '',
      reference: '',
    },
    file: {
      id: 'file',
      name: 'file',
      label: 'file',
      value: '',
      description: 'Nom du fichier',
      unit: { value: '', label: '' },
      standard: '',
      reference: '',
    },
    version: {
      id: 'version',
      name: 'version',
      label: 'version',
      value: '0',
      description: 'Version du projet',
      unit: { value: '', label: '' },
      standard: '',
      reference: '',
    },
    responsable: {
      id: 'responsable',
      name: 'responsable',
      label: 'responsable',
      value: '0',
      description: 'Responsable du projet',
      unit: { value: '', label: '' },
      standard: '',
      reference: '',
    },
    classe: {
      id: 'classe',
      name: 'classe',
      label: 'classe',
      value: '',
      description: 'classe',
      unit: { value: '', label: '' },
      standard: '',
      reference: '',
    },
    // Géométrie
    h: {
      id: 'h',
      name: 'h',
      label: 'h',
      description: 'Hauteur de la section',
      value: 0.7,
      unit: { value: 'm', label: 'm' },
    },

    b: {
      id: 'b',
      name: 'b',
      label: 'b',
      description: 'Largeur de la section',
      value: 0.5,
      unit: { value: 'm', label: 'm' },
    },

    c: {
      id: 'c',
      name: 'c',
      label: 'c',
      description: 'Enrobage inférieur',
      value: 0.07,
      unit: { value: 'm', label: 'm' },
    },

    cPrime: {
      id: 'cPrime',
      name: 'cPrime',
      label: "c'",
      description: 'Enrobage supérieur',
      value: 0.07,
      unit: { value: 'm', label: 'm' },
    },

    d: {
      id: 'd',
      name: 'd',
      label: 'd',
      description:
        'Distance du c.g des armatures tendues à la fibre la plus comprimée d’une section',
      value: 0.63,
      unit: { value: 'm', label: 'm' },
    },

    dPrime: {
      id: "d' ",
      name: "d' ",
      label: "d' ",
      description:
        'Distance du c.g des aciers comprimés à la fibre de béton la plus comprimée',
      value: 0.07,
      unit: { value: 'm', label: 'm' },
    },
    // Matériaux
    fck: {
      id: 'fck',
      name: 'fck',
      label: 'fck',
      description: 'Résistance caractéristique à la compression du béton',
      value: 40,
      unit: { value: 'MPa', label: 'MPa' },
    },
    alphacc: {
      id: 'alphacc',
      name: 'alphacc',
      label: 'αcc',
      description: 'Coefficient de fissuration du béton',
      value: 1,
      unit: { value: '-', label: '' },
    },
    gammac: {
      id: 'gammac',
      name: 'gammac',
      label: 'γc',
      description: 'Coefficient de sécurité',
      value: 1.5,
      unit: { value: '-', label: '' },
    },

    fcm: {
      id: 'fcm',
      name: 'fcm',
      label: 'fcm',
      description: 'Résistance moyenne à la compression du béton',
      value: 48,
      unit: { value: 'MPa', label: 'MPa' },
    },
    fcd: {
      id: 'fcd',
      name: 'fcd',
      label: 'fcd',
      description: 'Contrainte de compression du béton',
      value: 26.67,
      unit: { value: 'MPa', label: 'MPa' },
    },
    fctm: {
      id: 'fctm',
      name: 'fctm',
      label: 'fctm',
      description: 'Résistance à la traction du béton',
      value: 3.51,
      unit: { value: 'MPa', label: 'MPa' },
    },
    fyk: {
      id: 'fyk',
      name: 'fyk',
      label: 'fyk',
      description: "Limite d'élasticité caractéristique de l'acier",
      value: 500,
      unit: { value: 'MPa', label: 'MPa' },
    },
    gammas: {
      id: 'gammas',
      name: 'gammas',
      label: 'γs',

      description: "Coefficient de sécurité pour l'acier",
      value: 1.15,
      unit: { value: '-', label: '' },
    },
    E: {
      id: 'E',
      name: 'E',
      label: 'E',
      description: 'Module d’élasticité de l’acier',
      value: 200000,
      unit: { value: 'MPa', label: 'MPa' },
    },
    fyd: {
      id: 'fyd',
      name: 'fyd',
      label: 'fyd',
      description: "Limite d'élasticité de l'acier",
      value: 400,
      unit: { value: 'MPa', label: 'MPa' },
    },

    // Efforts
    Med: {
      id: 'Med',
      name: 'Med',
      label: 'Med',
      description: 'Moment fléchissant',
      value: 700,
      unit: { value: 'kN.m', label: 'kN.m' },
    },
    Ned: {
      id: 'Ned',
      name: 'Ned',
      label: 'Ned',
      description: 'Effort normal',
      value: 0,
      unit: { value: 'kN', label: 'kN' },
    },
    // Ved :{
    //   id:'Ved',
    //   name:'Ved',
    //   label:'Ved',
    //   description: "Effort tranchant",
    //   value: 0,
    //   unit: {value :"kN", label :"kN"}
    // },

    // Calcul
    Meq: {
      id: 'Meq',
      name: 'Meq',
      label: 'Meq',
      description: '',
      value: 700,
      unit: { value: '', label: '' },
    },

    mud: {
      id: 'mud',
      name: 'mud',
      label: 'μlu',
      description: 'Moment fléchissant ultime réduit',
      value: 0.1323,
      unit: { value: '-', label: '' },
    },

    cas: {
      id: 'cas',
      name: 'cas',
      label: 'cas',
      description: '',
      value: 'Ned non négatif',
      unit: { value: '', label: '' },
    },

    alphau: {
      id: 'alphau',
      name: 'alphau',
      label: 'αu',
      description: 'Hauteur relative de l’axe neutre à l’ELU',
      value: 0.1781,
      unit: { value: '-', label: '' },
    },
    zu: {
      id: 'zu',
      name: 'zu',
      label: 'zu',
      description: 'Bras de levier',
      value: 0.112,
      unit: { value: 'm', label: 'm' },
    },
    sigmaS: {
      id: 'sigmaS',
      name: 'sigmaS',
      label: 'σs',
      description: 'Contrainte de traction de l’acier',
      value: 434.78,
      unit: { value: 'MPa', label: 'MPa' },
    },
    // Ferraillage
    AsMin: {
      id: 'AsMin',
      name: 'AsMin',
      label: 'AsMin',
      description: "Section d'acier minimale",
      value: 5.75,
      unit: { value: 'cm²', label: 'cm²' },
    },
    AsMax: {
      id: 'AsMax',
      name: 'AsMax',
      label: 'AsMax',
      description: "Section d'acier maximale",
      value: 144,
      unit: { value: 'cm²', label: 'cm²' },
    },
    AsSup: {
      id: 'AsSup',
      name: 'AsSup',
      label: 'As,sup',
      description: "Section d'acier supérieur",
      value: 0,
      unit: { value: 'cm²', label: 'cm²' },
    },
    AsInf: {
      id: 'AsInf',
      name: 'AsInf',
      label: 'As,inf',
      description: "Section d'acier inférieur",
      value: 5.75,
      unit: { value: 'cm²', label: 'cm²' },
    },
    AsSupR: {
      value: 0,
    },
    AsInfR: {
      value: 5.75,
    },
    conclusion: {
      id: 'conclusion',
      name: 'conclusion',
      label: 'conclusion',
      description: '',
      value: '',
      unit: { value: '', label: '' },
    },
  },

  ui: {
    projet: ['projet', 'responsable', 'version'],
    concrete: ['fck', 'alphacc', 'gammac'],
    steel: ['fyk', 'gammas', 'E'],
    geometrie: ['h', 'b', 'c', 'cPrime'],
    load: ['Med', 'Ned'], //, "Ved"]
  },
};

export default initialState;
