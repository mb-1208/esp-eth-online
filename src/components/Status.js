import { CheckIcon } from "@chakra-ui/icons";
import { Flex, Text } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import React, { useState } from "react";
let firstTime = true;

export const Status = ({ pending }) => {
  if (pending) {
    firstTime = false;
    return (
      <>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Spinner size="md" speed="0.9s" />
          <Text>Transaction processing...</Text>
        </div>
      </>
    );
  }
  return (
    <>
      <Text>No current transaction</Text>
    </>
  );
};
