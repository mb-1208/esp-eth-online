import React, { useContext, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Text } from "@chakra-ui/layout";

export const Login = () => {
  return (
    <>
      <div className="login-section">
        <div className="text-center">
          <img
            className="mb-2"
            src="pawws.png"
            style={{
              width: "10vh",
              margin: "auto",
            }}
          />
          <Text className="mb-2" fontSize="3xl" fontWeight="bolder" color="black">
            Login with Discord
          </Text>
          <a href="https://discord.com/api/oauth2/authorize?client_id=1011578388164644875&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fmenu&response_type=token&scope=identify" className="button-login">
            Login
          </a>
        </div>
      </div>
    </>
  );
};
