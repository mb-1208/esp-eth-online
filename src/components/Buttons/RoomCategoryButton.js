import React from "react";
import Link from "next/link";
import { useToast } from "@chakra-ui/react";
import { IconDoor } from "@tabler/icons";

export const RoomCategoryButton = () => {
  const toast = useToast();
  return (
    <>
      {/* <Link href="https://rsp-eth.vercel.app/" passHref> */}
      <button
        className="ms-2 btn-room stats-btn"
        //   onClick={() => {
        //   }}
      >
        <IconDoor />1 vs 1
      </button>
      {/* </Link> */}
      <button
        className="ms-2 btn-room-disabled stats-btn"
        onClick={() => {
          toast({
            title: "Comingsoon!",
            description: "",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
        }}
      >
        <IconDoor />
        vs CPU
      </button>
      <button
        className="ms-2 btn-room-disabled stats-btn"
        onClick={() => {
          toast({
            title: "Comingsoon!",
            description: "",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
        }}
      >
        <IconDoor />
        Multiplayer
      </button>
    </>
  );
};
