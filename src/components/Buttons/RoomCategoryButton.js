import React from "react";
import { useRouter } from "next/router";
import { useToast } from "@chakra-ui/react";
import { IconDoor } from "@tabler/icons";

export const RoomCategoryButton = () => {
  const toast = useToast();
  const router = useRouter();
  return (
    <>
      {/* <Link href="https://rsp-eth.vercel.app/" passHref> */}
      <button
        className="mx-1 mt-1 btn-room stats-btn"
        //   onClick={() => {
        //   }}
      >
        <IconDoor />1 vs 1
      </button>
      {/* </Link> */}
      <button
        className="mx-1 mt-1 btn-room stats-btn"
        onClick={() => {
          router.push("/cpu");
        }}
      >
        <IconDoor />
        vs CPU
      </button>
      <button
        className="mx-1 mt-1 btn-room-disabled stats-btn"
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
