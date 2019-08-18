import React, { useEffect, Fragment } from "react";
import GameContext from "../state/context";
import * as firebase from 'firebase';
import * as firebaseui from 'firebaseui';
import Drawer from '@material-ui/core/Drawer';

export default function Login() {

    useEffect(() => {
        // NOTE: Let the UI render before attaching Firebase UI elements. 
        // TODO: Research a better way to do this. Should not need to use timer to wait for UI
        setTimeout(() => {
            var ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth());
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
        }, 1000);
    }, []);

    return (
        <GameContext.Consumer>
            {context => (
                <Fragment>

                    <Drawer anchor="bottom" open={true}>
                        <div className={`login-container`}>
                            <div id="firebaseui-auth-container"></div>
                            <div id="loader">Loading...</div>
                        </div>
                    </Drawer>

                </Fragment>
            )}
        </GameContext.Consumer>
    );
};
