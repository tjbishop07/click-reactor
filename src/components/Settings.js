import React, { useState, useEffect, Fragment, useContext, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import GameContext from "../state/context";
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import { green } from '@material-ui/core/colors';
import Fab from '@material-ui/core/Fab';
import CheckIcon from '@material-ui/icons/Check';
import SaveIcon from '@material-ui/icons/Save';
import Toolbar from '@material-ui/core/Toolbar';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing(2),
    padding: theme.spacing(2, 2, 5, 2)
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
          <Paper className={classes.root}>
            <TextField
              label="Name"
              className={classes.input}
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your name"
              inputProps={{ 'aria-label': 'Your name' }}
            />
          </Paper>
          <Toolbar>
            <div className={classes.wrapper}>
              <Fab color="secondary" aria-label="save" className={classes.fabButton} onClick={saveFullName(context)}>
                {success ? <CheckIcon /> : <SaveIcon />}
              </Fab>
              {loading && <CircularProgress size={68} className={classes.fabProgress} />}
            </div>
          </Toolbar>
        </Fragment>
      )}
    </GameContext.Consumer>
  );

}