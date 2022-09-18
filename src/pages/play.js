import { useContext, useState, useEffect } from "react";
import AppContext from "../utils/AppContext";
import RPS from "../../contracts/RPS.json";
import { IconButton } from "@chakra-ui/button";
import { CopyIcon } from "@chakra-ui/icons";
import { useClipboard, useDisclosure } from "@chakra-ui/hooks";
import "bootstrap/dist/css/bootstrap.min.css";
import { IconArrowLeft, IconSend } from "@tabler/icons";
import { Text } from "@chakra-ui/layout";
import { Code } from "@chakra-ui/react";
import MediaQuery from "react-responsive";

import { useColorMode } from "@chakra-ui/color-mode";
import { ethers } from "ethers";
import { Status } from "../components/Status";
import { PlayerData } from "../components/PlayerData";
import axios from "axios";
import { io } from "socket.io-client";
import { useRouter } from "next/router";
import { Input } from "@chakra-ui/input";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
} from "@chakra-ui/react";
import { Grid, GridItem } from "@chakra-ui/layout";

const arbitrumAddress = "0xE57B62c8De212966fc5956811F6efC24b501B78e"; // L2 Arbitrum Rinkeby

const nonce = ethers.utils.randomBytes(32);
const encrypt = (nonce, choice) => {
  const commitment = ethers.utils.solidityKeccak256(
    ["uint", "uint8"],
    [ethers.BigNumber.from(nonce), choice]
  );
  return commitment;
};
const isAddress = /^0x[a-fA-F0-9]{40}$/;

