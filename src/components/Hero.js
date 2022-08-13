import { Box, Heading, Container, Text, Stack } from "@chakra-ui/react";
import { CreateButton } from "./Buttons/CreateButton";
import { JoinButton } from "./Buttons/JoinButton";
import { PlayOfflineButton } from "./Buttons/PlayOffline";
import { useEffect } from "react";
import { useRouter } from "next/router";

export const Hero = () => {
  const router = useRouter();

  // useEffect(() => {
  //   const splash = document.querySelector(".splash");
  //   console.log("getting");
  //   document.addEventListener("DOMContentLoaded", (e) => {
  //     console.log("get");
  //     setTimeout(() => {
  //       console.log("get");
  //       splash.classList.add("display-none");
  //     }, 2000);
  //   });
  // }, []);

  return (
    <>
      {/* <div className="splash">
        <h1 className="fade-in">Pawws</h1>
      </div> */}
      <div className="menu-section">
        <div>
          <Heading
            style={{ color: "#6d8725", marginBottom: "3rem" }}
            fontWeight={700}
            fontSize={{ base: "2xl", sm: "4xl", md: "6xl" }}
            lineHeight={"110%"}
          >
            Rock Paper Scissors
          </Heading>
          <Stack
            direction={"column"}
            spacing={3}
            align={"center"}
            alignSelf={"center"}
            position={"relative"}
          >
            <CreateButton />
            <JoinButton />
            <PlayOfflineButton />
          </Stack>
        </div>
      </div>
    </>
  );
};
