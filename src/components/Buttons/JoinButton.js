import "bootstrap/dist/css/bootstrap.min.css";
import React, { useContext, useState, useEffect } from "react";
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
import axios from "axios";
import { IconSearch } from "@tabler/icons";
import { useRouter } from "next/router";

export const JoinButton = (address) => {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();
  const toast = useToast();
  const value = useContext(AppContext);
  const targetNetworkId = '0x66eeb';
  const { isOpen, onOpen, onClose } = useDisclosure();
  const reset = () => {
    value.setStatus(0);
    value.setOutcome("unknown");
    value.setChoice(1);
    value.setRematch("");
  };
  
  const checkNetwork = async () => {
    if (window.ethereum) {
      const currentChainId = await window.ethereum.request({
        method: 'eth_chainId',
      });
  
      console.log(currentChainId);
  
      if (currentChainId == targetNetworkId) return true;
      
      toast({
        title: "Arbitrum Network Only!",
        description: "Please make sure your network using Arbitrum.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return router.push('/');
    }
  };  

  return (
    <>
      <button
        className="btn-menu-style stats-btn mx-1 mt-1"
        onClick={async () => {
          if (typeof window.ethereum !== "undefined") {
            checkNetwork();
            if (address.address !== "") {
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
        <IconSearch />
        Find Room
      </button>

      <Modal size="lg" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent top="6rem" background="#787878">
          <ModalHeader>Find Room</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid
              templateColumns="repeat(6, 1fr)"
              gap={4}
            >
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
                onClick={async () => {
                  const response = await axios.get(
                    `https://www.boxcube.space/api/listroom/room/${value.state.gameId}`
                  );
                  if (response.data !== null) {
                    console.log(response.data.roomMember);
                    if (response.data.roomMember === "1") {
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
                      const roomMember = (
                        parseInt(response.data.roomMember) + 1
                      ).toString();
                      value.setRoomNum((response.data.id).toString());
                      value.setRoomId(roomId);
                      await axios
                        .patch(
                          `https://www.boxcube.space/api/listroom/${roomId}`,
                          {
                            roomMember,
                          }
                        )
                        .then(() => router.push("/play"));
                    } else {
                      toast({
                        title: "Room Full!",
                        status: "error",
                        duration: 4000,
                        isClosable: true,
                        position: "top",
                      });
                      getDataRoom();
                    }
                  }
                }}
                size="md"
                nextLink="/play"
              />
            ) : (
              <RoundedButton
                color="#ef6b9a"
                content="Find Room"
                onClick={() => {
                  toast({
                    title: "Something Wrong!",
                    description:
                      "Make sure your username or room id is correct.",
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
