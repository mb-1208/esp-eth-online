import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect, useContext } from "react";
import { IconArrowLeft, IconCrown } from "@tabler/icons";
import axios from "axios";
import { Text, Center } from "@chakra-ui/layout";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Spinner } from "@chakra-ui/spinner";
import MediaQuery from "react-responsive";
import { useToast } from "@chakra-ui/react";
import { useRouter } from "next/router";
import AppContext from "../utils/AppContext";

ChartJS.register(ArcElement, Tooltip, Legend);

const Stats = () => {
  const value = useContext(AppContext);
  const router = useRouter();
  const toast = useToast();
  const [dataDailyFee, setDataDailyFee] = useState([]);
  const [dataTop, setDataTop] = useState([]);
  const [dataGraph, setDataGraph] = useState({
    labels: ["Rock", "Paper", "Scissor"],
    datasets: [
      {
        label: "# of Votes",
        data: [0, 0, 0],
        backgroundColor: ["#16cabd", "#7638d3", "#ff9d00"],
        borderWidth: 2,
      },
    ],
  });
  const [dataBet, setDataBet] = useState("");
  const [dataFee, setDataFee] = useState("");
  const [dataTotalMatch, setDataTotalMatch] = useState("");
  const [dataHighestWin, setDataHighestWin] = useState("");
  const [dataHighestLose, setDataHighestLose] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataFilter, setDataFilter] = useState(false);
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
    checkNetwork();
    if (dataFilter) {
      setLoading(true);
      const data = await getData();
      const dataMatch = await getDataMatch();
      setDataTotalMatch(dataMatch.length.toString());
      graphData(dataMatch);
      calculateTotalBet(dataMatch);
      await highestWin(data);
      await highestLose(data);
      await getTopCollection(data);
    } else {
      // setLoading(true);
      const dataPersonal = await getDataPersonal();
      const dataMatchPersonal = await getDataMatchPersonal();
      setDataTotalMatch(dataMatchPersonal.length.toString());
      graphData(dataMatchPersonal);
      calculateTotalBet(dataMatchPersonal);
      await highestWin(dataPersonal);
      await highestLose(dataPersonal);
    }
  }, [dataFilter]);

  const getDataPersonal = async (e) => {
    const response = await axios.get(
      "https://www.boxcube.space/api/leaderboardvs"
    );
    const filterData = response.data.filter(
      (a) =>
        a.project === "pawwsProject" &&
        a.network === "testnetNetwork"
    );
    const personalResponse = await filterData.filter(function (x) {
      return x.walletAdress === value.state.walletFromDb;
    });
    return personalResponse;
  };

  const getData = async (e) => {
    const response = await axios.get(
      "https://www.boxcube.space/api/leaderboardvs"
    );
    const filterData = response.data.filter(
      (a) =>
        a.project === "pawwsProject" &&
        a.network === "testnetNetwork"
    );
    return filterData;
  };

  function filterByValue(array, string) {
    return array.filter((o) =>
      Object.keys(o).some((k) => o[k].includes(string))
    );
  }

  const getDataMatchPersonal = async (e) => {
    const responseSource = await axios.get(
      "https://www.boxcube.space/api/matchresult"
    );
    const filterData = responseSource.data.filter(
      (a) =>
        a.project === "pawwsProject" &&
        a.network === "testnetNetwork"
    );
    const personalResponse = await filterData.filter(function (x) {
      return x.player1Address === value.state.walletFromDb;
    });
    const personalResponse2 = await filterData.filter(function (x) {
      return x.player2Address === value.state.walletFromDb;
    });
    const concatPersonalResp = personalResponse.concat(personalResponse2);
    const response = concatPersonalResp.sort(function (a, b) {
      return a.id - b.id;
    });
    return response;
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
    let uniqueYearMonths = [
      ...new Set(filterData.map((x) => x.createdAt.substring(0, 7))),
    ];
    let results = [
      ...new Set(filterData.map((x) => x.createdAt.substring(0, 4))),
    ].map((year) => ({
      year: year,
      months: uniqueYearMonths
        .filter((ym) => ym.startsWith(year))
        .map((ym) => ({
          month: ym.substring(5, 7),
          items: filterData
            .filter((item) => item.createdAt.startsWith(ym))
            .map((item) => ({
              id: item.id,
              fee: item.fee,
            })),
        })),
    }));
    // console.log(results); // Get data detail all year fee
    let month = ("0" + (new Date().getMonth() + 1)).slice(-2);
    let year = new Date().getFullYear();
    var filterDataYear = filterByValue(results, year.toString());
    // console.log(filterDataYear); // Get data year fee
    var filterDataMonth = filterByValue(filterDataYear[0].months, month);
    // console.log(filterDataMonth); // Get data monthly fee
    calculateTotalFee(filterDataMonth);
    var resultDaily = filterData.filter((date) => {
      const orderDate = new Date(date.createdAt);
      const today = new Date();
      const isThisDay = orderDate.getDay() === today.getDay();
      return isThisDay;
    });
    setDataDailyFee(resultDaily);
    console.log(resultDaily); // Get data daily fee
    return filterData;
  };

  const graphData = async (dataMatch) => {
    const dataMatchP1 = await dataMatch.filter(function (x) {
      return x.player1Address === value.state.walletFromDb;
    });
    const dataMatchP2 = await dataMatch.filter(function (x) {
      return x.player2Address === value.state.walletFromDb;
    });
    var p1Rock = dataMatchP1.filter((obj) => {
      return obj.player1Choice === "rock";
    });
    var p1Paper = dataMatchP1.filter((obj) => {
      return obj.player1Choice === "paper";
    });
    var p1Scissor = dataMatchP1.filter((obj) => {
      return obj.player1Choice === "scissor";
    });

    var p2Rock = dataMatchP2.filter((obj) => {
      return obj.player2Choice === "rock";
    });
    var p2Paper = dataMatchP2.filter((obj) => {
      return obj.player2Choice === "paper";
    });
    var p2Scissor = dataMatchP2.filter((obj) => {
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
          backgroundColor: ["#16cabd", "#7638d3", "#ff9d00"],
          borderWidth: 2,
        },
      ],
    });
    setLoading(false);
  };

  const calculateTotalFee = (dataMatch) => {
    Array.prototype.sum = function (prop) {
      var total = 0;
      for (var i = 0, _len = this.length; i < _len; i++) {
        total += parseFloat(this[i][prop]);
      }
      return total.toFixed(6);
    };
    // const
    if (dataMatch[0] !== undefined) {
      setDataFee(dataMatch[0].items.sum(`fee`).toString());
      console.log(dataMatch[0].items.sum(`fee`).toString());
    } else {
      setDataFee("0");
    }
  };

  const calculateTotalBet = (dataMatch) => {
    Array.prototype.sum = function (prop) {
      var total = 0;
      for (var i = 0, _len = this.length; i < _len; i++) {
        total += parseFloat(this[i][prop]);
      }
      return total.toFixed(6);
    };
    setDataBet(dataMatch.sum(`bet`).toString());
    // console.log(dataMatch.sum(`bet`));
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
      <MediaQuery minWidth={768}>
        <div className="stats-section">
          <div className="p-4" style={{ display: "flex" }}>
            <Center className="me-2">
              <a href="/menu" className="text-black">
                <IconArrowLeft color="#ef6b9a " />
              </a>
            </Center>
            <div className="text-center" style={{ width: "100%" }}>
              <img src="stats-title.png" style={{ margin: "0 auto" }} />
            </div>
          </div>
          <div className="container">
            <div className="mx-4" style={{ display: "flex" }}>
              <button
                className="mx-2 btn-filter-stats"
                onClick={() => setDataFilter(true)}
              >
                All
              </button>
              <button
                className="mx-2 btn-filter-stats"
                onClick={() => setDataFilter(false)}
              >
                Personal
              </button>
            </div>
            <div
              className="row text-black text-center"
              style={{ width: "100%", margin: "0 auto" }}
            >
              <div className="col-sm-6 p-4">
                <div
                  className="card"
                  style={{ height: "50vh", backgroundColor: "transparent" }}
                >
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
                    <Text color="white" fontSize="xl">
                      Most Frequent Choices
                    </Text>
                    <Text color="white" fontSize="sm">
                      Overall Record
                    </Text>
                  </div>
                </div>
              </div>
              <div className="col-sm-6 p-4" style={{ display: "grid" }}>
                <div
                  className="card m-2"
                  style={{ height: "15vh", backgroundColor: "transparent" }}
                >
                  <Center style={{ height: "100%" }}>
                    <Text color="white" fontSize="3xl" fontWeight="bolder">
                      {dataHighestWin} Win
                    </Text>
                  </Center>
                  <hr />
                  <div className="p-2">
                    <Text color="white" fontSize="xl">
                      Highest Win
                    </Text>
                    <Text color="white" fontSize="sm">
                      Overall Total
                    </Text>
                  </div>
                </div>
                <div
                  className="card m-2"
                  style={{ height: "15vh", backgroundColor: "transparent" }}
                >
                  <Center style={{ height: "100%" }}>
                    <Text color="white" fontSize="3xl" fontWeight="bolder">
                      {dataHighestLose} Lose
                    </Text>
                  </Center>
                  <hr />
                  <div className="p-2">
                    <Text color="white" fontSize="xl">
                      Highest Lose
                    </Text>
                    <Text color="white" fontSize="sm">
                      Overall Total
                    </Text>
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-6" style={{ paddingRight: "0" }}>
                    <div
                      className="card m-2"
                      style={{ height: "15vh", backgroundColor: "transparent" }}
                    >
                      <Center
                        style={{
                          height: "100%",
                        }}
                      >
                        <Text
                          style={{ display: "flex" }}
                          color="white"
                          fontSize="3xl"
                          fontWeight="bolder"
                        >
                          {dataBet} Ξ
                        </Text>
                      </Center>
                      <hr />
                      <div className="p-2">
                        <Text color="white" fontSize="xl">
                          Total Bet
                        </Text>
                        <Text color="white" fontSize="sm">
                          Overall Bet Recorded
                        </Text>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6" style={{ paddingLeft: "0" }}>
                    <div
                      className="card m-2"
                      style={{ height: "15vh", backgroundColor: "transparent" }}
                    >
                      <Center style={{ height: "100%" }}>
                        <Text color="white" fontSize="3xl" fontWeight="bolder">
                          {dataTotalMatch} Match
                        </Text>
                      </Center>
                      <hr />
                      <div className="p-2">
                        <Text color="white" fontSize="xl">
                          Match Played
                        </Text>
                        <Text color="white" fontSize="sm">
                          Overall Match
                        </Text>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {dataFilter ? (
                <>
                  <div className="col-sm-6">
                    <div
                      className="card m-2 p-2"
                      style={{ height: "20vh", backgroundColor: "transparent" }}
                    >
                      <div
                        style={{
                          maxHeight: "15vh",
                          height: "15vh",
                          overflowY: "auto",
                        }}
                      >
                        <div
                          style={{
                            width: "100%",
                            display: "flex",
                          }}
                        >
                          <div style={{ width: "20%" }}>
                            <Text
                              color="white"
                              fontSize="sm"
                              fontWeight="bolder"
                            >
                              No
                            </Text>
                          </div>
                          <div style={{ width: "100%" }}>
                            <Text
                              color="white"
                              fontSize="sm"
                              fontWeight="bolder"
                            >
                              Game ID
                            </Text>
                          </div>
                          <div style={{ width: "100%" }}>
                            <Text
                              color="white"
                              fontSize="sm"
                              fontWeight="bolder"
                            >
                              Fee
                            </Text>
                          </div>
                        </div>
                        <hr />
                        {dataDailyFee.map((data, index) => (
                          <div>
                            <div
                              style={{
                                height: "100%",
                                width: "100%",
                                display: "flex",
                              }}
                            >
                              <div style={{ width: "20%" }}>
                                <Text
                                  color="white"
                                  fontSize="sm"
                                  fontWeight="bolder"
                                >
                                  {index + 1}
                                </Text>
                              </div>
                              <div style={{ width: "100%" }}>
                                <Text
                                  className="daily-fee"
                                  color="white"
                                  fontSize="sm"
                                  fontWeight="bolder"
                                >
                                  {data.gameId}
                                </Text>
                              </div>
                              <div style={{ width: "100%" }}>
                                <Text
                                  color="white"
                                  fontSize="sm"
                                  fontWeight="bolder"
                                >
                                  {data.fee}
                                </Text>
                              </div>
                            </div>
                            <hr />
                          </div>
                        ))}
                      </div>
                      <hr />
                      <div className="p-2">
                        <Text color="white" fontSize="xl">
                          Daily Fee
                        </Text>
                        <Text color="white" fontSize="sm">
                          List Daily Fee
                        </Text>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div
                      className="card m-2"
                      style={{ height: "20vh", backgroundColor: "transparent" }}
                    >
                      <Center style={{ height: "90%" }}>
                        <Text
                          style={{ display: "flex" }}
                          color="white"
                          fontSize="3xl"
                          fontWeight="bolder"
                        >
                          {dataFee} Ξ
                        </Text>
                      </Center>
                      <hr />
                      <div className="p-2">
                        <Text color="white" fontSize="xl">
                          Monthly Fee
                        </Text>
                        <Text color="white" fontSize="sm">
                          Total Monthly Fee
                        </Text>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <br />
                  <br />
                </>
              )}
            </div>
            {dataFilter ? (
              <div className="p-4">
                <div
                  className="card p-4 mb-4"
                  style={{ backgroundColor: "transparent" }}
                >
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
                            <img src="3.png" />
                          ) : index === 1 ? (
                            <img src="2.png" />
                          ) : index === 2 ? (
                            <img src="1.png" />
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
                                    ((parseInt(data.win) +
                                      parseInt(data.lose)) /
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
                                    ((parseInt(data.win) +
                                      parseInt(data.lose)) /
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
            ) : (
              <>
                <br />
                <br />
              </>
            )}
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
    </>
  );
};

export default Stats;
