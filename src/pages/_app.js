import React, { useState } from "react";
import AppContext from "../utils/AppContext";
import { ChakraProvider } from "@chakra-ui/provider";
import { extendTheme } from "@chakra-ui/react";
import { nanoid } from "nanoid";
import { ethers } from "ethers";
import "../components/assets/App.css";
import Head from "next/head";

const App = ({ Component, pageProps }) => {
  const [username, setUsername] = useState("");
  const [gameId, setGameId] = useState(nanoid());
  const [bytesGameId, setBytesGameId] = useState(ethers.utils.id(gameId));
  const [status, setStatus] = useState(0);
  const [outcome, setOutcome] = useState("unknown");
  const [bet, setBet] = useState(0);
  const [choice, setChoice] = useState(1);
  const Alert = {
    baseStyle: {
      container: {
        my: "8px",
      },
    },
  };

  const config = {
    initialColorMode: "dark",
    useSystemColorMode: false,
  };

  const theme = extendTheme({
    config,
    components: {
      Alert,
    },
    fonts: {},
  });

  return (
    <ChakraProvider theme={theme}>
      <AppContext.Provider
        value={{
          state: {
            username,
            gameId,
            bytesGameId,
            status,
            outcome,
            bet,
            choice,
          },
          setUsername,
          setGameId,
          setBytesGameId,
          setStatus,
          setOutcome,
          setBet,
          setChoice,
        }}
      >
        <Head>
          <title>Pawws RPS</title>
        </Head>
        <Component {...pageProps} />
      </AppContext.Provider>
    </ChakraProvider>
  );
};

export default App;
