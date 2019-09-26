import React, { useState, useEffect, useContext } from 'react';
import GameContext from "../state/context";
import { useAuth } from '../state/auth';
import Grid from '@material-ui/core/Grid';
import Avatar from 'react-avatar';
import '../styles/hud.scss';
import logo from '../img/logo-transparent.png';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useSnackbar } from 'notistack';

export default function HUD() {

  const context = useContext(GameContext);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { user, initializing } = useAuth();
  const [nameModalOpen, setNameModalOpen] = React.useState(false);
  const [fullName, setFullName] = React.useState(null);

  useEffect(() => {
    if (context.data.fullName) {
      setFullName(context.data.fullName);
    }
  }, [context.data.fullName]);

  const handleInputChange = e => {
    const { name, value } = e.target
    setFullName(value);
  }

  const saveFullName = () => {
    if (fullName.length > 50) {
      showMessage('Your name cannot be greater than 50 characters.', 'error');
      return;
    }
    context.updateFullName(fullName);
    setNameModalOpen(false);
  }

  const showMessage = (message, variant) => {
    enqueueSnackbar(message,
      {
        variant: variant,
        action:
          <Button onClick={() => { closeSnackbar() }}>
            {'OK'}
          </Button>
      });
  }

  return (

    <div className="hud-container">
      <Grid container spacing={3}>
        <Grid item>
          <img src={logo} alt="Click Reactors" className="logo" />
        </Grid>
        <Grid item>
          <Avatar size="35" className="avatar" name={context.data.fullName ? context.data.fullName : (user ? (user.displayName ? user.displayName : `Anonymous`) : 'N/A')} />
        </Grid>
        <Grid item>
          { !user ? 'Welcome to Click Reactors.' : <h4 className="username" onClick={() => { setNameModalOpen(true); }}>PLAYER: {fullName}</h4> }
          <h4 className="score">SCORE: {context.data.score < 0 ? '0' : context.data.score}</h4>
        </Grid>
        <Grid>
        </Grid>
      </Grid>
      <Dialog open={nameModalOpen} onClose={() => setNameModalOpen(!nameModalOpen)} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Name</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Want to get recognized on the leaderboard? Tell us your name...
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setNameModalOpen(false); setFullName(context.data.fullName) }} color="primary">
            Cancel
          </Button>
          <Button onClick={() => saveFullName()} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}