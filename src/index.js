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

    const waitingServiceWorker = registration.waiting;
    if (waitingServiceWorker) {
        waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
    }

    const link = document.createElement("a");
    link.classList.add("update-notification");
    link.setAttribute("href", "#");
    link.innerHTML = "An update is available. Click here to install...";

    link.addEventListener("click", e => {
        e.preventDefault();
        window.location.reload(true);
    });

    document.querySelector('body').appendChild(link);
}