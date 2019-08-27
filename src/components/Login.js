import React, { useEffect, Fragment, useState } from "react";
import GameContext from "../state/context";
import * as firebase from 'firebase';
import * as firebaseui from 'firebaseui';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import '../styles/login.scss';

export default function Login() {

    const [showLogin, setShowLogin] = useState(true);

    useEffect(() => {
        // NOTE: Let the UI render before attaching Firebase UI elements. 
        // TODO: Research a better way to do this. Should not need to use timer to wait for UI
        var ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth());
        setTimeout(() => {
            if (!firebase.auth().currentUser) {
                ui.start('#firebaseui-auth-container', {
                    callbacks: {
                        uiShown: function () {
                            document.getElementById('loader').style.display = 'none';
                        }
                    },
                    signInSuccessUrl: '/',
                    signInOptions: [
                        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                        firebase.auth.PhoneAuthProvider.PROVIDER_ID,
                        firebase.auth.EmailAuthProvider.PROVIDER_ID
                    ]
                });
            }
        }, 2000);
    }, []);

    function signInAnon() {
        setShowLogin(false);
        firebase.auth().signInAnonymously();
    };

    return (
        <GameContext.Consumer>
            {context => (
                <Fragment>
                    <div className="login-container">
                        {showLogin ?
                            <div>
                                <Button className="playNow" size="large" color="primary" fullWidth variant="contained" onClick={() => { signInAnon(); }}>Play Now!</Button>
                                <Divider variant="middle" className="divider-login" />
                            </div>
                            : ''}
                        <div id="firebaseui-auth-container"></div>
                        <CircularProgress id="loader" className="loader" />
                    </div>
                </Fragment>
            )}
        </GameContext.Consumer>
    );

};
