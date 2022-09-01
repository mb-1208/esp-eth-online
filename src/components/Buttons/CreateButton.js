import React, { useContext, useState, useEffect } from "react";
import { Button, IconButton } from "@chakra-ui/button";
import { Grid, GridItem, HStack, Text } from "@chakra-ui/layout";
import { useDisclosure } from "@chakra-ui/hooks";
import {
  useClipboard,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { CopyIcon } from "@chakra-ui/icons";
import { Input } from "@chakra-ui/input";
import { RoundedButton } from "./RoundedButton";
import AppContext from "../../utils/AppContext";
import { Bet } from "../Bet";
import { nanoid } from "nanoid";
import { ethers } from "ethers";
import axios from "axios";
import { IconDoorEnter } from "@tabler/icons";
import { useRouter } from "next/router";

export const CreateButton = (address) => {
  const [roomStatus, setRoomStatus] = useState("Public");
  const [validation, setValidaiton] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const value = useContext(AppContext);
  const { hasCopied, onCopy } = useClipboard(value.state.gameId);
  const parse = (val) => val.replace(/^\$/, "");
  const reset = () => {
    const newId = nanoid();
    value.setGameId(newId);
    value.setBytesGameId(ethers.utils.id(newId));
    value.setStatus(0);
    value.setOutcome("unknown");
    value.setBet(0);
    value.setChoice(1);
  };

  const createRoomDb = async () => {
    const roomId = value.state.gameId;
    const roomOwner = address.address;
    const roomMember = '1';
    const bet = value.state.stateBet;
    const setRoom = roomStatus;
    try {
      await axios
        .post("https://www.boxcube.space/api/listroom", {
          roomId,
          roomOwner,
          roomMember,
          bet,
          setRoom,
        })
        .then(() => router.push("/play"));
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
  }, [roomStatus]);

  return (
    <>
      <button
        className="btn-menu-style stats-btn"
        onClick={() => {
          if (typeof window.ethereum !== "undefined") {
            console.log(address.address);
            if (address.address !== "") {
              reset();
              onOpen();
              // value.setBet(parse("0.001"));
            } else {
              toast({
                title: "Open your metamask!",
                description:
                  "Open and login your metamask or refresh your page",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top",
              });
            }
          } else {
            toast({
              title: "No Web3 Provider Found!",
              description: "Please install MetaMask first.",
              status: "error",
              duration: 5000,
              isClosable: true,
              position: "top",
            });
          }
        }}
      >
        <IconDoorEnter />
        Create Room
      </button>

      <Modal size="lg" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent top="6rem" background="#6d8725">
          <ModalHeader>Create Room</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid
              templateRows="repeat(2, 1fr)"
              templateColumns="repeat(6, 1fr)"
              gap={4}
            >
              <GridItem rowSpan={1} colSpan={1}>
                <Text mt={1} fontSize="lg">
                  ID Room:
                </Text>
              </GridItem>
              <GridItem rowSpan={1} colSpan={5}>
                <HStack>
                  <Input
                    isReadOnly
                    value={value.state.gameId}
                    variant="filled"
                  />
                  <IconButton
                    aria-label="Copy game ID"
                    onClick={() => {
                      toast({
                        title: "Game ID Copied!",
                        description: "Send this ID to your opponent.",
                        status: "info",
                        duration: 3000,
                        isClosable: true,
                        position: "top",
                      });
                      onCopy();
                    }}
                    icon={<CopyIcon />}
                  />
                </HStack>
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <Text mt={1} fontSize="lg">
                  Room Status:
                </Text>{" "}
              </GridItem>
              <GridItem style={{ alignSelf: "center" }} rowSpan={1} colSpan={5}>
                <select
                  className="form-select"
                  onChange={(e) => {
                    setRoomStatus(e.target.value);
                  }}
                >
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </select>
              </GridItem>
              <GridItem rowSpan={1} colSpan={1}>
                <Text mt={1} fontSize="lg">
                  Bet:
                </Text>{" "}
              </GridItem>
              <GridItem rowSpan={1} colSpan={5}>
                <Bet />
              </GridItem>
            </Grid>
          </ModalBody>

          <ModalFooter>
            {value.state.username !== "" ? (
              <RoundedButton
                color="orange"
                content="Create Room"
                onClick={() => {
                  createRoomDb();
                  onClose();
                  toast({
                    title: "Room Created!",
                    description: "Create room succeed.",
                    status: "success",
                    duration: 4000,
                    isClosable: true,
                    position: "top",
                  });
                }}
                size="md"
                // nextLink="/play"
              />
            ) : (
              <RoundedButton
                color="#fec078"
                content="Create Room"
                onClick={() => {
                  toast({
                    title: "Username is Empty!",
                    description: "Insert your username first.",
                    status: "success",
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
