import { Hero } from "../components/Hero";
import { Login } from "../components/Login";
import MediaQuery from "react-responsive";
import { Text } from "@chakra-ui/layout";

export default function Home() {
  return (
    <>
      <MediaQuery minWidth={768}>
        <Login />
      </MediaQuery>
      <MediaQuery maxWidth={767}>
        <div className="mobile-only">
          <div className="text-center">
            <img
              className="mb-2"
              src="pawws.png"
              style={{
                width: "10vh",
                margin: "auto",
              }}
            />
            <Text fontSize="xl" color="white">
              For better experience please use desktop device
            </Text>
          </div>
        </div>
      </MediaQuery>
    </>
  );
}
