import {
  Box,
  Heading,
  Container,
  Text,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { CreateButton } from "../components/Buttons/CreateButton";
import { JoinButton } from "../components/Buttons/JoinButton";
// import { PlayOfflineButton } from "./Buttons/PlayOffline";
import { LeaderboardButton } from "../components/Buttons/LeaderboardButton";
import { StatsButton } from "../components/Buttons/StatsButton";
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import axios from "axios";
import { useDisclosure } from "@chakra-ui/hooks";
import {
  IconArrowBigDownLine,
  IconCheck,
  IconCurrencyEthereum,
} from "@tabler/icons";
import { Grid, GridItem } from "@chakra-ui/layout";
import { Input } from "@chakra-ui/input";
import AppContext from "../utils/AppContext";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import Marquee from "react-fast-marquee";

export const Menu = () => {
  const value = useContext(AppContext);
  const router = useRouter();
  const [win, setWin] = useState("0");
  const [lose, setLose] = useState("0");
  const [earnings, setEarnings] = useState("0");
  const [walletName, setWalletName] = useState("");
  const [addressLogin, setAddressLogin] = useState("");
  const [avatarDc, setAvatarDc] = useState("");
  const [addressDb, setAddressDb] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [discordId, setDiscordId] = useState("");
  const [checkingDc, setCheckingDc] = useState(false);
  const [liveDataMatch, setLiveDataMatch] = useState([]);
  const toast = useToast();

  const getDataDb = async (address) => {
    console.log(address);
    const response = await axios.get(
      `https://www.boxcube.space/api/leaderboardvs/address/${address}`
    );
    if (response.data !== null) {
      console.log(response.data.discordId);
      console.log(response.data.walletAdress);
      if (response.data.discordId === "" || response.data.discordId === null) {
        onOpen();
      }
      setDiscordId(response.data.discordId);
      setAddressDb(response.data.walletAdress);
      value.setUsername(response.data.walletName);
      value.setWalletFromDb(response.data.walletAdress);
    } else {
      createDataDb(address);
      return;
    }
  };

  const createDataDb = async (walletAdress) => {
    try {
      await axios
        .post("https://www.boxcube.space/api/leaderboardvs", {
          walletName,
          walletAdress,
          discordId,
          win,
          lose,
          earnings,
        })
        .then(() => {
          getDataDb(walletAdress);
        });
    } catch (e) {
      console.log(e);
    }
  };

  const getDataMatch = async (e) => {
    const response = await axios.get(
      "https://www.boxcube.space/api/matchresult"
    );
    response.data.sort(function (a, b) {
      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    });
    setLiveDataMatch(response.data);
    return response.data;
  };

  useEffect(async () => {
    if (typeof window.ethereum !== "undefined") {
      const fragment = new URLSearchParams(window.location.hash.slice(1));
      const [accessToken, tokenType] = [
        fragment.get("access_token"),
        fragment.get("token_type"),
      ];

      if (!accessToken) {
        window.location.href("/");
      }

      fetch("https://discord.com/api/users/@me", {
        headers: {
          authorization: `${tokenType} ${accessToken}`,
        },
      })
        .then((result) => result.json())
        .then((response) => {
          console.log(response);
          const { username, discriminator, avatar, id } = response;
          //set the welcome username string
          document.getElementById(
            "name"
          ).innerText = ` ${username}#${discriminator}`;
          setDiscordId(` ${username}#${discriminator}`);
          setAvatarDc(avatar);

          //set the avatar image by constructing a url to access discord's cdn
          document.getElementById(
            "avatar"
          ).src = `https://cdn.discordapp.com/avatars/${id}/${avatar}.jpg`;
        })
        .catch(console.error);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then(async () => {
          const signer = provider.getSigner();
          const address = await signer.getAddress();
          setAddressLogin(address);
          getDataDb(address);
        });
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
    getDataMatch();
  }, []);

  return (
    <>
      {/* <div className="splash">
          <h1 className="fade-in">Pawws</h1>
        </div> */}
      <div className="menu-section">
        <div className="wallet-lobby">
          <div style={{ display: "flex" }}>
            {avatarDc !== "" ? (
              <img src="" id="avatar" class="avatar-dc" />
            ) : (
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-16XK7VKaVB4y3j1-X2Fx0Z5nvZcLJOBi-A&usqp=CAU"
                id="avatar"
                class="avatar-dc exclusion"
              />
            )}
            <div style={{ alignSelf: "center", marginLeft: "1rem" }}>
              <div id="name"></div>
              <label>{addressDb}</label>
            </div>
          </div>
        </div>
        <div>
          <Heading
            style={{ color: "#6d8725" }}
            fontWeight={700}
            fontSize={{ base: "2xl", sm: "4xl", md: "6xl" }}
            lineHeight={"110%"}
          >
            Rock Paper Scissors
          </Heading>
          <Text
            style={{
              color: "#6d8725",
              fontWeight: "bolder",
              marginBottom: "2.5rem",
            }}
          >
            .Versus
          </Text>
          <Stack
            direction={"column"}
            spacing={3}
            align={"center"}
            alignSelf={"center"}
            position={"relative"}
          >
            <CreateButton address={addressLogin} />
            <JoinButton address={addressLogin} />
            <LeaderboardButton />
            <StatsButton />
            {/* <PlayOfflineButton /> */}
          </Stack>
        </div>
        <div className="live-record">
          <Marquee
            gradient={false}
            style={{ background: "rgb(110 136 37 / 50%)" }}
          >
            {liveDataMatch.slice(0, 4).map((data, index) => {
              return (
                <div
                  className="mx-4 mt-2 mb-2"
                  key={index}
                  style={{ display: "flex" }}
                >
                  <Text
                    className="mx-1"
                    fontSize="xl"
                    style={{ display: "flex" }}
                  >
                    <p className="wallet-live">{data.winner}</p> Win {data.bet}{" "}
                    Eth
                  </Text>
                  <IconCurrencyEthereum size={30} />
                </div>
              );
            })}
          </Marquee>
        </div>
      </div>
    </>
  );
};

export default Menu;
