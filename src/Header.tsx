import { Button, ButtonType } from "@bentley/ui-core";
import React from "react";

import styles from "./Header.module.scss";

interface HeaderProps {
  handleLogin: () => void;
  handleLogout: () => void;
  handleDialog: () => void;
  loggedIn: boolean;
  iModelConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  loggedIn,
  iModelConnected,
  handleLogin,
  handleLogout,
  handleDialog,
}: HeaderProps) => {
  return (
    <header className={styles.header}>
      <div className={styles.buttonContainer}>
        <Button
          className={styles.button}
          onClick={handleLogin}
          buttonType={ButtonType.Primary}
          disabled={loggedIn}
        >
          {"Prihlásiť sa"}
        </Button>
        {iModelConnected && (
          <Button
            className={styles.button}
            onClick={handleDialog}
            buttonType={ButtonType.Blue}
          >
            {"Výpočet geometrie"}
          </Button>
        )}
        <Button
          className={styles.button}
          onClick={handleLogout}
          buttonType={ButtonType.Primary}
          disabled={!loggedIn}
        >
          {"Odhlásiť sa"}
        </Button>
      </div>
    </header>
  );
};
