import { Box, Heading, HStack, Text, Divider } from "@chakra-ui/layout";
import { Code } from "@chakra-ui/react";
import AppContext from "../utils/AppContext";
import { useContext } from "react";

export const PlayerData = ({
  gameDetails,
  player,
  score,
  outcome,
  sendSearch,
}) => {
  const [wins, losses, earnings] = score;
  const value = useContext(AppContext);
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

  if (!gameDetails) {
    return null;
  }
  if (gameDetails.player1 !== emptyAddress) {
    return (
      <Box p={2} rounded="lg" borderColor="gray.200" mt={3}>
        {gameDetails.gameState === 1 && (
          <div className="text-center">
            <Text fontWeight="bold">Waiting for another player response..</Text>
          </div>
        )}
        {gameDetails.gameState === 2 && (
          <>
            <div className="text-center">
              <Text fontWeight="bold">
                Waiting for another player to choose..
              </Text>
              <Code className="text-black">Bet for {gameDetails.bet} ETH</Code>
            </div>
          </>
        )}
        {gameDetails.gameState === 3 && (
          <>
            <div className="text-center">
              {value.state.outcome === "win" ? (
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
                  <Text fontWeight="bold">Winner:</Text>
                  <Code className="text-black">{gameDetails.winner}</Code>
                </>
              ) : (
                <>
                  <Text fontWeight="bold">Result:</Text>
                  <Code className="text-black">Draw</Code>
                </>
              )}
              ~ <Code className="text-black">{gameDetails.bet} ETH</Code>
            </div>
          </>
        )}
        {/* {gameDetails.gameState === 4 && (
          <HStack mt={2}>
            <Text fontWeight="bold">Status:</Text>
            <Code className="text-black">Cancelled</Code>
          </HStack>
        )} */}
        <div className="row">
          <div className="col text-center" style={{ alignSelf: "center" }}>
            <img
              src={getChoice(gameDetails.p1Choice) + ".png"}
              style={{
                width: "25vh",
                margin: "auto",
              }}
            />
            <Text fontWeight="bold">{gameDetails.player1Name}</Text>
            <Code className="text-black">{gameDetails.player1}</Code>
          </div>
          <div className="col text-center" style={{ alignSelf: "center" }}>
            <img
              src="vs.png"
              style={{
                width: "25vh",
                margin: "auto",
              }}
            />
          </div>
          <div className="col text-center" style={{ alignSelf: "center" }}>
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
                <Text fontWeight="bold">{gameDetails.player2Name}</Text>
                <Code className="text-black">{gameDetails.player2}</Code>
              </>
            )}
          </div>
        </div>
        <div>
          <label>
            <i style={{ color: "red" }}>
              Refresh to get newest response from another player
            </i>
          </label>
        </div>
        <button
          className="btn-play"
          onClick={sendSearch}
          style={{ width: "15%" }}
        >
          Refresh
        </button>
      </Box>
    );
  }
};
