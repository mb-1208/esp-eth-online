import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect, Suspense } from "react";
import { IconArrowLeft, IconCrown } from "@tabler/icons";
import axios from "axios";
import { Text, Center } from "@chakra-ui/layout";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Spinner } from "@chakra-ui/spinner";

ChartJS.register(ArcElement, Tooltip, Legend);

const Stats = () => {
  const [dataTop, setDataTop] = useState([]);
  const [dataGraph, setDataGraph] = useState({
    labels: ["Rock", "Paper", "Scissor"],
    datasets: [
      {
        label: "# of Votes",
        data: [0, 0, 0],
        backgroundColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        borderWidth: 2,
      },
    ],
  });
  const [dataBet, setDataBet] = useState("");
  const [dataTotalMatch, setDataTotalMatch] = useState("");
  const [dataHighestWin, setDataHighestWin] = useState("");
  const [dataHighestLose, setDataHighestLose] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(async () => {
    setLoading(true);
    const data = await getData();
    const dataMatch = await getDataMatch();
    setDataTotalMatch(dataMatch.length.toString());
    graphData(dataMatch);
    calculateTotalBet(dataMatch);
    await highestWin(data);
    await getTopCollection(data);
    await highestLose(data);
  }, []);

  const graphData = (dataMatch) => {
    var p1Rock = dataMatch.filter((obj) => {
      return obj.player1Choice === "rock";
    });
    var p1Paper = dataMatch.filter((obj) => {
      return obj.player1Choice === "paper";
    });
    var p1Scissor = dataMatch.filter((obj) => {
      return obj.player1Choice === "scissor";
    });

    var p2Rock = dataMatch.filter((obj) => {
      return obj.player2Choice === "rock";
    });
    var p2Paper = dataMatch.filter((obj) => {
      return obj.player2Choice === "paper";
    });
    var p2Scissor = dataMatch.filter((obj) => {
      return obj.player2Choice === "scissor";
    });

    const dataRock = p1Rock.length + p2Rock.length;
    const dataPaper = p1Paper.length + p2Paper.length;
    const dataScissor = p1Scissor.length + p2Scissor.length;
    setDataGraph({
      labels: ["Rock", "Paper", "Scissor"],
      datasets: [
        {
          label: "# of Votes",
          data: [dataRock, dataPaper, dataScissor],
          backgroundColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
          ],
          borderWidth: 2,
        },
      ],
    });
    setLoading(false);
  };

  const getData = async (e) => {
    const response = await axios.get("https://www.boxcube.space/api/leaderboardvs");
    return response.data;
  };

  const getDataMatch = async (e) => {
    const response = await axios.get("https://www.boxcube.space/api/matchresult");
    return response.data;
  };

  const calculateTotalBet = (dataMatch) => {
    Array.prototype.sum = function (prop) {
      var total = 0;
      for (var i = 0, _len = this.length; i < _len; i++) {
        total += parseFloat(this[i][prop]);
      }
      return total;
    };
    setDataBet((dataMatch.sum(`bet`)).toString());
    console.log(dataMatch.sum(`bet`));
  };

  const highestWin = async (data) => {
    const highestWin = data.sort(function (a, b) {
      return b.win - a.win;
    });
    setDataHighestWin(highestWin[0].win);
  };

  const highestLose = async (data) => {
    const highestLose = data.sort(function (a, b) {
      return b.lose - a.lose;
    });
    setDataHighestLose(highestLose[0].lose);
  };

  const getTopCollection = async () => {
    const data = await getData();
    const dataSort = data.sort(function (a, b) {
      const bFirst = parseInt(b.win) + parseInt(b.lose);
      const aFisrt = parseInt(a.win) + parseInt(a.lose);
      return bFirst - aFisrt;
    });
    setDataTop(dataSort);
  };

  if (dataGraph === undefined) {
    return <Spinner />;
  }

  return (
    <>
      <div className="stats-section">
        <div className="p-4" style={{ display: "flex" }}>
          <Center className="me-2">
            <a href="/menu" className="text-black">
              <IconArrowLeft color="#fec078" />
            </a>
          </Center>
          <div className="text-center" style={{ width: "100%" }}>
            <Text
              className="ms-2"
              color="#6d8725"
              fontSize="3xl"
              fontWeight="bolder"
            >
              Pawws RPS Stats
            </Text>
          </div>
        </div>
        <div className="container">
          <div
            className="row text-black text-center"
            style={{ width: "100%", margin: "0 auto" }}
          >
            <div className="col-sm-6 p-4">
              <div className="card" style={{ height: "50vh" }}>
                <Center style={{ height: "100%" }}>
                  <div
                    className="donut-size pt-1"
                    style={{ placeContent: "center" }}
                  >
                    {loading ? (
                      <Spinner color="green" />
                    ) : (
                      <Doughnut data={dataGraph} />
                    )}
                  </div>
                </Center>
                <hr />
                <div className="p-2">
                  <Text color="#545458" fontSize="xl">
                    Most Choices Choosen
                  </Text>
                  <Text color="#545458" fontSize="sm">
                    Overall Record
                  </Text>
                </div>
              </div>
            </div>
            <div className="col-sm-6 p-4" style={{ display: "grid" }}>
              <div className="card m-2" style={{ height: "15vh" }}>
                <Center style={{ height: "100%" }}>
                  <Text color="white" fontSize="3xl" fontWeight="bolder">
                    {dataHighestWin} Win
                  </Text>
                </Center>
                <hr />
                <div className="p-2">
                  <Text color="#545458" fontSize="xl">
                    Highest Win
                  </Text>
                  <Text color="#545458" fontSize="sm">
                    Overall Total
                  </Text>
                </div>
              </div>
              <div className="card m-2" style={{ height: "15vh" }}>
                <Center style={{ height: "100%" }}>
                  <Text color="white" fontSize="3xl" fontWeight="bolder">
                    {dataHighestLose} Lose
                  </Text>
                </Center>
                <hr />
                <div className="p-2">
                  <Text color="#545458" fontSize="xl">
                    Highest Lose
                  </Text>
                  <Text color="#545458" fontSize="sm">
                    Overall Total
                  </Text>
                </div>
              </div>
              <div className="row">
                <div className="col-sm-6" style={{ paddingRight: "0" }}>
                  <div className="card m-2" style={{ height: "15vh" }}>
                    <Center style={{ height: "100%" }}>
                      <Text color="white" fontSize="3xl" fontWeight="bolder">
                        {dataBet} Eth
                      </Text>
                    </Center>
                    <hr />
                    <div className="p-2">
                      <Text color="#545458" fontSize="xl">
                        Total Bet
                      </Text>
                      <Text color="#545458" fontSize="sm">
                        Overall Bet Recorded
                      </Text>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6" style={{ paddingLeft: "0" }}>
                  <div className="card m-2" style={{ height: "15vh" }}>
                    <Center style={{ height: "100%" }}>
                      <Text color="white" fontSize="3xl" fontWeight="bolder">
                        {dataTotalMatch} Match
                      </Text>
                    </Center>
                    <hr />
                    <div className="p-2">
                      <Text color="#545458" fontSize="xl">
                        Match Played
                      </Text>
                      <Text color="#545458" fontSize="sm">
                        Overall Match
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="card p-4">
              <Text
                className="pb-2"
                color="white"
                fontWeight="bolder"
                fontSize="xl"
              >
                Top 10 Match Player
              </Text>
              {dataTop.slice(0, 10).map((data, index) => {
                return (
                  <div
                    className="pt-1"
                    style={{ display: "flex", borderBottom: "1px solid" }}
                    key={index}
                  >
                    <div className="me-4">
                      {index === 0 ? (
                        <IconCrown color="yellow" />
                      ) : index === 1 ? (
                        <IconCrown color="grey" />
                      ) : index === 2 ? (
                        <IconCrown color="brown" />
                      ) : (
                        <div className="me-3">{index + 1}</div>
                      )}
                    </div>
                    <div className="me-4" style={{ width: "20%" }}>
                      <Text color="white" fontSize="lg">
                        {data.walletName}
                      </Text>
                    </div>
                    <div style={{ width: "100%", alignSelf: "center" }}>
                      <div className="progress">
                        {index === 0 || index === 1 || index === 2 ? (
                          <div
                            className="progress-bar progress-bar-striped progress-bar-animated"
                            role="progressbar"
                            style={{
                              width: `${
                                ((parseInt(data.win) + parseInt(data.lose)) /
                                  (parseInt(dataTop[0].win) +
                                    parseInt(dataTop[0].lose))) *
                                100
                              }%`,
                            }}
                          >
                            {parseInt(data.win) + parseInt(data.lose)}
                          </div>
                        ) : (
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{
                              width: `${
                                ((parseInt(data.win) + parseInt(data.lose)) /
                                  (parseInt(dataTop[0].win) +
                                    parseInt(dataTop[0].lose))) *
                                100
                              }%`,
                            }}
                          >
                            {parseInt(data.win) + parseInt(data.lose)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Stats;
