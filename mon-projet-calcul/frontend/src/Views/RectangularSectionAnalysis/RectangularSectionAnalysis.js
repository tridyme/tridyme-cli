import React, { useState, useEffect } from 'react';
import { Grid, Tabs, Tab, Box, Typography } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
// import CardElem from '../../Components/CardElem/CardElem';
import { makeStyles } from '@material-ui/core/styles';
import Saisie from './Scenes/Saisie/Saisie';
import Hypotheses from './Scenes/Hypotheses/Hypotheses';
import initialState from './Utils/initialState';
// import { TabContext, TabPanel } from '@material-ui/lab';
import Loads from './Scenes/Loads/Loads';
import Results from './Scenes/Results/Results';
import Aperçu from './Scenes/Aperçu/Aperçu';
import RectangularSection from './Utils/Calculations/RectangularSection';
import AppIcon from '../../EC2-Ferraillage.svg';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import { toast } from 'react-toastify';
import history from '../../history';
import axios from 'axios';

import { ButtonElem } from '@tridyme/react-components';
import { InputElem } from '@tridyme/react-components';
import { CardElem } from '@tridyme/react-components';
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles((theme) => ({
  root: {
    '& .MuiTableCell-root': {
      border: 'none', // Remove border for all table cells
    },
  },

  label: {
    fontFamily: 'sans-serif',
    fontSize: '14px',
    // textTransform:'lowercase'
  },

  tableCell: {
    lineHeight: '1.5', // Adjust the value as needed for desired line spacing
  },

  tableContainer: {
    border: '1px solid #000',
    marginBottom: '10px',
    padding: '10px',
    marginRight: theme.spacing(1),
    flex: '1',
  },

  tableTitle: {
    marginLeft: '0.5rem',
    fontSize: '16px',
    fontWeight: 'bolder',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `scrollable-auto-tab-${index}`,
    'aria-controls': `scrollable-auto-tabpanel-${index}`,
  };
}

const {
  REACT_APP_APPLICATION_NAME,
  REACT_APP_APPLICATION_API_URL,
  REACT_APP_PLATFORM_API_URL,
  REACT_APP_APPLICATION_ID,
} = process.env;

function RectangularSectionAnalysis({ match }) {
  const classes = useStyles();
  // const { modelId } = match.params;
  const user = JSON.parse(localStorage.getItem('user'));
  let userId;
  if (user != null) {
    userId = user['_id'];
  }

  const [state, setState] = useState(initialState);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modelId, setModelId] = useState(match.params?.modelId);

  useEffect(() => {
    const init = async () => {
      let actualState = {};
      if (modelId) {
        const model = await handleGetModel(modelId);
        actualState = model.data;
      } else {
        actualState = initialState;
      }
      const calculatedData = new RectangularSection(
        actualState.data,
      ).analysis();
      const updatedState = {
        ...actualState,
        data: {
          ...actualState.data,
          ...calculatedData,
        },
      };
      console.log('updatedState', updatedState);
      setState(updatedState);
      setLoading(false);
    };
    init();
  }, []);

  const handleAnalysis = async () => {
    try {
      const response = await fetch(
        `${REACT_APP_APPLICATION_API_URL}/api/analysis`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(state), // Envoie l'état en JSON
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newState = await response.json();
      console.log('newState', newState); // Traitez le résultat comme nécessaire
      if (newState?.data) {
        const calculatedData = new RectangularSection(newState.data).analysis();
        console.log('calculatedData ', calculatedData);
        const updatedState = {
          ...newState,
          data: {
            ...newState.data,
            ...calculatedData,
          },
        };
        console.log('updatedState ', updatedState);
        setState(updatedState);
      }
    } catch (err) {
      console.log("Erreur lors de l'envoi de l'état:", err);
    }
  };

  const handleGetModel = async (modelId) => {
    try {
      const response = await fetch(
        `${REACT_APP_PLATFORM_API_URL}/models/${modelId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newState = await response.json();
      return newState;
    } catch (err) {
      console.log('error when get models: ', err);
      return [];
    }
  };

  const handleChangeProjectData = (prop) => (event) => {
    const newData = {
      ...state.data,
      [prop]: {
        ...state.data[prop],
        value: event.target.value,
      },
    };
    const updatedState = {
      ...state,
      data: {
        ...state.data,
        ...newData,
      },
    };

    setState(updatedState);
  };

  const handleSave = async () => {
    console.log('STATE', state);
    // const platform = new Platform();
    // const data = state;
    try {
      const model = {
        /*    project: null, */
        name: state.data.projet.value,
        application: `${REACT_APP_APPLICATION_ID}`,
        data: state,
        user: String(userId),
      };
      console.log('model', model);
      if (modelId) {
        const updatedModel = { _id: modelId, ...model };
        const { data } = await axios.post(
          `${REACT_APP_PLATFORM_API_URL}/models/updateModel`,
          updatedModel,
        );
        console.log('Model updated', data);
      } else {
        const newModel = model;
        const { data } = await axios.post(
          `${REACT_APP_PLATFORM_API_URL}/models/addModel`,
          newModel,
        );

        const newModelId = data._id;
        history.push(
          `/applications/ID${REACT_APP_APPLICATION_ID}/models/${newModelId}`,
        );
        setModelId(newModelId);
        console.log('Model added', data);
      }
      toast.success('Projet enregistré', { autoClose: 3000 });
    } catch (err) {
      console.log(err);
      console.log('Model not saved');
      toast.error('Erreur : Projet Non enregistré', { autoClose: 3000 });
    }
  };

  const handleChangeState = (prop) => (event) => {
    console.log('event.target.type', event.target.type);
    const newData = {
      ...state.data,
      [prop]: {
        ...state.data[prop],
        value: Number(event.target.value),
      },
    };
    const calculatedData = new RectangularSection(newData).analysis();

    const updatedState = {
      ...state,
      data: {
        ...newData,
        ...calculatedData,
      },
    };
    console.log('updatedState ', updatedState);
    setState(updatedState);
  };

  const handleChangeTab = (event, newTab) => {
    setTab(newTab);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <CardElem
          elevation={0}
          title={
            <ListItem>
              <ListItemAvatar>
                <Avatar
                  alt={REACT_APP_APPLICATION_NAME}
                  src={AppIcon}
                  style={{
                    borderRadius: '0%',
                    cursor: 'pointer',
                    height: '2.5em',
                    width: '2.5em',
                    backgroundColor: '#E6F3FC',
                    borderRadius: '50px',
                  }}
                />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="h5" component="h2">
                    {REACT_APP_APPLICATION_NAME}
                  </Typography>
                }
              />
            </ListItem>
          }
        >
          <Grid container spacing={3}>
            <Grid item sm={6} style={{ textAlign: 'left' }}>
              {userId && (
                <FormControl className={classes.margin}>
                  <InputElem
                    data={{
                      description: "Nom de l'affaire",
                      value: state.data.projet.value,
                    }}
                    onChange={handleChangeProjectData('projet')}
                    props={{
                      disableUnderline: true,
                      disableInputAdornment: true,
                    }}
                    style={{ color: '#0082DE' }}
                  />
                </FormControl>
              )}
            </Grid>
            <Grid item sm={6} style={{ textAlign: 'right' }}>
              <ButtonElem
                label={'Calcul'}
                onClick={handleAnalysis}
                style={{
                  borderRadius: '0px',
                  backgroundColor: '#FFFFFF',
                  color: '#0082DE',
                  margin: '1em',
                  textTransform: 'none',
                }}
              />
              {userId && (
                <ButtonElem
                  label={'Sauvegarder'}
                  onClick={handleSave}
                  style={{
                    borderRadius: '0px',
                    backgroundColor: '#FFFFFF',
                    color: '#0082DE',
                    margin: '1em',
                    textTransform: 'none',
                  }}
                />
              )}
            </Grid>
            {/*               </>
            )} */}
            <Grid item xs={12}>
              {/* <TabContext value={values.tab} > */}
              <div
                style={{
                  flexGrow: 1,
                  width: '100%',
                }}
              >
                <Tabs
                  value={tab}
                  onChange={handleChangeTab}
                  variant="scrollable"
                  scrollButtons="auto"
                  aria-label="scrollable auto tabs example"
                  indicatorColor="primary"
                >
                  <Tab label="Hypothèses" {...a11yProps(0)} />
                  <Tab label="Saisie" {...a11yProps(1)} />
                  <Tab label="Calcul" {...a11yProps(2)} />
                  {/* <Tab label="Résultats"/> */}
                  <Tab label="Aperçu" {...a11yProps(3)} />
                </Tabs>
                {loading && userId ? (
                  <div className={classes.overlay}>
                    <CircularProgress />
                  </div>
                ) : (
                  <></>
                )}

                <TabPanel value={tab} index={0}>
                  <Hypotheses />
                </TabPanel>

                <TabPanel value={tab} index={1}>
                  <Saisie
                    state={state}
                    setState={setState}
                    handleChange={handleChangeState}
                  />
                </TabPanel>

                <TabPanel value={tab} index={2}>
                  <Loads
                    state={state}
                    setState={setState}
                    handleChange={handleChangeState}
                  />
                  {/* <Results state={state} setState={setState} handleChange={handleChangeState} /> */}
                </TabPanel>

                {/* {tab === 3 && (
                  <TabPanel value={tab} index={1}>
                    <Results state={state} setState={setState} handleChange={handleChangeState}/>
                  </TabPanel>
                )} */}

                <TabPanel value={tab} index={3}>
                  <Aperçu
                    state={state}
                    setState={setState}
                    handleChange={handleChangeState}
                  />
                </TabPanel>
              </div>
            </Grid>
          </Grid>
        </CardElem>
      </Grid>
    </Grid>
  );
}

export default RectangularSectionAnalysis;
