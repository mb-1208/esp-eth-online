import { Box, Heading, HStack, Text, Divider } from "@chakra-ui/layout";
import { Code } from "@chakra-ui/react";
import AppContext from "../utils/AppContext";
import { useContext, useEffect, useState } from "react";
import { useDisclosure } from "@chakra-ui/hooks";
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
import { IconRefresh } from "@tabler/icons";
import { nanoid } from "nanoid";
import { useRouter } from "next/router";
import axios from "axios";
import { ethers } from "ethers";
import { io } from "socket.io-client";
import RPS from "../../contracts/RPS.json";

export const PlayerData = ({
  gameDetails,
  player,
  score,
  outcome,
  sendSearch,
  roomOwner,
  setFinalResult,
  setLockBet,
  setRematchCondition,
  rematchRoom,
  rematchCondition,
  setGameDetails,
}) => {
  const arbitrumAddress = "0xE57B62c8De212966fc5956811F6efC24b501B78e"; // L2 Arbitrum Rinkeby
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [wins, losses, earnings] = score;
  const newId = nanoid();
  const router = useRouter();
  const toast = useToast();
  const [imgResult, setImageResult] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [dataDetails, setDataDetails] = useState(null);
  const value = useContext(AppContext);
  const [rpsAddress, setRpsAddress] = useState(arbitrumAddress);
  const emptyBytes =
    "0x0000000000000000000000000000000000000000000000000000000000000000";
  const emptyAddress = "0x0000000000000000000000000000000000000000";
  const getChoice = (num) => {
    switch (num) {
      case 0:
        return "Unknown";
      case 1:
        return "Rock";
      case 2:
        return "Paper";
      case 3:
        return "Scissors";
    }
  };

  const videoEnded = () => {
    // onClose();
    setShowResult(true);
  };

  function redirect() {
    window.setTimeout(function () {
      setShowResult(true);
    }, 5160);
  }

  const createRoomDb = async () => {
    const newId = nanoid();
    const socket = io("http://localhost:5000");
    value.setGameId(newId);
    value.setBytesGameId(ethers.utils.id(newId));
    // console.log(newId);
    value.setStatus(0);
    value.setOutcome("unknown");
    value.setChoice(1);
    const setRoom = "Private";

    try {
      await axios
        .patch(
          `https://www.boxcube.space/api/listroom/${value.state.roomNum}`,
          {
            setRoom,
          }
        )
        .then(async () => {
          value.setRematch("rematch");
          setFinalResult(false);
          setLockBet(false);
          socket.emit("rematch", value.state.roomId, newId);
          setRematchCondition(false);
        });
    } catch (e) {
      console.log(e);
    }
  };

  const getAniResult = async (e) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(rpsAddress, RPS.abi, signer);
    const transaction = await contract.getGameDetails(
      ethers.utils.id(value.state.gameId)
    );

    const dataDetails = {
      ...transaction,
      bet: ethers.utils.formatEther(transaction.bet.toString()),
    };
    // console.log(dataDetails);
    // console.log(gameDetails);
    if (dataDetails !== null) {
      if (dataDetails.gameState === 3) {
        if (
          getChoice(dataDetails.p1Choice) === "Scissors" &&
          getChoice(dataDetails.p2Choice) === "Rock"
        ) {
          setImageResult("scissor-rock");
        } else if (
          getChoice(dataDetails.p1Choice) === "Rock" &&
          getChoice(dataDetails.p2Choice) === "Scissors"
        ) {
          setImageResult("rock-scissor");
        } else if (
          getChoice(dataDetails.p1Choice) === "Paper" &&
          getChoice(dataDetails.p2Choice) === "Scissors"
        ) {
          setImageResult("paper-scissor");
        } else if (
          getChoice(dataDetails.p1Choice) === "Scissors" &&
          getChoice(dataDetails.p2Choice) === "Paper"
        ) {
          setImageResult("scissor-rock");
        } else if (
          getChoice(dataDetails.p1Choice) === "Rock" &&
          getChoice(dataDetails.p2Choice) === "Paper"
        ) {
          setImageResult("rock-paper");
        } else if (
          getChoice(dataDetails.p1Choice) === "Paper" &&
          getChoice(dataDetails.p2Choice) === "Rock"
        ) {
          setImageResult("paper-rock");
        } else if (
          getChoice(dataDetails.p1Choice) === "Rock" &&
          getChoice(dataDetails.p2Choice) === "Rock"
        ) {
          setImageResult("rock-rock");
        } else if (
          getChoice(dataDetails.p1Choice) === "Paper" &&
          getChoice(dataDetails.p2Choice) === "Paper"
        ) {
          setImageResult("paper-paper");
        } else if (
          getChoice(dataDetails.p1Choice) === "Scissors" &&
          getChoice(dataDetails.p2Choice) === "Scissors"
        ) {
          setImageResult("scissor-scissor");
        }
      }
    }
    if (gameDetails !== null) {
      if (gameDetails.gameState === 3) {
        if (
          getChoice(gameDetails.p1Choice) === "Scissors" &&
          getChoice(gameDetails.p2Choice) === "Rock"
        ) {
          setImageResult("scissor-rock");
        } else if (
          getChoice(gameDetails.p1Choice) === "Rock" &&
          getChoice(gameDetails.p2Choice) === "Scissors"
        ) {
          setImageResult("rock-scissor");
        } else if (
          getChoice(gameDetails.p1Choice) === "Paper" &&
          getChoice(gameDetails.p2Choice) === "Scissors"
        ) {
          setImageResult("paper-scissor");
        } else if (
          getChoice(gameDetails.p1Choice) === "Scissors" &&
          getChoice(gameDetails.p2Choice) === "Paper"
        ) {
          setImageResult("scissor-paper");
        } else if (
          getChoice(gameDetails.p1Choice) === "Rock" &&
          getChoice(gameDetails.p2Choice) === "Paper"
        ) {
          setImageResult("rock-paper");
        } else if (
          getChoice(gameDetails.p1Choice) === "Paper" &&
          getChoice(gameDetails.p2Choice) === "Rock"
        ) {
          setImageResult("paper-rock");
        } else if (
          getChoice(gameDetails.p1Choice) === "Rock" &&
          getChoice(gameDetails.p2Choice) === "Rock"
        ) {
          setImageResult("rock-rock");
        } else if (
          getChoice(gameDetails.p1Choice) === "Paper" &&
          getChoice(gameDetails.p2Choice) === "Paper"
        ) {
          setImageResult("paper-paper");
        } else if (
          getChoice(gameDetails.p1Choice) === "Scissors" &&
          getChoice(gameDetails.p2Choice) === "Scissors"
        ) {
          setImageResult("scissor-scissor");
        }
      }
    }
  };

  useEffect(() => {
    console.log(imgResult);
    getAniResult();
    if (outcome !== "unknown") {
      sendSearch();
      // setShowResult(false);
      // console.log(showResult);
    }
    if (roomOwner !== value.state.walletFromDb) {
      if (rematchCondition) {
        onOpen();
      }
    }
  }, [outcome, rematchCondition, imgResult]);

  if (!gameDetails) {
    return null;
  }
  if (gameDetails.player1 !== emptyAddress) {
    return (
      <Box p={2} rounded="lg" borderColor="gray.200" mt={3}>
        {gameDetails.gameState === 1 && (
          <div className="text-center">
            <Text fontWeight="bold" color="white">
              Waiting for another player response..
            </Text>
          </div>
        )}
        {gameDetails.gameState === 2 && (
          <>
            <div className="text-center">
              <Text fontWeight="bold" color="white">
                Waiting for another player to choose..
              </Text>
              <Code className="text-white">Bet for {gameDetails.bet} ETH</Code>
              <br />
              <button
              className="btn-ref"
                onClick={() => {
                  setImageResult("");
                  setShowResult(false);
                  sendSearch();
                  // toast({
                  //   title: "Result Updated!",
                  //   status: "success",
                  //   duration: 5000,
                  //   isClosable: true,
                  //   position: "top",
                  // });
                }}
              >
                Update Result <IconRefresh color="#ef6b9a" />
              </button>
              <div className="row mt-5">
                <div
                  className="col text-center"
                  style={{ alignSelf: "center" }}
                >
                  <img
                    src={"RPS.gif"}
                    style={{
                      width: "25vh",
                      margin: "auto",
                    }}
                  />
                  <Text fontWeight="bold" color="white">
                    {gameDetails.player1Name}
                  </Text>
                  <Code className="text-white">{gameDetails.player1}</Code>
                </div>
                <div
                  className="col text-center"
                  style={{ alignSelf: "center" }}
                >
                  <img
                    src="vs.png"
                    style={{
                      width: "25vh",
                      margin: "auto",
                    }}
                  />
                </div>
                <div
                  className="col text-center"
                  style={{ alignSelf: "center" }}
                >
                  {gameDetails.gameState === 2 ? (
                    <img
                      src={"RPS.gif"}
                      style={{
                        width: "25vh",
                        margin: "auto",
                      }}
                    />
                  ) : (
                    <>
                      <img
                        src={getChoice(gameDetails.p2Choice) + ".png"}
                        style={{
                          width: "25vh",
                          margin: "auto",
                        }}
                      />
                    </>
                  )}
                  <Text fontWeight="bold" color="white">
                    {gameDetails.player2Name}
                  </Text>
                  <Code className="text-white">{gameDetails.player2}</Code>
                </div>
              </div>
            </div>
          </>
        )}
        {gameDetails.gameState === 3 && (
          <>
            {showResult ? (
              <>
                <div className="text-center">
                  {gameDetails.winner === value.state.walletFromDb ? (
                    <Heading style={{ color: "green" }}>
                      Congratulations You Won The Game!
                    </Heading>
                  ) : (
                    <Heading style={{ color: "red" }}>
                      Better Luck Next Time!
                    </Heading>
                  )}
                  {gameDetails.winner !== emptyAddress ? (
                    <>
                      <Text fontWeight="bold" color="white">
                        Winner:
                      </Text>
                      <Code className="text-white">{gameDetails.winner}</Code>
                    </>
                  ) : (
                    <>
                      <Text fontWeight="bold" color="white">
                        Result:
                      </Text>
                      <Code className="text-white">Draw</Code>
                    </>
                  )}
                  ~ <Code className="text-white">{gameDetails.bet} ETH</Code>
                </div>
                {roomOwner === value.state.walletFromDb ? (
                  <div className="mt-2">
                    <button
                      className="btn-rematch"
                      onClick={() => {
                        createRoomDb();
                      }}
                    >
                      Rematch
                    </button>
                  </div>
                ) : (
                  <div className="mt-2">
                    <button className="btn-rematch-disable">
                      Waiting for rematch...
                    </button>
                  </div>
                )}
                <div className="row">
                  <div
                    className="col text-center"
                    style={{ alignSelf: "center" }}
                  >
                    <img
                      src={getChoice(gameDetails.p1Choice) + ".png"}
                      style={{
                        width: "25vh",
                        margin: "auto",
                      }}
                    />
                    <Text fontWeight="bold" color="white">
                      {gameDetails.player1Name}
                    </Text>
                    <Code className="text-white">{gameDetails.player1}</Code>
                  </div>
                  <div
                    className="col text-center"
                    style={{ alignSelf: "center" }}
                  >
                    <img
                      src="vs.png"
                      style={{
                        width: "25vh",
                        margin: "auto",
                      }}
                    />
                  </div>
                  <div
                    className="col text-center"
                    style={{ alignSelf: "center" }}
                  >
                    {gameDetails.player2 !== emptyAddress && (
                      <>
                        {gameDetails.gameState === 2 ? (
                          <img
                            src={"RPS.gif"}
                            style={{
                              width: "25vh",
                              margin: "auto",
                            }}
                          />
                        ) : (
                          <>
                            <img
                              src={getChoice(gameDetails.p2Choice) + ".png"}
                              style={{
                                width: "25vh",
                                margin: "auto",
                              }}
                            />
                          </>
                        )}
                        <Text fontWeight="bold" color="white">
                          {gameDetails.player2Name}
                        </Text>
                        <Code className="text-white">
                          {gameDetails.player2}
                        </Code>
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* <video
                  key={imgResult}
                  id="video1"
                  style={{ margin: "0 auto" }}
                  width="45%"
                  autoPlay
                  muted
                  onEnded={() => videoEnded()}
                >
                  <source src={imgResult + ".mp4"} type="video/mp4" />
                  Your browser does not support HTML5 video.
                </video> */}
                <img
                  style={{ width: "75vh", margin: "0 auto" }}
                  onLoad={redirect()}
                  src={imgResult + ".webp"}
                />
              </>
            )}
          </>
        )}
        <Modal
          isCentered
          size="lg"
          closeOnOverlayClick={false}
          isOpen={isOpen}
          onClose={onClose}
        >
          <ModalOverlay />
          <ModalContent top="6rem" background="#787878">
            <ModalHeader>Rematch</ModalHeader>
            <ModalBody>
              <Text fontSize="lg">Room Master invite you to rematch!</Text>
            </ModalBody>

            <ModalFooter>
              <button
                className="btn-menu-modal"
                onClick={() => {
                  // console.log(rematchRoom);
                  value.setGameId(rematchRoom);
                  value.setBytesGameId(ethers.utils.id(rematchRoom));
                  value.setStatus(0);
                  value.setOutcome("unknown");
                  value.setChoice(1);
                  value.setRematch("rematch");
                  setRematchCondition(false);
                  setFinalResult(false);
                  setLockBet(false);
                  onClose();
                }}
              >
                Confirm
              </button>

              <button
                className="btn-menu-modal"
                onClick={() => {
                  router.push("/menu");
                }}
              >
                Quit
              </button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    );
  }
};
