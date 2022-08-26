import React, { useContext, useState } from "react";
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
import { nanoid } from "nanoid";
import { ethers } from "ethers";
import axios from "axios";

export const CreateButton = (address) => {
  const [validation, setValidaiton] = useState(false);
  const [walletName, setWalletName] = useState("");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const value = useContext(AppContext);
  const { hasCopied, onCopy } = useClipboard(value.state.gameId);
  const reset = () => {
    const newId = nanoid();
    value.setGameId(newId);
    value.setBytesGameId(ethers.utils.id(newId));
    value.setStatus(0);
    value.setOutcome("unknown");
    value.setBet(0);
    value.setChoice(1);
  };

  const updateName = async () => {
    await axios
      .patch(`https://www.boxcube.space/api/leaderboardvs/address/${address.address}`, {
        walletName,
      });
  };

  return (
    <>
      <button
        className="btn-menu-style"
        onClick={() => {
          if (typeof window.ethereum !== "undefined") {
            console.log(address.address);
            if (address.address !== '') {
              reset();
              onOpen();
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
                  Username:
                </Text>{" "}
              </GridItem>
              <GridItem rowSpan={1} colSpan={5}>
                <Input
                  value={value.state.username}
                  placeholder="Username"
                  variant="outline"
                  onChange={(e) => {
                    value.setUsername(e.target.value);
                    setWalletName(e.target.value);
                  }}
                />
              </GridItem>
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
            </Grid>
          </ModalBody>

          <ModalFooter>
            {value.state.username !== "" ? (
              <RoundedButton
                color="orange"
                content="Create Room"
                onClick={() => {
                  updateName();
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
                nextLink="/play"
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
