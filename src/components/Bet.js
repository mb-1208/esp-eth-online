import React, { useContext } from "react";
import AppContext from "../utils/AppContext";
import { Flex } from "@chakra-ui/layout";
import {
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from "@chakra-ui/number-input";
import {
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
} from "@chakra-ui/slider";
import { Icon } from "@iconify/react";

export const Bet = () => {
  const value = useContext(AppContext);
  const handleChange = (bet) => value.setBet(bet);
  // const format = (bet) => `${bet} ETH`;
  // const parse = (bet) => bet.replace(/^\ETH/, "");
  const format = (val) => `Ξ ` + val;
  const parse = (val) => val.replace(/^\$/, "");

  return (
    <div style={{ background: "", borderRadius: "1rem"}}>
      <NumberInput
        style={{
          margin: "0 auto",
          color: "white",
        }}
        disabled={value.state.status !== 0}
        min={0.001}
        max={0.1}
        maxW="100%"
        mr="2rem"
        step={0.001}
        value={format(value.state.stateBet)}
        onChange={(valueString) => {
          value.setStateBet(parse(valueString));
          // value.setBet(parse(valueString));
          console.log(parse(valueString));
        }}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper style={{ color: "white" }} />
          <NumberDecrementStepper style={{ color: "white" }} />
        </NumberInputStepper>
      </NumberInput>
    </div>
  );
};
