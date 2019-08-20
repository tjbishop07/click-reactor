import React, { useState, useEffect, Fragment, useContext, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import GameContext from "../state/context";
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import { green } from '@material-ui/core/colors';
import Fab from '@material-ui/core/Fab';
import CheckIcon from '@material-ui/icons/Check';
import SaveIcon from '@material-ui/icons/Save';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '40px'
  },
  appBar: {
    top: 'auto',
    bottom: 0,
  },
  fabButton: {
    position: 'absolute',
    zIndex: 1,
    top: -30,
    left: 0,
    right: 0,
    margin: '0 auto',
  },
  input: {
    flex: 1,
  },
  fabProgress: {
    color: green[500],
    position: 'absolute',
    top: -35,
    left: '50%',
    zIndex: 1,
    marginLeft: -34
  },
  wrapper: {
    position: 'relative',
    width: '100%',
    marginTop: '-30px'
  },
}));

export default function Settings() {

  const context = useContext(GameContext);
  const timer = useRef();
  const classes = useStyles();
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const saveFullName = context => e => {
    context.updateFullName(fullName);
    setSuccess(false);
    setLoading(true);

    // NOTE: This will likley change in the future. Right now let's mock some wait time...
    timer.current = setTimeout(() => {
      setSuccess(true);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    setFullName(context.data.fullName);
  }, [...Object.values(context)]);

  return (
    <GameContext.Consumer>
      {context => (
        <Fragment>
          <CssBaseline />
          <div className={classes.root}>
            <TextField
              label="Name"
              variant="outlined"
              className={classes.input}
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your name"
              inputProps={{ 'aria-label': 'Your name' }}
            />
          </div>
          <AppBar position="fixed" color="primary" className={classes.appBar}>
            <Toolbar>
              <div className={classes.wrapper}>
                <Fab color="secondary" aria-label="save" className={classes.fabButton} onClick={saveFullName(context)}>
                  {success ? <CheckIcon /> : <SaveIcon />}
                </Fab>
                {loading && <CircularProgress size={68} className={classes.fabProgress} />}
              </div>
            </Toolbar>
          </AppBar>
        </Fragment>
      )}
    </GameContext.Consumer>
  );

}