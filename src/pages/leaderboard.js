import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect, Suspense } from "react";
import { IconArrowLeft, IconCrown } from "@tabler/icons";
import axios from "axios";
import { Spinner } from "@chakra-ui/spinner";

export const Leaderboard = () => {
  const [dataLeaderboard, setDataLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getTopCollection();
  }, []);

  const getTopCollection = async () => {
    const response = await axios.get(
      "https://www.boxcube.space/api/leaderboardvs"
    );
    // console.log(response.data);
    const dataSort = response.data.sort(function (a, b) {
      return b.earnings - a.earnings;
    });
    // console.log(dataSort);
    setDataLeaderboard(dataSort);
    setLoading(false);
  };

  return (
    <>
      {/* <div className="back-leaderboard" style={{ width: "100%" }}>
          <a href="/menu">
            <IconArrowLeft color="#ffa031" />
          </a>
        </div> */}
      <div
        className="container leaderboard-wrapper"
        style={{ textAlign: "center" }}
      >
        <h1 className="title-leaderboard">Top 10 Player Earnings</h1>
        <div className="leaderboard-section">
          {loading ? (
            <Spinner color="green" />
          ) : (
            <div className="card-wrap-leaderboard">
              {dataLeaderboard.slice(0, 10).map((data, index) => (
                <div className="card-leaderboard" key={data.id}>
                  <div className="layout-card-leaderboard">
                    <div className="px-2">
                      {index === 0 ? (
                        <IconCrown color="yellow" />
                      ) : index === 1 ? (
                        <IconCrown color="grey" />
                      ) : index === 2 ? (
                        <IconCrown color="brown" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className="name-leaderboard">{data.walletName}</span>
                    <span className="wl-leaderboard">
                      {data.win} Win/{data.lose} Lose
                    </span>
                    <span className="earning-leaderboard">
                      {data.earnings} Eth
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// export default Leaderboard;
