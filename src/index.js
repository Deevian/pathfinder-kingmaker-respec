import React from "react";
import { render } from "react-dom";

/**
 * Root file for the entire application.
 *
 * This index takes care of booting up the React app, as well as takes care of
 * making sure that the app is hot-reloadable.
 *
 * @see https://parceljs.org/hmr.html
 */
function renderApp() {
    // eslint-disable-next-line global-require
    const App = require("./components/App").default;

    render(React.createElement(App), document.querySelectorAll(".app")[0]);
}

renderApp();

if (module.hot) {
    module.hot.accept(renderApp);
}
