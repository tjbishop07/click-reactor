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

export default function HUD() {

  const context = useContext(GameContext);
  const { user, initializing } = useAuth();
  const [nameModalOpen, setNameModalOpen] = React.useState(false);
  const [fullName, setFullName] = React.useState(null);

  useEffect(() => {
    if (context.data.fullName) {
      setFullName(context.data.fullName);
    }
  }, [context.data.fullName]);

  const handleInputChange = e => {
    const {name, value} = e.target
    setFullName(value);
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
          <h4 className="username" onClick={() => { setNameModalOpen(true); }}>PLAYER: {fullName}</h4>
          <h4 className="score">SCORE: {context.data.score < 0 ? '0' : context.data.score.toLocaleString()}</h4>
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
          <Button onClick={() => setNameModalOpen(!nameModalOpen)} color="primary">
            Cancel
          </Button>
          <Button onClick={() => { context.updateFullName(fullName); setNameModalOpen(false); }} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}