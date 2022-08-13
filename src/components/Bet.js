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
    <div style={{ background: "", borderRadius: "1rem", padding: ".5rem" }}>
      <NumberInput
        style={{
          margin: "0 auto",
          color: "#6d8725",
          outline: "none",
          border: "4px solid green",
          borderRadius: "1rem",
        }}
        disabled={value.state.status !== 0}
        min={0}
        maxW="100%"
        mr="2rem"
        precision={3}
        step={0.001}
        value={format(value.state.bet)}
        onChange={(valueString) => value.setBet(parse(valueString))}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper style={{ color: "green" }} />
          <NumberDecrementStepper style={{ color: "green" }} />
        </NumberInputStepper>
      </NumberInput>
    </div>
  );
};
