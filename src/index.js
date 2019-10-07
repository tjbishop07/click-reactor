import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import TagManager from 'react-gtm-module'
import './styles/index.scss';

const tagManagerArgs = {
    gtmId: 'GTM-5F7T2ZF'
}

TagManager.initialize(tagManagerArgs)
ReactDOM.render(<App />, document.getElementById("root"));

serviceWorker.register({
    onUpdate: onUpdateHandler
});

function onUpdateHandler(registration) {

    // Make sure that any new version of a service worker will take over the page 
    // and become activated immediately.
    const waitingServiceWorker = registration.waiting;
    if (waitingServiceWorker) {
        waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
    }

    const link = document.createElement("a");
    link.classList.add("update-notification");
    link.setAttribute("href", "#");
    link.innerHTML = "Update is available. Click here to install.";

    link.addEventListener("click", e => {
        e.preventDefault();
        window.location.reload(true);
    });

    console.log('ON UPDATE LINK', link);
    document.querySelector('body').appendChild(link);
}