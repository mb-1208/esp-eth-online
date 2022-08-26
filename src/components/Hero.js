import {
  Box,
  Heading,
  Container,
  Text,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { CreateButton } from "./Buttons/CreateButton";
import { JoinButton } from "./Buttons/JoinButton";
// import { PlayOfflineButton } from "./Buttons/PlayOffline";
import { LeaderboardButton } from "./Buttons/LeaderboardButton";
import { StatsButton } from "./Buttons/StatsButton";
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

export const Hero = () => {
  const value = useContext(AppContext);
  const router = useRouter();
  const [win, setWin] = useState("0");
  const [lose, setLose] = useState("0");
  const [earnings, setEarnings] = useState("0");
  const [walletName, setWalletName] = useState("");
  const [addressLogin, setAddressLogin] = useState("");
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

  const updateDc = async (discordId) => {
    await axios
      .patch(
        `https://www.boxcube.space/api/leaderboardvs/address/${addressLogin}`,
        {
          discordId,
        }
      )
      .then(() => setCheckingDc(false));
  };

  const getDataMatch = async (e) => {
    const response = await axios.get("https://www.boxcube.space/api/matchresult");
    response.data.sort(function (a, b) {
      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    });
    setLiveDataMatch(response.data);
    return response.data;
  };

  useEffect(async () => {
    if (typeof window.ethereum !== "undefined") {
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
          <label>Wallet: {addressDb}</label>
          <div style={{ display: "flex" }}>
            Discord:&nbsp;
            <input
              className="discordInput"
              value={discordId}
              onChange={(e) => {
                setDiscordId(e.target.value);
              }}
            ></input>
            <button
              onClick={() => {
                setCheckingDc(true);
                updateDc(discordId);
              }}
            >
              <IconArrowBigDownLine />
            </button>
            {!checkingDc ? <IconCheck color="green" /> : "Updating.."}
          </div>
          <img src="" id="avatar" style={{ width: "5vh" }} />
          <a href="/" className="text-sm"></a>
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
          <Marquee gradient={false} style={{background: 'rgb(110 136 37 / 50%)'}}>
            {liveDataMatch.slice(0, 4).map((data, index) => {
              return (
                <div className="mx-4 mt-2 mb-2" key={index} style={{ display: "flex" }}>
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
        <Modal size="lg" isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent top="6rem" background="#6d8725">
            <ModalHeader>Add Discord Account</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Grid templateColumns="repeat(4, 1fr)" gap={4}>
                <GridItem rowSpan={1} colSpan={1}>
                  <Text mt={1} fontSize="lg">
                    Discord ID:
                  </Text>
                </GridItem>
                <GridItem rowSpan={1} colSpan={5}>
                  <Input
                    placeholder="..."
                    variant="outline"
                    value={discordId}
                    onChange={(e) => {
                      setDiscordId(e.target.value);
                    }}
                  />
                </GridItem>
              </Grid>
              <label>
                Add your Discord ID to increase your chance to get whitelist
                spot!
              </label>
            </ModalBody>

            <ModalFooter>
              <button
                className="btn-menu-modal"
                onClick={() => {
                  updateDc(discordId);
                  onClose();
                }}
              >
                Add
              </button>
              <button
                className="btn-menu-modal"
                onClick={() => {
                  onClose();
                }}
              >
                Cancel
              </button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </>
  );
};
