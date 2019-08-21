import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useAuth } from './state/auth';

import Provider from "./state/Provider";
import Reactor from './components/Reactor';
import Welcome from './components/Welcome';
import HUD from "./components/Hud";
import Settings from "./components/Settings";

import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Container from '@material-ui/core/Container';
import Fab from '@material-ui/core/Fab';
import SettingsIcon from '@material-ui/icons/Settings';

const useStyles = makeStyles(theme => ({
  appBar: {
    position: 'relative',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: '100%'
  },
  dense: {
    marginTop: 19,
  },
  menu: {
    width: 200,
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function App() {

  const [open, setOpen] = useState(false);
  const classes = useStyles();
  const { initializing, user } = useAuth();
  if (initializing) {
    return <div>Loading</div>
  }

  let welcomeComponent = <Welcome />;

  function handleClose() {
    setOpen(false);
  }

  return (
    <Provider>
      <div className="App">
        <Fab aria-label="Settings" className="fab-settings-reaction" color="primary" onClick={() => setOpen(true)}>
          <SettingsIcon />
        </Fab>
        <h1 className="title">Click Reactor</h1>
        <HUD />
        {!user ? welcomeComponent : ''}
        <Reactor />
      </div>
      <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="close" onClick={handleClose}>
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Settings
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg">
          <Settings />
        </Container>
      </Dialog>
    </Provider>
  )
}