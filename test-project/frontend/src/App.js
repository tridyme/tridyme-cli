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
import Cfroides from './Views/Cfroides';
import DashboardIcon from '@material-ui/icons/Dashboard';
import LogoApp from './logo.svg';
import GetTheme from './theme';

const Menu = {
  MenuNavBar: [{ text: '', link: '', href: '', icon: '' }],
  MenuSideBarSup: [],
  MenuSideBarInf: [],
  MenuSideBarNotion: [],
};

const {
  REACT_APP_LOGO,
  REACT_APP_COMPANY,
  REACT_APP_APPLICATION_NAME,
  REACT_APP_APPLICATION_ID,
  REACT_APP_PLATFORM_URL,
} = process.env;

const App = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(
    () => createTheme(GetTheme({ prefersDarkMode })),
    [prefersDarkMode],
  );

  useEffect(() => {
    const init = async () => {
      const userInfo = localStorage.getItem('TowersServices_user');
      console.log('user', userInfo);
      const newUser = JSON.parse(userInfo);
      console.log('newUser', newUser);
    };
    init();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Helmet>
        <title>{`${REACT_APP_COMPANY} | Applications`}</title>
        <link rel="icon" type="image/png" href={REACT_APP_LOGO} sizes="16x16" />
      </Helmet>
      <BrowserRouter history={history}>
        <AppContainerElem
          title={
            <ListItem>
              <ListItemAvatar>
                <Avatar
                  alt={`${REACT_APP_APPLICATION_NAME}`}
                  src={LogoApp}
                  style={{ borderRadius: '0%' }}
                />
              </ListItemAvatar>
              <ListItemText primary={`${REACT_APP_APPLICATION_NAME}`} />
            </ListItem>
          }
          menu={Menu}
        >
          <Switch>
            <Route
              exact
              path={`/applications/ID${REACT_APP_APPLICATION_ID}`}
              component={Cfroides}
            />
            <Route
              exact
              path={`/applications/ID${REACT_APP_APPLICATION_ID}/models/:modelId?`}
              component={Cfroides}
            />
            <Route
              exact
              path={`/projects/:projectId/applications/ID${REACT_APP_APPLICATION_ID}/models/:modelId?`}
              component={Cfroides}
            />
            <Redirect
              from="/"
              to={`/applications/ID${REACT_APP_APPLICATION_ID}`}
              component={Cfroides}
            />
          </Switch>
        </AppContainerElem>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
