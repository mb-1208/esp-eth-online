import React, { useContext, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Text } from "@chakra-ui/layout";

export const RoomBoard = () => {
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
          <a href="https://discord.com/api/oauth2/authorize?client_id=1012718123503329311&redirect_uri=https%3A%2F%2Fpawws-rps.herokuapp.com%2Fmenu&response_type=token&scope=identify" className="button-login">
            Login
          </a>
        </div>
      </div>
    </>
  );
};
