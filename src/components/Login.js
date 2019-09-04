import React, { useEffect, Fragment, useState } from "react";
import { useSpring, animated } from 'react-spring'
import GameContext from "../state/context";
import * as firebase from 'firebase';
import * as firebaseui from 'firebaseui';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import '../styles/login.scss';

export default function Login() {

    const [state, toggle] = useState(true)

    const { x } = useSpring({
        from: { x: 0 },
        x: state ? 1 : 0,
        config: { duration: 1000 }
    })

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
        toggle(!state);
        firebase.auth().signInAnonymously();
    };

    return (
        <GameContext.Consumer>
            {context => (
                <Fragment>
                    <div className="login-container">

                        <animated.div style={{
                            opacity: x.interpolate({ range: [0, 1], output: [0.3, 1] }),
                            transform: x
                                .interpolate({
                                    range: [0, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 1],
                                    output: [1, 0.97, 0.9, 1.1, 0.9, 1.1, 1.03, 1]
                                })
                                .interpolate(x => `scale(${x})`)
                        }}>
                            <Button className="playNow" size="large" color="primary" fullWidth variant="contained" onClick={() => { signInAnon(); }}>Play Now!</Button>
                            <Divider variant="middle" className="divider-login" />
                        </animated.div>

                        <div id="firebaseui-auth-container"></div>
                        <CircularProgress id="loader" className="loader" />
                    </div>
                </Fragment>
            )}
        </GameContext.Consumer>
    );

};
