import React from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useAuth } from './state/auth';
import { SnackbarProvider } from 'notistack';
import Provider from "./state/provider";
import Reactor from './components/Reactor';
import { databaseRef } from './config/firebase';
import * as firebase from 'firebase';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MailIcon from '@material-ui/icons/Mail';
import MenuIcon from '@material-ui/icons/Menu';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import SearchIcon from '@material-ui/icons/Search';
import MoreIcon from '@material-ui/icons/MoreVert';
import './styles/style.scss';
import { Container } from '@material-ui/core';

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
    width: drawerWidth,
  },
  fabButton: {
    position: 'absolute',
    zIndex: 1,
    top: -30,
    left: 0,
    right: 0,
    margin: '0 auto',
  },
}));

export default function App(props) {

  const { container } = props;
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const classes = useStyles();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  }

  const addReactionItem = () => {
    // if (reactors.filter(r => !r.extinguished).length < 1) {
    databaseRef.child(`userReactors/${user.uid}`).push().set({
      clicks: 0,
      energy: 0,
      reactionStarted: false,
      reactionStartedAt: 0,
      extinguished: false,
      extinguishedAt: 0,
      gameStartedAt: firebase.database.ServerValue.TIMESTAMP,
      cps: 0,
      energySources: [],
    });
    // } else {
    //   showMessage('You cannot create more reactions at this time.', 'error');
    // }
  }

  const drawer = (
    <React.Fragment>
      <div className={classes.toolbar}>
        <Typography variant="h1" noWrap className={`logo`}>
          C/R
      </Typography>
      </div>
      <Divider />
      <List>
        {['Settings'].map((text, index) => (
          <ListItem button key={text}>
            <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {['About'].map((text, index) => (
          <ListItem button key={text}>
            <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </React.Fragment>
  );

  return (
    <div className={classes.root}>
      <CssBaseline />
      {/* <AppBar position="fixed" className={classes.appBar}>
        <Toolbar> */}
      {/* <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={handleDrawerToggle}
        className={classes.menuButton}>
        <MenuIcon />
      </IconButton> */}
      {/* <HUD /> */}
      {/* </Toolbar>
      </AppBar> */}
      <nav className={classes.drawer}>
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        {/* <Hidden smUp implementation="css"> */}
        <Drawer
          container={container}
          variant="temporary"
          anchor={'left'}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          classes={{
            paper: classes.drawerPaper,
          }}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          {drawer}
        </Drawer>
        {/* </Hidden> */}
        {/* <Hidden xsDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            open
          >
            {drawer}
          </Drawer>
        </Hidden> */}
      </nav>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <Provider>
          <SnackbarProvider
            maxSnack={1}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
            <Container>
              {user ? <Reactor /> : ''}
            </Container>
          </SnackbarProvider>
        </Provider >
      </main>
      <AppBar position="fixed" color="primary" className={classes.appBar}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="open drawer" onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
          <Fab color="secondary" aria-label="add" className={classes.fabButton} onClick={() => addReactionItem()}>
            <AddIcon />
          </Fab>
          <div className={classes.grow} />
          <IconButton color="inherit">
            <SearchIcon />
          </IconButton>
          <IconButton edge="end" color="inherit">
            <MoreIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    </div >
  );

}