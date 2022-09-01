import { useContext, useState, useEffect } from "react";
import AppContext from "../utils/AppContext";
import RPS from "../../contracts/RPS.json";
import { IconButton } from "@chakra-ui/button";
import { CopyIcon } from "@chakra-ui/icons";
import { useClipboard, useDisclosure } from "@chakra-ui/hooks";
import "bootstrap/dist/css/bootstrap.min.css";
import { IconArrowLeft } from "@tabler/icons";
import {
  Text,
} from "@chakra-ui/layout";
import { Code } from "@chakra-ui/react";

import { useColorMode } from "@chakra-ui/color-mode";
import { Select, Spinner, useToast } from "@chakra-ui/react";
import { ethers } from "ethers";
import { Status } from "../components/Status";
import { PlayerData } from "../components/PlayerData";
import axios from "axios";
import { io } from "socket.io-client";
import { useRouter } from "next/router";

const arbitrumAddress = "0x7D8f4803DCc03Cc7C7Ae4319891791A6c9de6367"; // L2 Arbitrum Rinkeby

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
  const [resultAppear, setResultAppear] = useState(false);
  const [lockDone, setLockDone] = useState(false);
  const [lockBet, setLockBet] = useState(false);
  const [pending, setPending] = useState(false);
  const [rpsAddress, setRpsAddress] = useState(arbitrumAddress);

  const getRequireError = (err) => {
    if (err.code === 4001) {
      return;
    }
    // console.log(err);
    if (rpsAddress === arbitrumAddress && err.data.message) {
      return err.data.message.replace("execution reverted:", "");
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
  const [rock, setRock] = useState(true);
  const [paper, setPaper] = useState(false);
  const [scissors, setScissors] = useState(false);
  const [query, setQuery] = useState("");
  const [score, setScore] = useState([]);
  const [player, setPlayer] = useState("");
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
        });
        setPending(false);
        // Ensure that we aren't backtracking the game status
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
          description: "Make sure your bet is the same with other player",
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
        await requestAccount();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(rpsAddress, RPS.abi, signer);
        const transaction = await contract.sendVerification(
          value.state.bytesGameId,
          value.state.choice,
          ethers.BigNumber.from(nonce)
        );
        value.setStatus(2.1);
        setPending(true);
        await transaction.wait().then(() => {
          setLockDone(false);
          setResultAppear(true);
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
          setPlayer2(gameDetails.player2Name);
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
          toast({
            title: "Opponent Updated!",
            description: "Please verify your choice",
            status: "info",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
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
          } else if (winnerAddress === address) {
            value.setOutcome("win");
          } else {
            value.setOutcome("loss");
          }
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
        setPlayer2(gameDetails.player2Name || "Player 2");
      } catch (err) {
        console.error("Error: ", err);
      }
    }
  };

  const updateResult = async (win, lose, earnings, address) => {
    // console.log(win, lose, earnings, address);
    await axios.patch(
      `https://www.boxcube.space/api/leaderboardvs/address/${address}`,
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
    const response = await axios.get(
      `https://boxcube.space/api/listroom/room/${value.state.gameId}`
    );
    if (response.data !== null) {
      liveData(response.data.roomId);
      value.setBet(parse(response.data.bet));
      console.log(parse(response.data.bet));
    } else {
      toast({
        title: `Room not detected!`,
        description: 'Please create room first',
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      router.push("/menu");
    }
  };

  const getPlayerData = async (gameDetails) => {
    await requestAccount();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const signerAddress = await signer.getAddress();
    const contract = new ethers.Contract(rpsAddress, RPS.abi, signer);
    if (isAddress.test(signerAddress)) {
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
    }
  };

  const liveData = async (roomId) => {
    const socket = io("http://localhost:5000");
    socket.on("connect", () => {
      socket.emit("new-user", roomId, value.state.username);
      socket.on("user-connected", (message) => {
        toast({
          title: `${message} has join the game!`,
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      });
      socket.on("user-disconnected", (message) => {
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

  useEffect(async () => {
    liveData();
    getRoomDb();
    checkEvents();
    getPlayerData();
    sendSearch();
  }, []);

  return (
    <>
      <div className="multiplayer-section">
        <div className="nav-position">
          <div
            className="navbar-multi text-black p-4"
            style={{ display: "flex" }}
          >
            <div style={{ width: "100%" }}>
              <a href="/menu">
                <IconArrowLeft />
              </a>
            </div>
            <div className="text-center" style={{ width: "100%" }}>
              <img
                src="pawws.png"
                style={{ height: "5vh", margin: "0 auto" }}
              />
            </div>
            <div className="text-end" style={{ width: "100%" }}>
              Room Number: <strong>1</strong>
              <br />
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
            style={{ display: "flex" }}
          >
            <div style={{ width: "100%", fontWeight: "bolder" }}>
              <div className="player-box text-center">
                <div className="mb-2" style={{ fontSize: "2vh" }}>
                  Player VS
                </div>
                <div style={{ color: "yellow" }}>{value.state.username}</div>
                <img src="vs.png" width="100%" />
                <div style={{ color: "red" }}>{player2}</div>
              </div>
            </div>
            <div className="text-end" style={{ width: "100%" }}>
              <div className="earning-box">
                <label>Earnings:</label>
                <div style={{ fontWeight: "bolder" }}>{score[2]} ETH</div>
              </div>
            </div>
          </div>
        </div>
        <div className="game-box">
          <div style={{ zIndex: "9", width: "80vw" }}>
            <div className="row">
              <div className="col text-center" style={{ alignSelf: "center" }}>
                {!finalResult ? (
                  <div className="mt-4">
                    {rock ? (
                      <img
                        src="Rock.png"
                        style={{
                          width: "30vh",
                          margin: "0 auto",
                          padding: "1rem 0",
                        }}
                      />
                    ) : (
                      ""
                    )}
                    {paper ? (
                      <img
                        className="mb-4"
                        src="Paper.png"
                        style={{
                          width: "30vh",
                          margin: "0 auto",
                          padding: "1rem 0",
                        }}
                      />
                    ) : (
                      ""
                    )}
                    {scissors ? (
                      <img
                        className="mb-4"
                        src="Scissors.png"
                        style={{
                          width: "30vh",
                          margin: "0 auto",
                          padding: "1rem 0",
                        }}
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
                    <div
                      className="row text-black text-center"
                      style={{ width: "50%", margin: "0 auto" }}
                    >
                      <div className="col">
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
                      <div className="col">
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
                      <div className="col">
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
                            width="100%"
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
                        sendCommitment();
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
                    <button
                      className="btn-play"
                      style={{ width: "15%" }}
                      onClick={() => {
                        sendVerification();
                      }}
                    >
                      Bet
                    </button>
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
                      <Text fontSize="xl" fontWeight="bolder" color="#6d8725">
                        Room Bet : {value.state.bet}
                      </Text>
                      <img
                        src="vs.png"
                        style={{
                          width: "40vh",
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
                    <Text color="black" fontWeight="bold">
                      Player 2
                    </Text>
                    <Code
                      className="text-black"
                      style={{ paddingBottom: "4rem" }}
                    >
                      Waiting...
                    </Code>
                  </div>
                </>
              ) : (
                ""
              )}
            </div>
            {finalResult ? (
              <div className="text-center text-black">
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
                />
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
        <div className="bottom-box p-4">
          <div className="set-box text-black" style={{ display: "contents" }}>
            <div className="win-rate">
              Win <b>{score[0] || "0"}</b>
            </div>
            <div className="win-rate">
              Lose <b>{score[1] || "0"}</b>
            </div>
          </div>
          <div className="set-box text-end text-black">
            Status : <br />
            <Status pending={pending} />
          </div>
        </div>
      </div>
    </>
    // <Center mt={2} mx={2}>
    //   <VStack>
    //     <GameAlert outcome={value.state.outcome} />

    //     <Box
    //       boxShadow={colorMode === "light" ? "lg" : "dark-lg"}
    //       maxW="md"
    //       borderRadius="lg"
    //       overflow="hidden"
    //       m={3}
    //     >
    //       <Box p={4}>
    //         <Divider mt={4} />
    //         <Center mt={4}>
    //           <Search
    //             sendSearch={sendSearch}
    //             query={query}
    //             setQuery={setQuery}
    //             gameDetails={gameDetails}
    //             score={score}
    //             player={player}
    //           />
    //           <SimpleGrid ml={2} columns={4} spacing={2}>
    //             <CommitmentButton sendCommitment={sendCommitment} />

    //             <VerificationButton sendVerification={sendVerification} />

    //             <ReplayButton />

    //             <CancelButton cancel={cancel} />
    //           </SimpleGrid>
    //         </Center>
    //       </Box>
    //     </Box>
    //   </VStack>
    // </Center>
  );
};

export default Play;