export const Play = () => {
  const { colorMode } = useColorMode();
  const value = useContext(AppContext);
  const [finalResult, setFinalResult] = useState(false);
  const [lockDone, setLockDone] = useState(false);
  const [lockBet, setLockBet] = useState(false);
  const [pending, setPending] = useState(false);
  const [rpsAddress, setRpsAddress] = useState(arbitrumAddress);

  const getRequireError = (err) => {
    if (err.code === 4001) {
      return;
    }
    // console.log(err);
    if (rpsAddress === arbitrumAddress && err) {
      return err.Error;
    }

    const regex = /"message":"execution reverted: (.*?)"/;
    const match = regex.exec(err);
    if (match) {
      return match[1];
    }
  };
  const router = useRouter();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [tips, setTips] = useState("false");
  const [gameCancelled, setGameCancelled] = useState(false);
  const [chatBox, setChatBox] = useState("");
  const [roomOwner, setRoomOwner] = useState("");
  const [rock, setRock] = useState(true);
  const [paper, setPaper] = useState(false);
  const [scissors, setScissors] = useState(false);
  const [rematchCondition, setRematchCondition] = useState(false);
  const [rematchRoom, setRematchRoom] = useState("");
  const [query, setQuery] = useState("");
  const [score, setScore] = useState([]);
  const [player, setPlayer] = useState("");
  const [player2Addr, setPlayer2Addr] = useState("waiting...");
  const [player2, setPlayer2] = useState("Player 2");
  const [gameDetails, setGameDetails] = useState(null);
  const { hasCopied, onCopy } = useClipboard(value.state.gameId);

  const requestAccount = async () => {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  };

  const sendCommitment = async () => {
    const commitment = encrypt(nonce, value.state.choice);
    if (typeof window.ethereum !== "undefined") {
      try {
        await requestAccount();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(rpsAddress, RPS.abi, signer);
        const playerUsername =
          value.state.username.length === 0
            ? "New Player"
            : value.state.username;
        const overrides = {
          // To convert Ether to Wei:
          value: ethers.utils.parseEther(value.state.bet.toString()),
          // ether in this case MUST be a string
        };
        const transaction = await contract.sendCommitment(
          value.state.bytesGameId,
          commitment,
          playerUsername,
          overrides
        );
        value.setStatus(0.1);
        setPending(true);
        await transaction.wait().then(() => {
          setLockBet(true);
          setLockDone(true);
          const socket = io("http://localhost:5000");
          const name = value.state.username;
          socket.emit("lock-message", value.state.roomId, name);
        });
        setPending(false);
        if (value.state.status <= 0.1) {
          value.setStatus(1);
        }
        toast({
          title: "Lock Succeed!",
          description: "Your choice has been recorded.",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      } catch (err) {
        value.setStatus(0);
        console.log("test " + err);
        toast({
          title: "Lock Failed!",
          description: "Check your balance first or please try again later",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      }
    } else {
      toast({
        title: "No Web3 Provider Found!",
        description: "Please install MetaMask and try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const reqFund = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await requestAccount();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(rpsAddress, RPS.abi, signer);
        const transaction = await contract.requestRefund(
          value.state.bytesGameId
        );
        value.setStatus(2.3);
        setPending(true);
        await transaction.wait().then(() => {
          toast({
            title: "Refund Success!",
            description: "Please recheck.",
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
        });
        setPending(false);
      } catch (err) {
        toast({
          title: "Refund Failed!",
          description: "Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      }
    } else {
      toast({
        title: "No Web3 Provider Found!",
        description: "Please install MetaMask and try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const sendVerification = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const feeAddress = "0xfd5b58B50018ce288ADEA563185452349C7a88aA";
        const winnerValue = 96;
        const feeValue = 4;
        await requestAccount();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(rpsAddress, RPS.abi, signer);
        const transaction = await contract.sendVerification(
          value.state.bytesGameId,
          value.state.choice,
          ethers.BigNumber.from(nonce),
          feeAddress,
          winnerValue,
          feeValue
        );
        value.setStatus(2.1);
        setPending(true);
        await transaction.wait().then(() => {
          setLockDone(false);
          setFinalResult(true);
          sendSearch();
        });
        setPending(false);
        // Ensure that we aren't backtracking the game status
        if (value.state.status <= 2.1) {
          value.setStatus(2.2);
        }

        toast({
          title: "Bet Confirmed!",
          description: "Your choice has been recorded.",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      } catch (err) {
        toast({
          title: "Bet Failed!",
          description:
            "Make sure both players lock the choice first, or please try again",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      }
    } else {
      toast({
        title: "No Web3 Provider Found!",
        description: "Please install MetaMask and try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const sendSearch = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await requestAccount();
        let bet = "";
        let winnerAddress = "";
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        const contract = new ethers.Contract(rpsAddress, RPS.abi, signer);
        // console.log('test update');
        if (isAddress.test(query)) {
          console.log("test update1");
          const transaction = await contract.getPlayerDetails(query);
          setPlayer(query);
          const [wins, losses, earnings] = transaction;
          setGameDetails(null);
          setScore([
            wins.toString(),
            losses.toString(),
            ethers.utils.formatEther(earnings.toString()),
          ]);
          console.log(
            wins.toString(),
            losses.toString(),
            ethers.utils.formatEther(earnings.toString())
          );
        } else {
          // console.log('test update2');
          const transaction = await contract.getGameDetails(
            ethers.utils.id(value.state.gameId)
          );

          const gameDetails = {
            ...transaction,
            bet: ethers.utils.formatEther(transaction.bet.toString()),
          };
          bet = gameDetails.bet;
          winnerAddress = gameDetails.winner;
          setGameDetails(gameDetails);
          createResultMatch(gameDetails);
        }
        // console.log(gameDetails);
        getPlayerData(gameDetails);
        toast({
          title: "Updated!",
          description: "Success to get newest reponse.",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      } catch (err) {
        console.error(err);
        // toast({
        //   title: "Query Failed!",
        //   description: "Player or game not found.",
        //   status: "error",
        //   duration: 5000,
        //   isClosable: true,
        //   position: "top",
        // });
      }
    } else {
      toast({
        title: "No Web3 Provider Found!",
        description: "Please install MetaMask and try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const checkEvents = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(rpsAddress, RPS.abi, provider);
        const requestMoveFilter = {
          address: rpsAddress,
          topics: [ethers.utils.id("requestMoves(bytes32)")],
        };
        const winnerFilter = {
          address: rpsAddress,
          topics: [ethers.utils.id("winner(bytes32,address)")],
        };
        const cancelFilter = {
          address: rpsAddress,
          topics: [ethers.utils.id("gameCancel(bytes32)")],
        };
        contract.on(requestMoveFilter, (gameId) => {
          if (gameId !== value.state.bytesGameId || value.state.status >= 2) {
            return;
          }
          value.setStatus(2);
        });
        contract.on(winnerFilter, async (gameId, winnerAddress) => {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const address = await signer.getAddress();
          if (gameId !== value.state.bytesGameId || value.state.status >= 3) {
            return;
          }
          value.setStatus(3);
          if (winnerAddress === "0x0000000000000000000000000000000000000000") {
            value.setOutcome("tie");
            console.log("tie");
          } else if (winnerAddress === address) {
            value.setOutcome("win");
            console.log("win");
          } else {
            value.setOutcome("loss");
            console.log("loss");
          }
          console.log("winner");
        });

        contract.on(cancelFilter, (gameId) => {
          if (gameId !== value.state.bytesGameId || value.state.status >= 4) {
            return;
          }
          value.setStatus(4);
          toast({
            title: "Game Cancelled!",
            description: "Your bets have been refunded",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
        });
      } catch (err) {
        console.error("Error: ", err);
      }
    }
  };

  const updateResult = async (win, lose, earnings, address) => {
    let arrayResp = [];
    const response = await axios.get(
      `https://www.boxcube.space/api/leaderboardvs/address/${address}`
    );
    arrayResp.push(response.data);
    const filterData = arrayResp.filter(
      (a) => a.project === "pawwsProject" && a.network === "testnetNetwork"
    );
    // console.log(win, lose, earnings, address);
    await axios.patch(
      `https://www.boxcube.space/api/leaderboardvs/address/${filterData[0].walletAdress}`,
      {
        win,
        lose,
        earnings,
      }
    );
  };

  const createResultMatch = async (gameDetails) => {
    const gameId = gameDetails.p1Commit + "&&" + gameDetails.p2Commit;
    const player1Address = gameDetails.player1;
    const player1Name = gameDetails.player1Name;
    const player1Choice = `${
      gameDetails.p1Choice === 1
        ? "rock"
        : gameDetails.p1Choice === 2
        ? "paper"
        : "scissor"
    }`;
    const player2Address = gameDetails.player2;
    const player2Name = gameDetails.player2Name;
    const player2Choice = `${
      gameDetails.p2Choice === 1
        ? "rock"
        : gameDetails.p2Choice === 2
        ? "paper"
        : "scissor"
    }`;
    const winner = gameDetails.winner;
    const bet = gameDetails.bet;
    const fee = ((2 * bet * 3.5) / 100).toString();
    const response = await axios.get(
      "https://www.boxcube.space/api/matchresult"
    );
    var result = response.data.find((obj) => {
      return obj.gameId === gameId;
    });
    let project = "pawwsProject";
    let network = "testnetNetwork";
    if (gameDetails.gameState === 3) {
      if (result === undefined) {
        try {
          await axios.post("https://www.boxcube.space/api/matchresult", {
            gameId,
            player1Address,
            player1Name,
            player1Choice,
            player2Address,
            player2Name,
            player2Choice,
            winner,
            bet,
            fee,
            project,
            network,
          });
          console.log("created success");
        } catch (e) {
          console.log(e);
        }
      }
    }
  };

  const getRoomDb = async () => {
    const parse = (val) => val.replace(/^\$/, "");
    let arrayResp = [];
    const response = await axios.get(
      `https://boxcube.space/api/listroom/room/${value.state.gameId}`
    );
    arrayResp.push(response.data);
    const filterData = arrayResp.filter(
      (a) => a.project === "pawwsProject" && a.network === "testnetNetwork"
    );
    if (filterData[0] !== undefined) {
      liveData(filterData[0].roomId);
      value.setRoomNum(filterData[0].id.toString());
      value.setRoomId(filterData[0].roomId);
      value.setBet(parse(filterData[0].bet));
      chatLive(filterData[0].roomId);
      setRoomOwner(filterData[0].roomOwner);
    } else {
      toast({
        title: `Room not detected!`,
        description: "Please create room first",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      if (value.state.rematch !== "rematch") {
        router.push("/menu");
      }
    }
  };

  const getPlayerData = async (gameDetails) => {
    await requestAccount();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const signerAddress = await signer.getAddress();
    const contract = new ethers.Contract(rpsAddress, RPS.abi, signer);
    if (isAddress.test(signerAddress)) {
      // console.log(signerAddress);
      try {
        const transaction = await contract.getPlayerDetails(signerAddress);
        setPlayer(signerAddress);
        const [wins, losses, earnings] = transaction;
        setScore([
          wins.toString(),
          losses.toString(),
          ethers.utils.formatEther(earnings.toString()),
        ]);
        if (gameDetails !== undefined) {
          let earn = ethers.utils.formatEther(earnings.toString());
          updateResult(wins.toString(), losses.toString(), earn, signerAddress);
        }
      } catch (err) {
        //new player
      }
    }
  };

  const liveData = async (roomId) => {
    console.log(roomId);
    const socket = io("http://localhost:5000");
    const name = value.state.username;
    const walletAddress = value.state.walletFromDb;
    const gameId = value.state.gameId;
    var inputText = document.querySelector("#inputText");
    var btnSend = document.querySelector(".button-send");
    var messageArea = document.querySelector(".message.message-right");
    socket.on("connect", async () => {
      socket.emit("new-user", roomId, name, gameId, walletAddress);
      socket.emit("send-chat", roomId, name, "Hi");
      socket.on("rematch-send", (newRoom) => {
        setRematchCondition(true);
        setRematchRoom(newRoom);
        console.log(newRoom);
      });
      socket.on("chat-message", (username, message) => {
        var user = username.slice(0, 2);
        var flex = document.createElement("div");
        flex.className += "flex-display";
        var bubble = document.createElement("div");
        bubble.className += " bubble bubble-dark";
        bubble.textContent = message;
        var bubble2 = document.createElement("div");
        bubble2.className += " bubble bubble-light ms-2";
        bubble2.textContent = user;
        messageArea.appendChild(flex);
        flex.appendChild(bubble);
        flex.appendChild(bubble2);
        window.scrollTo(0, document.querySelector(".chat-room").scrollHeight);
        window.scrollTo(0, document.querySelector(".message").scrollHeight);
        inputText.value = "";
        const element = document.getElementById("chat-room-id");
        element.scrollTop = element.scrollHeight;
        const element2 = document.getElementById("message-id");
        element2.scrollTop = element2.scrollHeight;
      });
      socket.on("lock-send", (message) => {
        toast({
          title: `${message} has lock the choice, ready to bet!`,
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      });
      socket.on("user-connected", (username, userData) => {
        for (let i = 0; i < userData.length; i++) {
          // console.log(userData[i]);
          if (userData[i] !== value.state.username) {
            setPlayer2(userData[i]);
            // setPlayer2Addr(userData[i]);
          }
        }
        toast({
          title: `${username} has join the game!`,
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      });
      socket.on("user-disconnected", async (message) => {
        setPlayer2("Player 2");
        setPlayer2Addr("waiting...");
        toast({
          title: `${message} leave the game!`,
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      });
    });
  };

  const chatLive = (roomId) => {
    console.log(roomId);
    var inputText = document.querySelector("#inputText");
    var btnSend = document.querySelector(".button-send");
    const element = document.getElementById("chat-room-id");
    element.scrollTop = element.scrollHeight;
    const element2 = document.getElementById("message-id");
    element2.scrollTop = element2.scrollHeight;
    inputText.addEventListener("keypress", function onEvent(event) {
      if (event.keyCode == 13) {
        console.log("test");
        const socket = io("http://localhost:5000");
        socket.on("connect", async () => {
          socket.emit(
            "send-chat",
            roomId,
            value.state.username,
            inputText.value
          );
        });
      }
    });
    //Button Send onclick event
    btnSend.addEventListener("click", (e) => {
      const socket = io("http://localhost:5000");
      socket.on("connect", async () => {
        socket.emit("send-chat", roomId, value.state.username, inputText.value);
      });
    });
  };

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

  useEffect(() => {
    if (window.sessionStorage.getItem("tips") !== "") {
      setTips(window.sessionStorage.getItem("tips"));
      console.log(window.sessionStorage.getItem("tips"));
      console.log(tips);
    }
    if (window.sessionStorage.getItem("tips") === null) {
      onOpen();
    }
  }, [tips]);

  useEffect(async () => {
    checkNetwork();
    liveData();
    getRoomDb();
    checkEvents();
    getPlayerData();
    chatLive();
  }, []);

  return (
    <>
      <MediaQuery minWidth={768}>
        <div className="multiplayer-section">
          <div className="nav-position">
            <div
              className="navbar-multi text-black p-4"
              style={{ display: "flex" }}
            >
              <div style={{ width: "100%" }}>
                <a href="/menu">
                  <IconArrowLeft color="#ef6b9a" />
                </a>
              </div>
              <div className="text-center" style={{ width: "100%" }}>
                <img
                  src="pawws.png"
                  style={{ height: "5vh", margin: "0 auto" }}
                />
              </div>
              <div className="text-end text-white" style={{ width: "100%" }}>
                {/* Room Number: <strong>{value.state.roomNum}</strong>
              <br /> */}
                Room ID: <strong>{value.state.gameId}</strong>
                <IconButton
                  size="sm"
                  aria-label="Copy game ID"
                  onClick={() => {
                    onCopy();
                  }}
                  icon={<CopyIcon />}
                />
              </div>
            </div>
            <div
              className="navbar-multi text-black p-4"
              style={{ display: "flex", position: "relative" }}
            >
              <div style={{ width: "100%", fontWeight: "bolder" }}>
                <div className="player-box text-center">
                  <div style={{ color: "yellow" }}>{value.state.username}</div>
                  <img src="vs.png" width="25%" style={{ margin: "0 auto" }} />
                  <div style={{ color: "red" }}>{player2}</div>
                </div>
              </div>
              <div
                className="text-end"
                style={{ width: "100%", display: "contents" }}
              >
                <img src="play-a2.png" style={{ height: "8vh" }} />
                <div className="earning-box">
                  <div
                    style={{
                      background: "#787878",
                      padding: "1vh",
                      borderRadius: "1rem",
                    }}
                  >
                    <label>Earnings:</label>
                    <div style={{ fontWeight: "bolder" }}>{score[2]} ETH</div>
                  </div>
                  <img src="play-a1.png" />
                </div>
              </div>
            </div>
          </div>
          <div className="game-box">
            <div style={{ zIndex: "9", width: "80vw" }}>
              <div className="row">
                <div
                  className="col text-center"
                  style={{ alignSelf: "center" }}
                >
                  {!finalResult ? (
                    <div className="mt-4">
                      {rock ? (
                        <img
                          src="Rock.png"
                          className="img-choice"
                          style={{ width: "25vh" }}
                        />
                      ) : (
                        ""
                      )}
                      {paper ? (
                        <img
                          className="img-choice"
                          src="Paper.png"
                          style={{ width: "25vh" }}
                        />
                      ) : (
                        ""
                      )}
                      {scissors ? (
                        <img
                          className="img-choice"
                          src="Scissors.png"
                          style={{ width: "20vh" }}
                        />
                      ) : (
                        ""
                      )}
                    </div>
                  ) : (
                    ""
                  )}
                  {!lockBet ? (
                    <>
                      <div className="row text-black text-center choice-btn">
                        <div className="col col-btn-choice">
                          <button
                            className="btn-choice"
                            onClick={() => {
                              value.setChoice(1);
                              setRock(true);
                              setPaper(false);
                              setScissors(false);
                            }}
                          >
                            <img
                              src="Rock.png"
                              width="100%"
                              style={{ margin: "0 auto" }}
                            />
                          </button>
                        </div>
                        <div className="col col-btn-choice">
                          <button
                            className="btn-choice"
                            onClick={() => {
                              value.setChoice(2);
                              setPaper(true);
                              setRock(false);
                              setScissors(false);
                            }}
                          >
                            <img
                              src="Paper.png"
                              width="100%"
                              style={{ margin: "0 auto" }}
                            />
                          </button>
                        </div>
                        <div className="col col-btn-choice">
                          <button
                            className="btn-choice"
                            onClick={() => {
                              value.setChoice(3);
                              setScissors(true);
                              setPaper(false);
                              setRock(false);
                            }}
                          >
                            <img
                              src="Scissors.png"
                              width="80%"
                              style={{ margin: "0 auto" }}
                            />
                          </button>
                        </div>
                      </div>
                      <br />
                      {/* <div style={{ width: "50%", margin: "0 auto" }}>
                      <Bet />
                    </div> */}
                    </>
                  ) : (
                    ""
                  )}
                  {!lockBet ? (
                    <div className="text-center">
                      <button
                        style={{ width: "40%" }}
                        className="btn-play"
                        onClick={() => {
                          checkNetwork().then(() => {
                            sendCommitment();
                          });
                        }}
                      >
                        Lock
                      </button>
                    </div>
                  ) : (
                    ""
                  )}
                  {lockDone ? (
                    <div className="text-center">
                      {!gameCancelled ? (
                        <>
                          <div className="item button-jittery">
                            <button
                              className="btn-play"
                              style={{ width: "15vh" }}
                              onClick={() => {
                                checkNetwork().then(() => {
                                  sendVerification();
                                });
                              }}
                            >
                              Bet
                            </button>
                          </div>
                        </>
                      ) : (
                        <Text color="red">Game Cancelled</Text>
                      )}
                    </div>
                  ) : (
                    ""
                  )}
                </div>
                {!finalResult ? (
                  <>
                    <div
                      className="col text-center"
                      style={{ alignSelf: "center" }}
                    >
                      <div
                        className="col text-center"
                        style={{ alignSelf: "center" }}
                      >
                        <button
                          className="btn-refund"
                          onClick={() => {
                            reqFund().then(() => {
                              setGameCancelled(true);
                            });
                          }}
                        >
                          <Text color="white">Request Refund</Text>
                        </button>
                        <Text fontSize="xl" fontWeight="bolder" color="white">
                          Room Bet : {value.state.bet}Ξ
                        </Text>
                        <img
                          className="mt-4"
                          src="vs.png"
                          style={{
                            width: "25vh",
                            margin: "auto",
                          }}
                        />
                      </div>
                    </div>
                    <div
                      className="col text-center"
                      style={{ alignSelf: "center" }}
                    >
                      <img
                        src={"RPS.gif"}
                        style={{
                          width: "35vh",
                          margin: "auto",
                        }}
                      />
                      <Text color="white" fontWeight="bold">
                        {player2}
                      </Text>
                      <Code
                        className="text-white"
                        style={{
                          paddingBottom: "4rem",
                          background: "transparent",
                        }}
                      >
                        {player2Addr}
                      </Code>
                    </div>
                  </>
                ) : (
                  ""
                )}
              </div>
              {finalResult ? (
                <div
                  className="text-center text-black"
                  style={{ marginBottom: "10vh" }}
                >
                  {/* <div>
                <GameAlert outcome={value.state.outcome} />
              </div> */}
                  {/* <Search
                  sendSearch={sendSearch}
                  query={value.state.gameId}
                  setQuery={setQuery}
                  gameDetails={gameDetails}
                  score={score}
                  player={player}
                /> */}
                  <PlayerData
                    player={player}
                    score={score}
                    gameDetails={gameDetails}
                    outcome={value.state.outcome}
                    sendSearch={sendSearch}
                    roomOwner={roomOwner}
                    setFinalResult={setFinalResult}
                    setLockBet={setLockBet}
                    setRematchCondition={setRematchCondition}
                    rematchRoom={rematchRoom}
                    rematchCondition={rematchCondition}
                    setGameDetails={setGameDetails}
                  />
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
          <div className="chat-box">
            <div className="chat-room" id="chat-room-id">
              <div className="message message-right" id="message-id"></div>
            </div>
            <div className="type-area">
              <div className="input-wrapper">
                <input
                  type="text"
                  id="inputText"
                  placeholder="Type messages here..."
                />
              </div>
              <button className="button-send">
                <IconSend />
              </button>
            </div>
          </div>
          {/* <div className="chat-box">
          <div className="chat-input-set">
            <Input
              placeholder="Chat here"
              className="chat-input"
              value={chatBox}
              variant="outline"
              onChange={(e) => {
                setChatBox(e.target.value);
              }}
            />
            <button className="btn-send" onClick={() => {}}>
              <IconSend size="28" color="white" />
            </button>
          </div>
        </div> */}
          <div className="bottom-box p-4">
            <div className="set-box text-black" style={{ display: "contents" }}>
              <div className="win-rate">
                Win <b>{score[0] || "0"}</b>
              </div>
              <div className="win-rate">
                Lose <b>{score[1] || "0"}</b>
              </div>
              <div>
                <img src="play-a4.png" />
              </div>
            </div>
            <div className="set-box text-end text-white">
              Status : <br />
              <Status pending={pending} />
            </div>
          </div>
        </div>
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
      <Modal size="lg" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent top="6rem" background="#787878">
          <ModalHeader>Tips</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mt={1} fontSize="lg">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam
              tristique, arcu mollis rutrum dictum, lorem risus tincidunt purus,
              id facilisis elit tortor ut lacus. Pellentesque fringilla risus
              sapien, vitae tempor leo bibendum vel. Quisque at leo eu dolor
              vestibulum commodo vel in sem. Phasellus ligula elit, scelerisque
              at quam eu, auctor faucibus dui. Pellentesque aliquet at sapien
              non tempus. Suspendisse potenti. Donec tempus sit amet dolor ut
              feugiat. Nunc a justo nulla. Nullam rutrum et diam malesuada
              posuere. Donec ornare quis nisl sed placerat. Nunc rutrum auctor
              risus ultricies finibus. Ut sagittis ex laoreet nibh iaculis, at
              ullamcorper metus laoreet. Quisque quis urna placerat, dictum enim
              et, efficitur odio.
            </Text>
          </ModalBody>

          <ModalFooter>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                value=""
                id="flexCheckDefault"
                onInput={(e) => {
                  setTips("true");
                  window.sessionStorage.setItem("tips", tips);
                }}
              />
              <label class="form-check-label" for="flexCheckDefault">
                Do not show again
              </label>
            </div>
            <button
              className="btn-menu-modal"
              onClick={() => {
                onClose();
              }}
            >
              Close
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Play;
