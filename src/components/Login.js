import React, { useContext, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/react";

export const Login = () => {
  // FUSE blockchain details
  const toast = useToast();
  const chainId = "0x66eeb";
  const rpcURL = "https://rinkeby.arbitrum.io/rpc";
  const networkName = "Arbitrum Testnet";
  const currencyName = "ETH";
  const currencySymbol = "ETH";
  const explorerURL = "https://rinkeby-explorer.arbitrum.io/#/";

  const addNetwork = async () => {
    if (typeof window.ethereum !== "undefined") {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: chainId,
            chainName: networkName,
            rpcUrls: [rpcURL],
            blockExplorerUrls: [explorerURL],
            nativeCurrency: {
              name: currencyName,
              symbol: currencySymbol, // 2-6 characters long
              decimals: 18,
            },
          },
        ],
      });
      // refresh
      window.location.reload();
    } else {
      toast({
        title: "No Web3 Provider Found!",
        description: "Please install MetaMask first.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  return (
    <>
      <div className="login-section">
        <div className="text-center">
          <img
            className="mb-2"
            src="login-logo.png"
            style={{
              width: "50vh",
              margin: "auto",
            }}
          />
          <div className="lgn-btn-set mt-2">
            <a
              href="https://discord.com/api/oauth2/authorize?client_id=1012718123503329311&redirect_uri=https%3A%2F%2Fpawws-rps.herokuapp.com%2Fmenu&response_type=token&scope=identify"
              className="button-login"
            >
              Login
            </a>
            <Text className="mt-2">
              This app only supports the Arbitrum Network
            </Text>
            <div>
              <button
                className="add-arbi-btn"
                onClick={() => {
                  addNetwork();
                }}
              >
                Add
              </button>{" "}
              Arbitrum Network to Metamask
            </div>
            <div>
              <code>
                Powered by{" "}
                <a style={{ borderBottom: "1px solid white" }} href="">
                  PAWWS
                </a>
              </code>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
