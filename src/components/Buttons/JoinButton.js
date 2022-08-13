import React, { useContext, useState } from "react";
import AppContext from "../../utils/AppContext";
import { Button } from "@chakra-ui/button";
import { Grid, GridItem, Text } from "@chakra-ui/layout";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
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
import { RoundedArrow } from "./RoundedArrow";
import { RoundedButton } from "./RoundedButton";
import { ethers } from "ethers";

export const JoinButton = () => {
  const [roomId, setRoomId] = useState("");
  const toast = useToast();
  const value = useContext(AppContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const reset = () => {
    value.setStatus(0);
    value.setOutcome("unknown");
    value.setBet(0);
    value.setChoice(1);
  };
  return (
    <>
      <button
        className="btn-menu-style"
        onClick={() => {
          onOpen();
        }}
      >
        Find Room
      </button>

      <Modal size="lg" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent top="6rem" background="#6d8725">
          <ModalHeader>Find Room</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid
              templateRows="repeat(2, 1fr)"
              templateColumns="repeat(6, 1fr)"
              gap={4}
            >
              <GridItem rowSpan={1} colSpan={1}>
                <Text mt={1} fontSize="lg">
                  Username:
                </Text>{" "}
              </GridItem>
              <GridItem rowSpan={1} colSpan={5}>
                <Input
                  value={value.state.username}
                  placeholder="Username"
                  variant="outline"
                  onChange={(e) => value.setUsername(e.target.value)}
                />
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <Text mt={1} fontSize="lg">
                  ID Room:
                </Text>
              </GridItem>
              <GridItem rowSpan={1} colSpan={5}>
                <Input
                  variant="outline"
                  onChange={(e) => {
                    setRoomId(e.target.value);
                    value.setGameId(e.target.value);
                    value.setBytesGameId(ethers.utils.id(e.target.value));
                  }}
                />
              </GridItem>
            </Grid>
          </ModalBody>

          <ModalFooter>
            {value.state.username !== "" && roomId.length > 20 ? (
              <RoundedButton
                color="orange"
                content="Find Room"
                onClick={() => {
                  reset();
                  onClose();
                  toast({
                    title: "Room Joined!",
                    description: "Join room succeed.",
                    status: "info",
                    duration: 4000,
                    isClosable: true,
                    position: "top",
                  });
                }}
                size="md"
                nextLink="/play"
              />
            ) : (
              <RoundedButton
                color="#fec078"
                content="Find Room"
                onClick={() => {
                  toast({
                    title: "Something Wrong!",
                    description: "Make sure your username or room id is correct.",
                    status: "error",
                    duration: 4000,
                    isClosable: true,
                    position: "top",
                  });
                }}
                size="md"
              />
            )}

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
