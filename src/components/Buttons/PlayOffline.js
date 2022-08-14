import React from "react";
import Link from "next/link";
import { useToast } from "@chakra-ui/react";

export const PlayOfflineButton = () => {
  const toast = useToast();
  return (
    <>
      <Link href="https://rsp-eth.vercel.app/" passHref>
        <button
          className="btn-menu-style"
          onClick={() => {
            toast({
              title: "Maintenance!",
              description: "this feature still on Maintenance",
              status: "warning",
              duration: 5000,
              isClosable: true,
              position: "top",
            });
          }}
        >
          Play Offline
        </button>
      </Link>
    </>
  );
};
