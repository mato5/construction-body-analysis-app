import "./App.scss";

import { Viewer, ViewerExtension } from "@bentley/itwin-viewer-react";
import React, { Fragment, useEffect, useState } from "react";

import AuthorizationClient from "./AuthorizationClient";
import { Header } from "./Header";
import {
  IModelApp,
  IModelConnection,
  NotifyMessageDetails,
  OutputMessagePriority,
} from "@bentley/imodeljs-frontend";
import { GeomUtils } from "./utilities/GeomUtils";
import { InitialForm } from "./components/InitialForm";
import { CustomCurve } from "./utilities/CustomCurve";

const App: React.FC = () => {
  const [isAuthorized, setIsAuthorized] = useState(
    AuthorizationClient.oidcClient
      ? AuthorizationClient.oidcClient.isAuthorized
      : false
  );
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [isConnected, setIsConnected] = useState(false);

  const [curves, setCurves] = useState(() => {
    const result: CustomCurve[] = [];
    return result;
  });

  useEffect(() => {
    const initOidc = async () => {
      if (!AuthorizationClient.oidcClient) {
        await AuthorizationClient.initializeOidc();
      }

      try {
        // attempt silent signin
        await AuthorizationClient.signInSilent();
        setIsAuthorized(AuthorizationClient.oidcClient.isAuthorized);
      } catch (error) {
        // swallow the error. User can click the button to sign in
      }
    };
    initOidc().catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    if (!process.env.REACT_APP_TEST_CONTEXT_ID) {
      throw new Error(
        "Please add a valid context ID in the .env file and restart the application"
      );
    }
    if (!process.env.REACT_APP_TEST_IMODEL_ID) {
      throw new Error(
        "Please add a valid iModel ID in the .env file and restart the application"
      );
    }
  }, []);

  useEffect(() => {
    if (isLoggingIn && isAuthorized) {
      setIsLoggingIn(false);
    }
  }, [isAuthorized, isLoggingIn]);

  const onLoginClick = async () => {
    setIsLoggingIn(true);
    await AuthorizationClient.signIn();
  };

  const onLogoutClick = async () => {
    setIsLoggingIn(false);
    await AuthorizationClient.signOut();
    setIsAuthorized(false);
  };

  const iModelConnected = async (connection: IModelConnection) => {
    const curvesObtained = await GeomUtils.obtainCurves(connection);
    if (curvesObtained.length === 0) {
      IModelApp.notifications.outputMessage(
        new NotifyMessageDetails(
          OutputMessagePriority.Error,
          "Unable to obtain linear geometry details from this model!"
        )
      );
      return;
    }
    setCurves(curvesObtained);
    setIsConnected(true);
  };

  return (
    <div>
      <Header
        handleLogin={onLoginClick}
        loggedIn={isAuthorized}
        handleLogout={onLogoutClick}
        iModelConnected={isConnected}
        handleDialog={() => InitialForm.open(curves)}
      />
      {isLoggingIn ? (
        <span>"Logging in....."</span>
      ) : (
        isAuthorized && (
          <Fragment>
            <Viewer
              contextId={process.env.REACT_APP_TEST_CONTEXT_ID ?? ""}
              iModelId={process.env.REACT_APP_TEST_IMODEL_ID ?? ""}
              authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
              onIModelConnected={iModelConnected}
            />
          </Fragment>
        )
      )}
    </div>
  );
};

export default App;
