import {
  Heading,
  Text,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { CreateButton } from "../components/Buttons/CreateButton";
import { JoinButton } from "../components/Buttons/JoinButton";
// import { PlayOfflineButton } from "./Buttons/PlayOffline";
import { LeaderboardButton } from "../components/Buttons/LeaderboardButton";
import { StatsButton } from "../components/Buttons/StatsButton";
import { useDisclosure } from "@chakra-ui/hooks";
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import axios from "axios";
import { IconCurrencyEthereum, IconCloudUpload } from "@tabler/icons";
import AppContext from "../utils/AppContext";
import Marquee from "react-fast-marquee";
import { RoundedButton } from "../components/Buttons/RoundedButton";
import { RoomCategoryButton } from "../components/Buttons/RoomCategoryButton";
import { Leaderboard } from "./leaderboard";
import "bootstrap/dist/css/bootstrap.min.css";
import { Input } from "@chakra-ui/input";
import { Grid, GridItem, HStack } from "@chakra-ui/layout";

export const Menu = () => {
  const value = useContext(AppContext);
  const router = useRouter();
  const [loadingName, setLoadingName] = useState(false);
  const [win, setWin] = useState("0");
  const [lose, setLose] = useState("0");
  const [earnings, setEarnings] = useState("0");
  const [walletName, setWalletName] = useState("");
  const [walletAvatar, setWalletAvatar] = useState("");
  const [addressLogin, setAddressLogin] = useState("");
  const [avatarDc, setAvatarDc] = useState();
  const [addressDb, setAddressDb] = useState("");
  const [discordId, setDiscordId] = useState("");
  const [liveDataMatch, setLiveDataMatch] = useState([]);
  const [roomDataLive, setRoomDataLive] = useState([]);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const getDataDb = async (idVerif, dcId, dcAva) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const response = await axios.get(
      `https://www.boxcube.space/api/leaderboardvs/address/${address}`
    );
    if (response.data !== null) {
      setDiscordId(response.data.discordId);
      setAddressDb(response.data.walletAdress);
      setWalletAvatar(response.data.walletAvatar);
      value.setDiscordId(response.data.discordId);
      value.setWalletAvatar(response.data.walletAvatar);
      value.setUsername(response.data.walletName);
      value.setWalletFromDb(response.data.walletAdress);
      if (
        response.data.walletName === "" ||
        response.data.walletName === undefined ||
        response.data.walletName === null
      ) {
        onOpen();
      }
    } else {
      if (idVerif !== undefined) {
        createDataDb(address, dcId, dcAva);
      } else {
        router.push("/");
      }
    }
  };

  const createDataDb = async (walletAdress, discordId, walletAvatar) => {
    try {
      await axios
        .post("https://www.boxcube.space/api/leaderboardvs", {
          walletName,
          walletAdress,
          walletAvatar,
          discordId,
          win,
          lose,
          earnings,
        })
        .then(() => {
          getDataDb();
        });
    } catch (e) {
      console.log(e);
    }
  };

  const updateWalletName = async () => {
    setLoadingName(true);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const walletName = value.state.username;
    await axios.patch(
      `https://www.boxcube.space/api/leaderboardvs/address/${address}`,
      {
        walletName,
      }
    );
    setLoadingName(false);
  };

  const getDataMatch = async (e) => {
    const response = await axios.get(
      "https://www.boxcube.space/api/matchresult"
    );
    response.data.sort(function (a, b) {
      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    });
    setLiveDataMatch(response.data);
    // getDataDb();
    return response.data;
  };

  const updateName = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    await axios.patch(
      `https://www.boxcube.space/api/leaderboardvs/address/${address}`,
      {
        walletName,
      }
    );
  };

  const getDataRoom = async (e) => {
    const response = await axios.get("https://www.boxcube.space/api/listroom");
    const filterData = response.data.filter(
      (publicRoom) => publicRoom.setRoom === "Public"
    );
    setRoomDataLive(filterData);
    // getDataDb();
    return response.data;
  };

  useEffect(async () => {
    if (typeof window.ethereum !== "undefined") {
      const fragment = new URLSearchParams(window.location.hash.slice(1));
      const [accessToken, tokenType] = [
        fragment.get("access_token"),
        fragment.get("token_type"),
      ];
      let dcId = "";
      let dcAva = "";
      let idVerif = "";

      fetch("https://discord.com/api/users/@me", {
        headers: {
          authorization: `${tokenType} ${accessToken}`,
        },
      })
        .then((result) => result.json())
        .then((response) => {
          // console.log(response);
          const { username, discriminator, avatar, id } = response;
          dcId = ` ${username}#${discriminator}`;
          setAvatarDc(avatar);
          idVerif = id;
          dcAva = `https://cdn.discordapp.com/avatars/${id}/${avatar}.jpg`;
        })
        .then(async (resp) => {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          await window.ethereum
            .request({ method: "eth_requestAccounts" })
            .then(async () => {
              const signer = provider.getSigner();
              const address = await signer.getAddress();
              setAddressLogin(address);
              getDataDb(idVerif, dcId, dcAva);
            });
        })
        .catch(console.error);
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
    getDataRoom();
  }, []);

  return (
    <>
      {/* <div className="splash">
          <h1 className="fade-in">Pawws</h1>
        </div> */}
      <div className="menu-section">
        <div className="wallet-lobby">
          <div style={{ display: "flex" }}>
            {avatarDc !== null ? (
              <img src={walletAvatar} className="avatar-dc" />
            ) : (
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-16XK7VKaVB4y3j1-X2Fx0Z5nvZcLJOBi-A&usqp=CAU"
                id="avatar"
                className="avatar-dc exclusion"
              />
            )}
            <div style={{ alignSelf: "center", marginLeft: "1rem" }}>
              <div>{discordId}</div>
              <label>{addressDb}</label>
              <div
                style={{
                  width: "50%",
                  borderBottom: "2px",
                  color: "black",
                  display: "inline-flex",
                  alignSelf: "center",
                }}
              >
                <input
                  value={value.state.username}
                  placeholder="New Player"
                  className="username-input"
                  variant="outline"
                  onChange={(e) => {
                    value.setUsername(e.target.value);
                    setWalletName(e.target.value);
                  }}
                />
                <button
                  onClick={() => {
                    updateWalletName();
                  }}
                >
                  {!loadingName ? (
                    <IconCloudUpload size={26} color="black" />
                  ) : (
                    "Updating..."
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <Heading
            style={{ color: "#6d8725" }}
            fontWeight={700}
            fontSize={{ base: "2xl", sm: "4xl", md: "6xl" }}
            lineHeight={"110%"}
          >
            Rock Paper Scissors
          </Heading>
          {/* <Text
            style={{
              color: "#6d8725",
              fontWeight: "bolder",
              marginBottom: "2.5rem",
            }}
          >
            .Versus
          </Text> */}
          <br />
          <div className="row">
            <div className="col-sm-8">
              <CreateButton address={addressLogin} />
              <JoinButton address={addressLogin} />
              <RoomCategoryButton />
              <div className="mt-2 card-room">
                <div style={{ display: "flex" }}>
                  <Text style={{ width: "100%" }} fontSize="lg">
                    Room Number
                  </Text>
                  <Text style={{ width: "100%" }} fontSize="lg">
                    Bet
                  </Text>
                  <Text style={{ width: "100%" }} fontSize="lg">
                    Member
                  </Text>
                  <Text style={{ width: "100%" }} fontSize="lg">
                    Select
                  </Text>
                </div>
                <hr />
                {roomDataLive.map((data, index) => {
                  return (
                    <div className="card mb-2 mt-2">
                      <div className="mt-2 mb-2" style={{ display: "flex" }}>
                        <div
                          className="ps-3"
                          style={{ width: "100%", alignSelf: "center" }}
                        >
                          <Text fontSize="lg">{index + 1}</Text>
                        </div>
                        <div style={{ width: "100%", alignSelf: "center" }}>
                          <Text fontSize="lg">{data.bet} Ξ</Text>
                        </div>
                        <div style={{ width: "100%", alignSelf: "center" }}>
                          <Text fontSize="lg">1/2</Text>
                        </div>
                        <div style={{ width: "100%", alignSelf: "center" }}>
                          <RoundedButton
                            color="#fc931b"
                            className="btn-join"
                            onClick={() => {
                              value.setGameId(`${data.roomId}`);
                              value.setBytesGameId(
                                ethers.utils.id(`${data.roomId}`)
                              );
                            }}
                            content="Join"
                            nextLink="/play"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="col-sm-4">
              <Leaderboard />
              <StatsButton />
            </div>
            {/* <PlayOfflineButton /> */}
          </div>
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
                  {data.winner !==
                  "0x0000000000000000000000000000000000000000" ? (
                    <>
                      <Text
                        className="mx-1"
                        fontSize="xl"
                        style={{ display: "flex" }}
                      >
                        <p className="wallet-live">{data.winner}</p> Win{" "}
                        {data.bet} Eth Ξ
                      </Text>
                    </>
                  ) : (
                    ""
                  )}
                </div>
              );
            })}
          </Marquee>
        </div>
      </div>

      <Modal size="lg" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent top="6rem" background="#6d8725">
          <ModalHeader>Your Username</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid templateColumns="repeat(6, 1fr)" gap={4}>
              <GridItem rowSpan={1} colSpan={1}>
                <Text mt={1} fontSize="lg">
                  Username:
                </Text>
              </GridItem>
              <GridItem rowSpan={1} colSpan={5}>
                <Input
                  value={value.state.username}
                  variant="outline"
                  onChange={(e) => {
                    value.setUsername(e.target.value);
                    setWalletName(e.target.value);
                  }}
                />
              </GridItem>
            </Grid>
          </ModalBody>

          <ModalFooter>
            <RoundedButton
              color="orange"
              content="Apply"
              onClick={() => {
                if (value.state.username !== "") {
                  updateName();
                  onClose();
                  toast({
                    title: "Username Applied!",
                    description: "Username success applied.",
                    status: "success",
                    duration: 4000,
                    isClosable: true,
                    position: "top",
                  });
                } else {
                  toast({
                    title: "Username Empty",
                    description: "Please insert your username first!.",
                    status: "error",
                    duration: 4000,
                    isClosable: true,
                    position: "top",
                  });
                }
              }}
              size="md"
            />
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Menu;
