import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import "react-phone-number-input/style.css";
import "@shopify/polaris/styles.css";
import "react-toggle/style.css";
import "../styles/styles.css";
import { AppProvider, Frame, Toast, Banner } from "@shopify/polaris";
import get from "lodash/get";
import translations from "@shopify/polaris/locales/en.json";
import { getCurrentShop } from "services/wpApi";
import LicensePrompt from "components/LicensePrompt";
import Onboarding from "components/Onboarding";
import { ShopProvider } from "providers/ShopProvider";
import Home from "components/Home";
import NewCheck from "components/NewCheck";
import Settings from "components/Settings";
import CheckDetails from "components/CheckDetails";
import initAmplitude from "components/initAmplitude";
import { ToastProvider } from "providers/ToastProvider";
import useCrispChat from "hooks/useCrispChat";
import {
  HashRouter as Router,
  Switch,
  Route,
  Link,
  NavLink,
  useLocation,
} from "react-router-dom";
import cx from "classnames";
import LoadingScreen from "components/LoadingScreen";
import SandboxModeAlert from "./SandboxModeAlert";
import Unauthorized from "./Unauthorized";
import { RiExternalLinkLine as ExternalLinkIcon } from "react-icons/ri";

// Let’s clear the WP menu content IF the user is on a Real ID react page
//   that way the portal will override the sub menus and we'll have nice routing without refreshes
//   but still let PHP render the menus when not in the app context
const menuPage = document.getElementById("toplevel_page_real-id");
const reactRoot = document.getElementById("real-id-mount");
if (reactRoot) {
  menuPage.innerText = "";
}

function Error() {
  return (
    <Banner status="error">
      Sorry, there was an issue loading your information. Please refresh the
      page.
    </Banner>
  );
}

function Menu(props) {
  return ReactDOM.createPortal(props.children, menuPage);
}

function NavItemLink({ to, className, children }) {
  const location = useLocation();

  return (
    <li className={cx(className, { current: location.pathname === to })}>
      <NavLink to={to} className={className} activeClassName="current">
        {children}
      </NavLink>
    </li>
  );
}

