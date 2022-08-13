const Test = () => {

  return (
    <>
      <div className="App">
        <div className="container-fluid p-3 m-0 bg-success text-white">
          <div className="px-2">
            <div className="row">
              <div className="col">
                <div className="fs-4 d-flex align-items-center justify-content-center">
                  Your Wallet:　<span id="myToken"></span>&nbsp;ETH
                </div>
              </div>
              <div className="col">
                <div className="fs-4 d-flex align-items-center justify-content-center">
                  <span id="myScore"></span>
                </div>
              </div>
              <div className="col">
                <div className="fs-4 d-flex align-items-center justify-content-center">
                  Your Depo:<span id="myDepo">&nbsp;ETH&nbsp;</span>
                  <button id="wd">WD</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <p className="fs-1 py-3">
            Choose your hand and bet (<b className="text-danger">R</b>ock
            <b className="text-danger">S</b>cissors
            <b className="text-danger">P</b>aper Token) Please Choose
          </p>
          <div className="row">
            <div className="col-sm-2" style={{ display: "flex" }}>
              <input
                id="depoAmount"
                className="form-control"
                type="text"
                placeholder="1"
              />
              <label>ETH</label>
            </div>
            <div className="col text-start">
              <button id="depo">Depo</button>
            </div>
          </div>
          <input
            id="bet"
            className="form-control"
            type="text"
            placeholder="Rock-paper-scissors (RSP) points you want to bet on (1/2 of your tokens will be used if not entered)"
          />
          <p className="py-2">
            * [Win] Return double the stake / [Negative] Confiscate all the
            stake / [Draw] Return the stake
          </p>
          <div className="row my-5 hand-area">
            <div
              id="rock"
              className="border border-3 rsp col m-3 p-3 d-flex align-items-center justify-content-center"
            >
              <img src="img/rock.png" alt="rock" />
            </div>
            <div
              id="scissors"
              className="border border-3 rsp col m-3 p-3 d-flex align-items-center justify-content-center"
            >
              <img src="img/scissors.png" alt="scissors" />
            </div>
            <div
              id="paper"
              className="border border-3 rsp col m-3 p-3 d-flex align-items-center justify-content-center"
            >
              <img src="img/paper.png" alt="paper" />
            </div>
          </div>

          <div className="text-center">
            <button className="btn btn-primary" disabled>
              <span className="fs-1 text-center px-3">Result : </span>
              <span id="result" className="fs-1">
                None
              </span>
            </button>
          </div>

          <div className="row border p-5 my-5">
            <span className="col">
              <div className="row">
                <p className="col d-flex fs-3 align-items-center justify-content-center">
                  You
                </p>
              </div>
              <div className="row">
                <div className="col d-flex align-items-center justify-content-center">
                  <img src="" alt="" id="playerHand" />
                </div>
              </div>
            </span>
            <span className="col d-flex align-items-center justify-content-center">
              <img className="image-vs" src="img/vs.png" alt="vs" />
            </span>
            <span className="col">
              <div className="row">
                <p className="col d-flex fs-3 align-items-center justify-content-center">
                  CPU
                </p>
              </div>
              <div className="row">
                <div className="col d-flex align-items-center justify-content-center">
                  <img src="" alt="" id="cpuHand" />
                </div>
              </div>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Test;
