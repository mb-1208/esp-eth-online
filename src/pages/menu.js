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
import {
  IconRefresh,
  IconCloudUpload,
  IconBrandTwitter,
  IconBrandDiscord,
} from "@tabler/icons";
import AppContext from "../utils/AppContext";
import Marquee from "react-fast-marquee";
import { RoundedButton } from "../components/Buttons/RoundedButton";
import { RoomCategoryButton } from "../components/Buttons/RoomCategoryButton";
import { Leaderboard } from "../components/leaderboard";
import "bootstrap/dist/css/bootstrap.min.css";
import { Input } from "@chakra-ui/input";
import { Grid, GridItem, HStack } from "@chakra-ui/layout";
import MediaQuery from "react-responsive";

export const Menu = () => {
  // const [account, setaccount] = useState("0x0");
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
    let arrayResp = [];
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const response = await axios.get(
      `https://www.boxcube.space/api/leaderboardvs/address/${address}`
    );
    arrayResp.push(response.data)
    const filterData = arrayResp.filter(
      (a) =>
        a.project === "pawwsProject" &&
        a.network === "testnetNetwork"
    );
    if (filterData.length !== 0) {
      setDiscordId(filterData[0].discordId);
      setAddressDb(filterData[0].walletAdress);
      setWalletAvatar(filterData[0].walletAvatar);
      value.setDiscordId(filterData[0].discordId);
      value.setWalletAvatar(filterData[0].walletAvatar);
      value.setUsername(filterData[0].walletName);
      value.setWalletFromDb(filterData[0].walletAdress);
      if (
        filterData[0].walletName === "" ||
        filterData[0].walletName === undefined ||
        filterData[0].walletName === null
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
    let project = 'pawwsProject';
    let network = 'testnetNetwork';
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
          project,
          network,
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
    const filterData = response.data.filter(
      (a) =>
        a.project === "pawwsProject" &&
        a.network === "testnetNetwork"
    );
    const dataSort = filterData.sort(function (a, b) {
      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    });
    setLiveDataMatch(dataSort);
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
      (a) =>
        a.setRoom === "Public" &&
        a.project === "pawwsProject" &&
        a.network === "testnetNetwork" &&
        a.roomType === "1"
    );
    const setData = filterData.filter((member) => member.roomMember === "1");
    setRoomDataLive(setData);
    // getDataDb();
    return response.data;
  };

  // const changeWallet = async (e) => {
  //   const providerBfr = new ethers.providers.Web3Provider(window.ethereum);
  //   const signerBfr = providerBfr.getSigner();
  //   const addressBfr = await signerBfr.getAddress();
  //   console.log(addressBfr);
  //   await window.ethereum
  //     .request({
  //       method: "wallet_requestPermissions",
  //       params: [
  //         {
  //           eth_accounts: {},
  //         },
  //       ],
  //     })
  //     .then(() =>
  //       ethereum.request({
  //         method: "eth_requestAccounts",
  //       })
  //     );

  //   // const account = accounts[0];
  //   // setaccount(accounts[0]);
  //   const provider = new ethers.providers.Web3Provider(window.ethereum);
  //   const signer = provider.getSigner();
  //   const address = await signer.getAddress();
  //   console.log(address);
  //   const response = await axios.get(
  //     `https://www.boxcube.space/api/leaderboardvs/address/${address}`
  //   );
  //   if (response.data !== null) {
  //     toast({
  //       title: "Wallet Registered!",
  //       description: "Please use another wallet to choose.",
  //       status: "error",
  //       duration: 5000,
  //       isClosable: true,
  //       position: "top",
  //     });
  //   } else {
  //     const walletAdress = address;
  //     await axios
  //       .patch(
  //         `https://www.boxcube.space/api/leaderboardvs/address/${addressBfr}`,
  //         {
  //           walletAdress,
  //         }
  //       )
  //       .then(() => {
  //         toast({
  //           title: "Wallet Changed!",
  //           description: "Your wallet successfully changed.",
  //           status: "success",
  //           duration: 5000,
  //           isClosable: true,
  //           position: "top",
  //         });
  //         window.location.reload();
  //       });
  //   }
  // };

  const targetNetworkId = "0x66eeb";

  const checkNetwork = async () => {
    if (window.ethereum) {
      const currentChainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      console.log(currentChainId);

      if (currentChainId == targetNetworkId) return true;

      toast({
        title: "Arbitrum Network Only!",
        description: "Please make sure your network using Arbitrum.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return router.push("/");
    }
  };

  useEffect(async () => {
    if (typeof window.ethereum !== "undefined") {
      checkNetwork();
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
      <MediaQuery minWidth={768}>
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
              <div
                className="text-white"
                style={{ alignSelf: "center", marginLeft: "1rem" }}
              >
                <div>{discordId}</div>
                {/* <div className="flex-user-wallet"> */}
                <label>{addressDb}</label>
                {/* <button
                    className="mx-2 btn-user-data"
                    onClick={() => changeWallet()}
                  >
                    <IconArrowsExchange size={26} color="black" />
                  </button>
                </div> */}
                <div className="flex-user-data">
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
                    className="mx-2 btn-user-data"
                    onClick={() => {
                      updateWalletName();
                    }}
                  >
                    {!loadingName ? (
                      <IconCloudUpload size={26} color="white" />
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
              {/* Rock Paper Scissors */}
              <img src="menu-title.png" style={{ width: "50vh" }} />
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
              <div className="col-sm-8 center-tablet">
                <CreateButton address={addressLogin} />
                <JoinButton address={addressLogin} />
                <RoomCategoryButton />
                <button className="refresh-room" onClick={() => getDataRoom()}>
                  <IconRefresh color="#ef6b9a" />
                </button>
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
                      <div
                        className="card mb-2 mt-2"
                        style={{ backgroundColor: "#787878" }}
                      >
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
                            <Text fontSize="lg">{data.roomMember}/2</Text>
                          </div>
                          <div style={{ width: "100%", alignSelf: "center" }}>
                            <RoundedButton
                              color="#fc931b"
                              className="btn-join"
                              onClick={async () => {
                                const response = await axios.get(
                                  `https://www.boxcube.space/api/listroom/${data.id}`
                                );
                                if (response.data !== null) {
                                  console.log(response.data.roomMember);
                                  if (
                                    response.data.roomMember === data.roomMember
                                  ) {
                                    const roomMember = (
                                      parseInt(response.data.roomMember) + 1
                                    ).toString();
                                    value.setRoomNum(
                                      response.data.id.toString()
                                    );
                                    value.setRematch("");
                                    value.setGameId(`${data.roomId}`);
                                    value.setBytesGameId(
                                      ethers.utils.id(`${data.roomId}`)
                                    );
                                    console.log(data.id.toString());
                                    value.setRoomId(data.roomId.toString());
                                    await axios
                                      .patch(
                                        `https://www.boxcube.space/api/listroom/${data.id}`,
                                        {
                                          roomMember,
                                        }
                                      )
                                      .then(() => router.push("/play"));
                                  } else {
                                    toast({
                                      title: "Room Full!",
                                      status: "error",
                                      duration: 4000,
                                      isClosable: true,
                                      position: "top",
                                    });
                                    getDataRoom();
                                  }
                                } else {
                                  toast({
                                    title: "Room Not Exist!",
                                    status: "error",
                                    duration: 4000,
                                    isClosable: true,
                                    position: "top",
                                  });
                                  getDataRoom();
                                }
                              }}
                              content="Join"
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
              style={{ background: "rgb(239 107 154 / 50%)" }}
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
                          {data.bet}Ξ
                        </Text>
                      </>
                    ) : (
                      ""
                    )}
                  </div>
                );
              })}
            </Marquee>
            {/* <div
              className="text-center"
              style={{ background: "rgb(239 107 154 / 50%)" }}
            >
              <div
              className="pt-2 pb-2"
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Text className="px-2" fontSize="lg"><IconBrandTwitter /></Text>
                <Text className="px-2" fontSize="lg"><IconBrandDiscord /></Text>
              </div>
            </div> */}
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
      </MediaQuery>
      <MediaQuery maxWidth={767}>
        <div className="mobile-only">
          <div className="text-center">
            <img
              className="mb-2"
              src="pawws.png"
              style={{
                width: "10vh",
                margin: "auto",
              }}
            />
            <Text fontSize="xl" color="white">
              For better experience please use desktop device
            </Text>
          </div>
        </div>
      </MediaQuery>
    </>
  );
};

export default Menu;
