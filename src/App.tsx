import { Flex } from "@chakra-ui/react";
import { Outlet } from "react-router";
import Header from "./components/Header";

export default function App() {
  return (
    <>
      <Flex align="center" direction="column" justify="center">
        <Header />
        <Flex as="main" w="100%" maxW="8xl" p="4">
          <Outlet />
        </Flex>
      </Flex>
    </>
  );
}
