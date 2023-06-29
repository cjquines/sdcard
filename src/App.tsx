import { Flex } from "@chakra-ui/react";
import { Outlet } from "react-router";
import Header from "./components/Header";

import "./App.css";

export default function App() {
  return (
    <>
      <Flex align="center" direction="column" justify="center" minH="100vh">
        <Header />
        <Flex as="main" w="100%" maxW="8xl" p="4" flex="1" pos="relative">
          <Outlet />
        </Flex>
      </Flex>
    </>
  );
}
