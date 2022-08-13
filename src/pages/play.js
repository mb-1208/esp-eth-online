import { useContext, useState, useEffect } from "react";
import AppContext from "../utils/AppContext";
import RPS from "../../contracts/RPS.json";
import { IconButton } from "@chakra-ui/button";
import { CopyIcon } from "@chakra-ui/icons";
import { Input } from "@chakra-ui/input";
import { useClipboard, useDisclosure } from "@chakra-ui/hooks";
import "bootstrap/dist/css/bootstrap.min.css";
import { IconArrowLeft } from "@tabler/icons";
import {
  Center,
  HStack,
  VStack,
  Text,
  Box,
  GridItem,
  Grid,
  Divider,
  SimpleGrid,
} from "@chakra-ui/layout";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";

import { RoundedButton } from "../components/Buttons/RoundedButton";
import { useColorMode } from "@chakra-ui/color-mode";
import { GameAlert } from "../components/GameAlert";
import { Select, Spinner, useToast } from "@chakra-ui/react";
import { Bet } from "../components/Bet";
import { Icon } from "@iconify/react";
import { ethers } from "ethers";
import { CancelButton } from "../components/Buttons/CancelButton";
import { ReplayButton } from "../components/Buttons/ReplayButton";
import { Search } from "../components/Search";
import { Status } from "../components/Status";
import { PlayerData } from "../components/PlayerData";

const arbitrumAddress = "0x940E847a290582FAb776F8Ae794f23D9B660a6d2"; // L2 Arbitrum Rinkeby

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
      console.log("cekcek");
      try {
        console.log("cek");
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
        console.log("test doang");
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
        console.log("test "+ err);
        toast({
          title: "Lock Failed!",
          description: "Something wrong please try again.",
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
          description: "Make sure both players lock the choice first, or please try again",
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
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(rpsAddress, RPS.abi, signer);
        if (isAddress.test(query)) {
          const transaction = await contract.getPlayerDetails(query);
          setPlayer(query);
          const [wins, losses, earnings] = transaction;
          setGameDetails(null);
          setScore([
            wins.toString(),
            losses.toString(),
            ethers.utils.formatEther(earnings.toString()),
          ]);
        } else {
          const transaction = await contract.getGameDetails(
            ethers.utils.id(value.state.gameId)
          );

          const gameDetails = {
            ...transaction,
            bet: ethers.utils.formatEther(transaction.bet.toString()),
          };
          setGameDetails(gameDetails);
          setPlayer2(gameDetails.player2Name);
        }
        getPlayerData();
        toast({
          title: "Updated!",
          description: "Success to get newest reponse.",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      } catch (err) {
        // console.error(err);
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
            title: "Opponent Committed!",
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
        setPlayer2(gameDetails.player2Name);
      } catch (err) {
        console.error("Error: ", err);
      }
    }
  };

  const getPlayerData = async () => {
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
    }
  };

  useEffect(async () => {
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
              <a href="/">
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
            {!finalResult ? (
              <>
                {rock ? (
                  <img
                    className="mb-4"
                    src="Rock.png"
                    style={{ margin: "0 auto" }}
                  />
                ) : (
                  ""
                )}
                {paper ? (
                  <img
                    className="mb-4"
                    src="Paper.png"
                    style={{ margin: "0 auto" }}
                  />
                ) : (
                  ""
                )}
                {scissors ? (
                  <img
                    className="mb-4"
                    src="Scissors.png"
                    style={{ margin: "0 auto" }}
                  />
                ) : (
                  ""
                )}
              </>
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
                        width="30%"
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
                        width="30%"
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
                        width="30%"
                        style={{ margin: "0 auto" }}
                      />
                    </button>
                  </div>
                </div>
                <div style={{ width: "50%", margin: "0 auto" }}>
                  <Bet />
                </div>
              </>
            ) : (
              ""
            )}
            {!lockBet ? (
              <div className="text-center">
                <button
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
                  style={{ width: "60%" }}
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