function TopNavLink({ to, children }) {
  const location = useLocation();
  return (
    <NavLink to={to} activeClassName="current">
      <div
        className={`nav-tab ${
          location.pathname === to ? "nav-tab-active" : ""
        }`}
      >
        {children}
      </div>
    </NavLink>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState(null);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(false);
  const location = useLocation();
  console.log(location);

  useEffect(() => {
    getCurrentShop()
      .then(({ data }) => {
        setLoading(false);
        setShop(data);
        // if the shop has opt'd into analytics, enable it
        if (get(data, "settings.acceptAnalytics", false)) {
          initAmplitude(data.shopName);
        }
      })
      .catch((e) => {
        switch (e.response.status) {
          case 401:
            break;
          default:
            setToast("Unable to retrieve your store settings at this time.");
            setError("unable_to_retrieve_shop");
            break;
        }

        setLoading(false);
      });
  }, []);

  useCrispChat(shop);

  return (
    <AppProvider translations={translations}>
      <ToastProvider value={setToast}>
        <ShopProvider value={{ shop, setShop }}>
          <Menu>
            <Link
              to="/"
              className="wp-has-submenu wp-has-current-submenu wp-menu-open menu-top menu-icon-generic toplevel_page_real-id menu-top-first menu-top-last"
              aria-haspopup="false"
            >
              <div className="wp-menu-arrow">
                <div></div>
              </div>
              <div
                className="wp-menu-image svg"
                ref={(node) => {
                  // this seems batshit but it's necessary because since React v15 you can't inline "!important" anymore
                  // https://stackoverflow.com/questions/23074748/important-inline-styles-in-react
                  if (node) {
                    node.style.setProperty(
                      "background-image",
                      'url("data:image/svg+xml;base64,PHN2ZyBjbGFzc05hbWU9ImgtOCB3LWF1dG8gc206aC0xMCIgZmlsbD0iI2E3YWFhZCIgdmlld0JveD0iMCAwIDIwIDIwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGZpbGxSdWxlPSJldmVub2RkIiBkPSJNNi42MjUgMi42NTVBOSA5IDAgMDExOSAxMWExIDEgMCAxMS0yIDAgNyA3IDAgMDAtOS42MjUtNi40OTIgMSAxIDAgMTEtLjc1LTEuODUzek00LjY2MiA0Ljk1OUExIDEgMCAwMTQuNzUgNi4zNyA2Ljk3IDYuOTcgMCAwMDMgMTFhMSAxIDAgMTEtMiAwIDguOTcgOC45NyAwIDAxMi4yNS01Ljk1MyAxIDEgMCAwMTEuNDEyLS4wODh6IiBjbGlwUnVsZT0iZXZlbm9kZCIgLz48cGF0aCBmaWxsUnVsZT0iZXZlbm9kZCIgZD0iTTUgMTFhNSA1IDAgMTExMCAwIDEgMSAwIDExLTIgMCAzIDMgMCAxMC02IDBjMCAxLjY3Ny0uMzQ1IDMuMjc2LS45NjggNC43MjlhMSAxIDAgMTEtMS44MzgtLjc4OUE5Ljk2NCA5Ljk2NCAwIDAwNSAxMXptOC45MjEgMi4wMTJhMSAxIDAgMDEuODMxIDEuMTQ1IDE5Ljg2IDE5Ljg2IDAgMDEtLjU0NSAyLjQzNiAxIDEgMCAxMS0xLjkyLS41NThjLjIwNy0uNzEzLjM3MS0xLjQ0NS40OS0yLjE5MmExIDEgMCAwMTEuMTQ0LS44M3oiIGNsaXBSdWxlPSJldmVub2RkIiAvPjxwYXRoIGZpbGxSdWxlPSJldmVub2RkIiBkPSJNMTAgMTBhMSAxIDAgMDExIDFjMCAyLjIzNi0uNDYgNC4zNjgtMS4yOSA2LjMwNGExIDEgMCAwMS0xLjgzOC0uNzg5QTEzLjk1MiAxMy45NTIgMCAwMDkgMTFhMSAxIDAgMDExLTF6IiBjbGlwUnVsZT0iZXZlbm9kZCIgLz48L3N2Zz4=")',
                      "important"
                    );
                  }
                }}
              >
                <br />
              </div>
              <div className="wp-menu-name">ID Checks</div>
            </Link>
            <ul className="wp-submenu wp-submenu-wrap">
              <li className="wp-submenu-head" aria-hidden="true">
                ID Checks
              </li>
              <NavItemLink to="/" className="wp-first-item">
                ID Checks
              </NavItemLink>
              <NavItemLink to="/new" className="">
                New ID Check
              </NavItemLink>
              <NavItemLink to="/settings" className="">
                Settings
              </NavItemLink>
              <li>
                <a
                  href="https://getverdict.com/help"
                  target="_blank"
                  className="nav-link"
                >
                  Help
                </a>
              </li>
            </ul>
          </Menu>
          <Frame>
            <LoadingScreen isLoading={loading}>
              {!shop && error && <Error />}
              {/* Unauthenticated routes */}
              {shop && !shop?.settings?.completedOnboarding && (
                <Switch>
                  <Route path="*">
                    <Onboarding />
                  </Route>
                </Switch>
              )}
              {/* Authenticated routes */}
              {shop && shop?.settings?.completedOnboarding && (
                <>
                  <SandboxModeAlert />
                  <nav className="nav-tab-wrapper">
                    <TopNavLink to="/">Home</TopNavLink>
                    <TopNavLink to="/new">Create ID Check</TopNavLink>
                    <TopNavLink to="/settings">Settings</TopNavLink>
                    <a
                      className="nav-tab"
                      target="_blank"
                      href="https://getverdict.com/help"
                    >
                      Help &nbsp;
                      <ExternalLinkIcon />
                    </a>
                  </nav>
                  <Switch>
                    <Route path="/new" exact>
                      <NewCheck />
                    </Route>
                    <Route path="/settings" exact>
                      <Settings />
                    </Route>
                    <Route path="/checks/:checkId" exact>
                      <CheckDetails />
                    </Route>
                    <Route path="/:search?/:statuses?/:page?" exact>
                      {shop && <Home />}
                    </Route>
                  </Switch>
                </>
              )}
              {/* Unauthorized routes */}
              {!shop && (
                <Switch>
                  <Route path="*">
                    <Unauthorized />
                  </Route>
                </Switch>
              )}
            </LoadingScreen>
            {toast && (
              <Toast content={toast} onDismiss={() => setToast(false)} />
            )}
          </Frame>
        </ShopProvider>
      </ToastProvider>
    </AppProvider>
  );
}
