import React, { Fragment } from "react";
import { Container } from "semantic-ui-react";
import NavBar from "./NavBar";
import { observer } from "mobx-react-lite";
import { Outlet, useLocation } from "react-router-dom";
import HomePage from "../../features/Home/HomePage";
import { ToastContainer } from "react-toastify";

function App() {
  const location = useLocation();
  //replace activitydashboard with outlet in regard to use routing.
  return (
    <Fragment>
      <ToastContainer position="bottom-right" hideProgressBar theme="colored" />
      {location.pathname === "/" ? (
        <HomePage />
      ) : (
        <Fragment>
          <NavBar />
          <Container style={{ marginTop: "7em" }}>
            {/* <ActivityDashboard /> */}
            <Outlet />
          </Container>
        </Fragment>
      )}
    </Fragment>
  );
}

export default observer(App);
