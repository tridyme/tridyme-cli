import React, { Component, useState, useEffect, useMemo } from 'react';
import Helmet from 'react-helmet';
import {
  Router,
  Switch,
  Route,
  Redirect,
  BrowserRouter,
} from 'react-router-dom';
import './App.css';
import history from './history';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { ThemeProvider, createTheme } from '@material-ui/core/styles';
import AppContainerElem from './Components/AppContainerElem';
import {
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from '@material-ui/core';
import Icon from './logo.svg';
import Logo from './logo.svg';
import RectangularSectionAnalysis from './Views/RectangularSectionAnalysis/RectangularSectionAnalysis';
import DashboardIcon from '@material-ui/icons/Dashboard';
import LogoApp from './EC2-Ferraillage.svg';
import GetTheme from './theme';

const Menu = {
  MenuNavBar: [{ text: '', link: '', href: '', icon: '' }],
  MenuSideBarSup: [
    {
      text: 'Plateforme',
      link: '',
      href: 'http://socotec.tridyme.com/dashboard',
      icon: <DashboardIcon />,
    },
  ],
  MenuSideBarInf: [
    {
      text: 'GitHub',
      link: '',
      href: 'https://github.com/Igor-TriDyme/bolts-app.git',
      icon: 'code',
    },
  ],

  MenuSideBarNotion: [
    {
      text: 'Documentation',
      link: '',
      href: 'https://www.notion.so/tridyme/CB71-RectangularSection-Calcul-de-pannes-et-poutres-en-bois-3da4109cc8194f47aade5d4cbb554273',
      icon: 'code',
    },
  ],
};

const {
  REACT_APP_LOGO,
  REACT_APP_COMPANY,
  REACT_APP_APPLICATION_ID,
  REACT_APP_PLATFORM_URL,
} = process.env;

const App = () => {
  console.log('REACT_APP_APPLICATION_ID', REACT_APP_APPLICATION_ID);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(
    () => createTheme(GetTheme({ prefersDarkMode })),
    [prefersDarkMode],
  );

  useEffect(() => {
    const init = async () => {
      const userInfo = localStorage.getItem('user');
      console.log('user', userInfo);
      const newUser = JSON.parse(userInfo);
      console.log('newUser', newUser);
    };
    init();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Helmet>
        <title>{`TriDyme | Applications`}</title>
        <link rel="icon" type="image/png" href={Logo} sizes="16x16" />
      </Helmet>
      <BrowserRouter history={history}>
        <AppContainerElem
          title={
            <ListItem>
              <ListItemAvatar>
                <Avatar
                  alt={`EC2-Ferraillage`}
                  src={LogoApp}
                  style={{ borderRadius: '0%' }}
                />
              </ListItemAvatar>
              <ListItemText primary={`EC2- Ferraillage`} />
            </ListItem>
          }
          menu={Menu}
        >
          <Switch>
            <Route
              exact
              path={`/applications/ID${REACT_APP_APPLICATION_ID}`}
              component={RectangularSectionAnalysis}
            />
            <Route
              exact
              path={`/applications/ID${REACT_APP_APPLICATION_ID}/models/:modelId`}
              component={RectangularSectionAnalysis}
            />
            <Redirect
              from="/"
              to={`/applications/ID${REACT_APP_APPLICATION_ID}`}
              component={RectangularSectionAnalysis}
            />
          </Switch>
        </AppContainerElem>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
