//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";
import "./base.sol";


contract KgbEth is Base {

    address payable public owner;

    mapping(address => Score) public scoreOfOwner;

    event ResultNotification(Results result, Hands playerHand, Hands cpuHand, Score score);

    receive() external payable {}

    function _random(uint mod) internal view returns(uint){
        return uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))) % mod;
    }

    // result generate kgb CPU 
    function _generateHand() internal view returns(Hands) {
        return Hands(_random(3));
    }

    // result condition from player and cCPU
    function _checkResult(Hands player, Hands computer) internal pure returns(Results) {
        // draw
        if (player == computer) { return Results.Draw; }

        // win
        if (player == Hands.Rock && computer == Hands.Scissors) { return Results.Win; }
        if (player == Hands.Paper && computer == Hands.Rock) { return Results.Win; }
        if (player == Hands.Scissors && computer == Hands.Paper) { return Results.Win; }

        // lose
        return Results.Lose;
    }

    function getDataAddress() public view returns (Score memory){
        return scoreOfOwner[msg.sender];
    }

    function addDeposit() public payable{
        // adds the item to the storage.
        scoreOfOwner[msg.sender].user = msg.sender;
        scoreOfOwner[msg.sender].winCount = 0;
        scoreOfOwner[msg.sender].loseCount = 0;
        scoreOfOwner[msg.sender].drawCount = 0;
        scoreOfOwner[msg.sender].deposit = scoreOfOwner[msg.sender].deposit + msg.value;
    }

    // send reward if player win
    function _sendRewardToken(uint token) internal returns(uint) {
        token = token * 2;
        payable(msg.sender).transfer(token);
        return token;
    }

    function getBalance() public view returns(uint){
        return msg.sender.balance;
    }

    function withDraw(uint _amount) external {
        payable(msg.sender).transfer(_amount);
        scoreOfOwner[msg.sender].deposit = scoreOfOwner[msg.sender].deposit - _amount;
    }

    function getDeposit() public view returns(uint){
        return scoreOfOwner[msg.sender].deposit;
    }

    function ownerWithdraw() external {
        require(msg.sender == owner, "Only the owner can access this function");
        payable(msg.sender).transfer(address(this).balance);
    }

    // start game
    function doGame(Hands playerHand, uint bet) external {
        console.log("bet: '%d / wallet: '%d'",
            uint(bet)
        );
        require(bet > 0, "bet is under 0, must be set over 0");
        require(scoreOfOwner[msg.sender].deposit > 0, "your deposit is under 0, deposit must be over 0");
        require(bet <= scoreOfOwner[msg.sender].deposit, "don't have enough deposit");
 
        // generate CPU result
        Hands cpuHand = _generateHand();

        // player result
        Results result = _checkResult(playerHand, cpuHand);

        uint earnToken = 0;
        if (result == Results.Win) {
            // win execution
            earnToken = _sendRewardToken(bet);
            scoreOfOwner[msg.sender].deposit = scoreOfOwner[msg.sender].deposit - bet;
            scoreOfOwner[msg.sender].winCount++;

        } else if (result == Results.Lose) {
            // lose execution
            scoreOfOwner[msg.sender].deposit = scoreOfOwner[msg.sender].deposit - bet;
            scoreOfOwner[msg.sender].loseCount++;

        } else if (result == Results.Draw) {
            scoreOfOwner[msg.sender].drawCount++;
        }

        console.log("player hand: '%d / computer hand: '%d' / result: '%d'",
            uint(playerHand),
            uint(cpuHand),
            uint(result)
        );

        emit ResultNotification(result, playerHand, cpuHand, scoreOfOwner[msg.sender]);
    }
}
