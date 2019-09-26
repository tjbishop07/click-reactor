import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useAuth } from './state/auth';
import { SnackbarProvider } from 'notistack';
import Provider from "./state/provider";
import Reactor from './components/Reactor';
import { databaseRef } from './config/firebase';
import * as firebase from 'firebase';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import MenuIcon from '@material-ui/icons/Menu';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import './styles/style.scss';
import { Container } from '@material-ui/core';
import ActivityLog from './components/ActivityLog';
import HUD from './components/Hud';
import Login from './components/Login';
import logo from './img/logo-transparent.png';
import { useListVals } from 'react-firebase-hooks/database';
import LinearProgress from '@material-ui/core/LinearProgress';
import Switch from '@material-ui/core/Switch';
import { withStyles } from '@material-ui/core/styles';
import Avatar from 'react-avatar';

// TODO: Cleanup!

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  text: {
    padding: theme.spacing(2, 2, 0),
  },
  paper: {
    paddingBottom: 50,
  },
  list: {
    marginBottom: theme.spacing(2),
  },
  subheader: {
    backgroundColor: theme.palette.background.paper,
  },
  appBar: {
    top: 'auto',
    bottom: 0,
    backgroundColor: '#000'
  },
  grow: {
    flexGrow: 1,
  },
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    color: '#ffffff',
    width: drawerWidth,
    background: 'none'
  },
  fabButton: {
    position: 'absolute',
    zIndex: 1,
    top: -30,
    left: 0,
    right: 0,
    margin: '0 auto'
  },
}));

export default function App(props) {

  const { container } = props;
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [activityLogOpen, setActivityLogOpen] = React.useState(false);
  const [gameStates, loadingGamestates] = useListVals(
    firebase.database().ref(`gameStates`).orderByChild(`score`).limitToLast(25)
  );
  const classes = useStyles();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  }

  const handleActivityLogToggle = () => {
    setActivityLogOpen(!activityLogOpen);
  }

  const addReactionItem = () => {
    if (user) {
      databaseRef.child(`userReactors/${user.uid}`).push().set({
        clicks: 0,
        energy: 0,
        reactionStarted: false,
        reactionStartedAt: 0,
        extinguished: false,
        extinguishedAt: 0,
        gameStartedAt: firebase.database.ServerValue.TIMESTAMP,
        cps: 0,
        id: null,
        energySources: [],
      });
    }
  }

  const drawer = (
    <React.Fragment>
      <div className={classes.toolbar}>
        <img src={logo} alt="Click Reactors" className="logo" />
      </div>
      <Divider />
      <List>
        {['Settings'].map((text, index) => (
          <ListItem button key={text}>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {['About'].map((text, index) => (
          <ListItem button key={text}>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </React.Fragment>
  );

  const LogSwitch = withStyles(theme => ({
    root: {
      width: 42,
      height: 26,
      padding: 0,
      margin: theme.spacing(1),
    },
    switchBase: {
      padding: 1,
      '&$checked': {
        transform: 'translateX(16px)',
        color: theme.palette.common.white,
        '& + $track': {
          backgroundColor: '#ad5389',
          opacity: 1,
          border: 'none',
        },
      },
      '&$focusVisible $thumb': {
        color: '#ad5389',
        border: '6px solid #fff',
      },
    },
    thumb: {
      width: 24,
      height: 24,
    },
    track: {
      borderRadius: 26 / 2,
      border: `1px solid ${theme.palette.grey[400]}`,
      backgroundColor: theme.palette.grey[50],
      opacity: 1,
      transition: theme.transitions.create(['background-color', 'border']),
    },
    checked: {},
    focusVisible: {},
  }))(({ classes, ...props }) => {
    return (
      <Switch
        focusVisibleClassName={classes.focusVisible}
        classes={{
          root: classes.root,
          switchBase: classes.switchBase,
          thumb: classes.thumb,
          track: classes.track,
          checked: classes.checked,
        }}
        {...props}
      />
    );
  });

  return (
    <div className={classes.root}>
      <CssBaseline />

      {loadingGamestates ? <LinearProgress style={{ flexGrow: 1 }} /> : null}

      <ul className="reactors-bg-container">
        {
          gameStates.reverse().map((r, index) => (
            <li key={index}>
              {r.fullName ? r.fullName : 'Anonymous'} &nbsp;&nbsp;
            <strong>{r.score.toLocaleString()}</strong>
            </li>
          ))
        }
      </ul>

      {(user) ? <ActivityLog isOpen={activityLogOpen}></ActivityLog> : ''}
      <nav className="sidebar">
        <Drawer
          style={{ background: 'none' }}
          container={container}
          variant="temporary"
          anchor={'left'}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          classes={{
            paper: 'sidebar',
          }}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          {drawer}
        </Drawer>
      </nav>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <Provider>
          <SnackbarProvider
            maxSnack={1}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <Container>
              <HUD />
              {user ? <Reactor /> : <Login />}
            </Container>
          </SnackbarProvider>
        </Provider >
      </main>
      <AppBar position="fixed" color="primary" className={classes.appBar}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="open drawer" onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
          {user ?
            <Fab color="secondary" aria-label="add" className={classes.fabButton} onClick={() => addReactionItem()}>
              <AddIcon />
            </Fab>
            : null}
          <div className={classes.grow} />
          {user ?
            <React.Fragment>
              <LogSwitch
                checked={activityLogOpen}
                onChange={() => handleActivityLogToggle()}
                value="activityLog"
              />
            </React.Fragment>
            : null}
        </Toolbar>
      </AppBar>
    </div >
  );

}