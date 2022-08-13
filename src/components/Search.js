import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { Button, IconButton } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Search2Icon } from "@chakra-ui/icons";
import { Icon } from "@chakra-ui/icon";
import { Input } from "@chakra-ui/input";
import { PlayerData } from "./PlayerData";

export const Search = ({
  sendSearch,
  query,
  setQuery,
  player,
  score,
  gameDetails,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <button
        className="btn-result"
        style={{ width: "80%" }}
        onClick={() => {
          onOpen();
          sendSearch();
        }}
      >
        See Match Result
      </button>

      <Modal size="6xl" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent top="6rem" background="#6d8725">
          <ModalHeader>Result Match</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <PlayerData
              player={player}
              score={score}
              gameDetails={gameDetails}
            />
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={sendSearch}>
              Refresh
            </Button>
            <Button onClick={onClose} variant="ghost">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
