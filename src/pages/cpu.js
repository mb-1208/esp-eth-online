import { useEffect } from "react";
import { ethers } from "ethers";
import rspAbi from "../../contracts/KgbEth.json";
import $ from "jquery";
import "bootstrap/dist/css/bootstrap.min.css";
import { IconArrowLeft } from "@tabler/icons";
import { Input } from "@chakra-ui/input";
import { Grid, GridItem, Text } from "@chakra-ui/layout";
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

export const Cpu = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  //   const provider = new ethers.providers.Web3Provider(window.ethereum);

  const rspAddress = "0xcad6187f3BD8883E418b3a03fD4744112177965e";

  let userBalance = 0;
  let userDepo = 0;
  //   const signer = provider.getSigner();
  //   const rspContract = new ethers.Contract(rspAddress, rspAbi.abi, provider);
  //   const rsp = rspContract.connect(signer);

  const hands = ["rock", "paper", "scissors"];
  const results = ["Win", "Lose", "Draw"];
  const requestAccount = async () => {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  };
  function resetMatchResultDisplay(resultMsg = "") {
    $("#playerHand").attr("src", "rps.gif");
    $("#cpuHand").attr("src", "rps.gif");
    $("#result").removeClass("spinner-border fs-3");
    $("#result").text(resultMsg);
  }

  function getKeyByValue(object, value) {
    return Object.keys(object).find((key) => object[key] === value);
  }

  // Display token
  function displayToken(token, depo) {
    token = ethers.utils.formatEther(token).toString();
    depo = ethers.utils.formatEther(depo).toString();
    $("#myToken").text(`${token}`);
    $("#myDepo").text(`${depo}`);
  }

  async function displayScore(scr) {
    const score = await getScoreABI();
    $("#myScore").text(
      `Score: ${score[1]} Win / ${score[2]} Lose / ${score[3]} Draw`
    );
  }

  function displayMatchResult(playerHand, cpuHand, result) {
    const hands = ["rock", "paper", "scissors"];
    console.log(hands[playerHand]);
    console.log(hands[cpuHand]);
    console.log(playerHand);
    console.log(cpuHand);
    console.log(result);
    $("#playerHand").attr("src", `${hands[playerHand]}.png`);
    $("#cpuHand").attr("src", `${hands[cpuHand]}.png`);
    $("#result").removeClass("spinner-border fs-3");
    $("#result").text(results[result]);
  }

  // Start the game
  async function doGamABI(hand, token) {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const rspContract = new ethers.Contract(rspAddress, rspAbi.abi, provider);
      const rsp = rspContract.connect(signer);
      return await rsp.doGame(hand, ethers.utils.parseEther(token));
    }
  }
  // Get User Token Balance
  // async function balanceOfABI() { return await rsp.balanceOf(signerAddress); }
  // Get Score of Owner
  async function getScoreABI() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();
      const rspContract = new ethers.Contract(rspAddress, rspAbi.abi, provider);
      const rsp = rspContract.connect(signer);
      return await rsp.scoreOfOwner(signerAddress);
    }
  }
  // Get Token RSP
  async function getTokenABI() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const rspContract = new ethers.Contract(rspAddress, rspAbi.abi, provider);
      const rsp = rspContract.connect(signer);
      return await rsp.getToken();
    }
  }

  async function getAllBalance() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(rspAddress, rspAbi.abi, signer);
      userBalance = await contract.getBalance();
      userDepo = await contract.getDeposit();
    }
  }

  // Initial settings
  async function initialize() {
    const myToken = userBalance;
    const myDepo = userDepo;
    displayToken(myToken, myDepo);
  }

  const StartBet = async (rps) => {
    if ($("#bet").val() !== "") {
      resetMatchResultDisplay();

      // loading animation
      $("#result").addClass("spinner-border fs-3");

      // validation
      let token = $("#bet").val();
      let amount = document.getElementById("myDepo").innerText;
      // const balanceTokenBigNum = await balanceOfABI();
      // const balanceToken = ethers.utils.formatEther(balanceTokenBigNum).toString();
      if (token === "") {
        toast({
          title: "Transaction Failed!",
          description: "You have to insert your bet first!.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
        resetMatchResultDisplay("Respond Failed");
        return;
      } else if (token > amount) {
        toast({
          title: "Transaction Failed!",
          description: "You can't bet more eth than deposit you have!.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
        resetMatchResultDisplay("Respond Failed");
        return;
      } else if (token <= 0) {
        toast({
          title: "Transaction Failed!",
          description: "bet is under 0, must be set over 0!.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
        resetMatchResultDisplay("Respond Failed");
        return;
      }
      console.log(hands, rps);
      const playerHand = getKeyByValue(hands, rps);
      try {
        console.log(playerHand, token);
        // sendTransactions(token, signerAddress);
        const tx = await doGamABI(playerHand, token);
        const events = (await tx.wait()).events;

        // Update screen of transaction result
        events.forEach(function (e) {
          if (e.event === "ResultNotification") {
            displayMatchResult(
              e.args.playerHand,
              e.args.cpuHand,
              e.args.result
            );
            displayScore(e.args.score);
            getAllBalance().then(() => {
              initialize();
            });
            // displayToken(e.args.totalToken);
          }
        });
      } catch (err) {
        console.error(err);
        toast({
          title: "Transaction Failed!",
          description: "Respond failed, please try again!.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
        resetMatchResultDisplay("Respond Failed");
      }
    } else {
      toast({
        title: "Insert Bet!",
        description: "You have to insert your bet first.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const actionFunction = (e) => {
    // const actionBtn = () => {
    // Get Token when click icon get token
    $("#wd").click(async () => {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(rspAddress, rspAbi.abi, signer);
        let amount = document.getElementById("myDepo").innerText;
        let amountTotWei = ethers.utils.parseEther(amount);
        let userDepo = await contract.getDeposit();
        let amountUser = ethers.utils.formatEther(userDepo).toString();
        if (amount <= "0") {
          toast({
            title: "Transaction Failed!",
            description: "you don't have any deposit to withdraw!.",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
          resetMatchResultDisplay("Respond Failed");
          return;
        } else if (amount != amountUser) {
          toast({
            title: "Transaction Failed!",
            description: "seems your deposit balance not correct!.",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
          resetMatchResultDisplay("Respond Failed");
          return;
        }
        const transaction = await contract.withDraw(amountTotWei);
        await transaction.wait().then(async () => {
          getAllBalance().then(() => {
            initialize();
          });
        });
      }
    });

    // Get Token when click icon get token
    $("#depo").click(async () => {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        let amount = $("#depoAmount").val();
        console.log(amount);
        if (amount === "") {
          toast({
            title: "Transaction Failed!",
            description: "You have to insert your amount first!.",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
          resetMatchResultDisplay("Respond Failed");
          return;
        } else if (amount <= 0) {
          toast({
            title: "Transaction Failed!",
            description: "amount is under 0, must be set over 0!.",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
          resetMatchResultDisplay("Respond Failed");
          return;
        }
        const signer = provider.getSigner();
        const contract = new ethers.Contract(rspAddress, rspAbi.abi, signer);
        const overrides = {
          // To convert Ether to Wei:
          value: ethers.utils.parseEther($("#depoAmount").val().toString()),
          // ether in this case MUST be a string
        };
        const transaction = await contract.addDeposit(overrides);
        await transaction.wait().then(async () => {
          getAllBalance().then(() => {
            initialize();
          });
          toast({
            title: "Transaction Succeed!",
            description: "Your deposit has updated!.",
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
        });
      }
    });

    // hover handle time
    const borderClass = "border-primary";
    $(".rsp").hover(
      function () {
        $(this).addClass(borderClass);
      },
      function () {
        $(this).removeClass(borderClass);
      }
    );
  };

  useEffect(() => {
    (async () => {
      if (typeof window.ethereum !== "undefined") {
        actionFunction();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const rspContract = new ethers.Contract(
          rspAddress,
          rspAbi.abi,
          provider
        );
        const rsp = rspContract.connect(signer);
        // rsp.on(
        //   "ResultNotification",
        //   (result, _, playerHand, cpuHand, score) => {
        //     displayMatchResult(playerHand, cpuHand, result);
        //     displayScore(score);
        //   }
        // );
        requestAccount().then(() => {
          getAllBalance().then(() => {
            initialize();
          });
        });
      }
    })();
  }, []);
  return (
    <>
      <div className="cpu-wrapper">
        <div className="cpu-section pb-4">
          <div className="arrow-menu">
            <a href="/menu" className="text-black">
              <IconArrowLeft color="#ef6b9a " />
            </a>
          </div>
          <div className="wallet-balance" style={{ alignSelf: "center" }}>
            <div className="fs-4 d-flex align-items-center justify-content-center">
              Your Wallet:　<span id="myToken"></span>&nbsp;Ξ
            </div>
          </div>
          <div className="score-position fs-4 d-flex align-items-center justify-content-center">
            <span id="myScore"></span>
          </div>
          <div className="deposit-position fs-4 d-flex align-items-center justify-content-center">
            Your Deposit:<span id="myDepo"></span>&nbsp;Ξ&nbsp;
            <button className="btn btn-danger mx-4" id="wd">
              withdraw
            </button>
            <button
              className="btn btn-success"
              onClick={() => {
                onOpen();
              }}
            >
              Top Up
            </button>
          </div>
          {/* <div className="row">
            <div
              className="col-sm-8"
              style={{ display: "flex", placeContent: "end" }}
            >
              <input
                id="depoAmount"
                className="ms-3 form-control"
                style={{ width: "50%" }}
                type="number"
                placeholder="0.1"
              />
              <label style={{ alignSelf: "center" }}>Eth</label>
            </div>
            <div className="col-4 text-start">
              <button className="btn btn-success" id="depo">
                Deposit
              </button>
            </div>
          </div> */}
          <div className="result-match text-center">
            <button className="btn btn-secondary" disabled>
              <span id="result" className="fs-4">
                Waiting result...
              </span>
            </button>
          </div>
          <div className="game-box container text-center">
            <div className="row hand-area">
              <div className="col-sm-4" style={{ alignSelf: "center" }}>
                <img
                  src="rps.gif"
                  alt=""
                  id="playerHand"
                  style={{ width: "20vh", margin: "0 auto" }}
                />
                <div className="row">
                  <button
                    id="rock"
                    onClick={() => {
                      StartBet("rock");
                    }}
                    style={{ borderRadius: "1rem" }}
                    className="border border-3 rsp col m-3 p-1 d-flex align-items-center justify-content-center"
                  >
                    <img src="Rock.png" alt="rock" style={{ width: "3vh" }} />
                  </button>
                  <div
                    id="scissors"
                    onClick={() => {
                      StartBet("scissors");
                    }}
                    style={{ borderRadius: "1rem" }}
                    className="border border-3 rsp col m-3 p-1 d-flex align-items-center justify-content-center"
                  >
                    <img
                      src="Scissors.png"
                      alt="scissors"
                      style={{ width: "3vh" }}
                    />
                  </div>
                  <div
                    id="paper"
                    onClick={() => {
                      StartBet("paper");
                    }}
                    style={{ borderRadius: "1rem" }}
                    className="border border-3 rsp col m-3 p-1 d-flex align-items-center justify-content-center"
                  >
                    <img src="Paper.png" alt="paper" style={{ width: "3vh" }} />
                  </div>
                </div>
              </div>
              <div className="col-sm-4" style={{ alignSelf: "center" }}>
                <img className="image-vs" src="vs.png" alt="vs" />
                <div className="row mt-4" style={{ justifyContent: "center" }}>
                  <span>Your Bet</span>
                  <div className="col-sm-8" style={{ display: "flex" }}>
                    <input
                      id="bet"
                      className="form-control"
                      type="number"
                      placeholder="0.01"
                    />
                    <label
                      className="ms-2 fs-4"
                      style={{ alignSelf: "center" }}
                    >
                      Ξ
                    </label>
                  </div>
                  <code>Enter your bet and choose your RPS</code>
                </div>
              </div>
              <div className="col-sm-4 mb-5" style={{ alignSelf: "center" }}>
                <img
                  src="rps.gif"
                  alt=""
                  id="cpuHand"
                  style={{ width: "20vh", margin: "0 auto" }}
                />
                <h5 className="mt-4">CPU</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal size="lg" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent top="6rem" background="#787878">
          <ModalHeader>Top Up</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid templateColumns="repeat(6, 1fr)" gap={4}>
              <GridItem rowSpan={1} colSpan={1}>
                <Text mt={1} fontSize="lg">
                  Amount:
                </Text>
              </GridItem>
              <GridItem rowSpan={1} colSpan={5}>
                <Input id="depoAmount" variant="outline" onChange={(e) => {}} />
              </GridItem>
            </Grid>
          </ModalBody>

          <ModalFooter>
            <button className="btn-menu-modal" id="depo">
              Top Up
            </button>
            <button
              className="btn-menu-modal"
              onClick={() => {
                onClose();
              }}
            >
              Cancel
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Cpu;
