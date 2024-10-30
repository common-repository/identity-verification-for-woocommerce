import React from "react";
import { render } from "react-dom";
import App from "components/App";
// seems silly, but the <App /> component needs to use the useLocation hook
// which is only available in children of the <Router />
import { HashRouter as Router } from "react-router-dom";

const mount = document.getElementById("real-id-mount");
render(
  <Router>
    <App />
  </Router>,
  mount
);
