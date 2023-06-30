import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { RouterProvider, createHashRouter } from "react-router-dom";
import { enableMapSet } from "immer";

enableMapSet();

import App from "./App.tsx";
import DBView from "./components/DBView.tsx";
import SequenceView from "./components/SequenceView.tsx";

const theme = extendTheme({
  fonts: {
    body: "Fira Sans, system-ui, sans-serif",
    heading: "Fira Sans, system-ui, sans-serif",
  },
});

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <DBView />,
      },
      {
        path: "sequence/:seqId",
        element: <SequenceView />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <RouterProvider router={router} />
    </ChakraProvider>
  </React.StrictMode>
);
