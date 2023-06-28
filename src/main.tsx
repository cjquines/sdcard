import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import App from "./App.tsx";
import Dance from "./components/Dance.tsx";
import DB from "./components/DB.tsx";
import Sequence from "./components/Sequence.tsx";
import Tip from "./components/Tip.tsx";

const theme = extendTheme({
  fonts: {
    body: "Fira Sans, system-ui, sans-serif",
    heading: "Fira Sans, system-ui, sans-serif",
  },
});

const paths = ([
  ["dance/:danceId", () => <Dance />],
  ["tip/:tipId", () => <Tip />],
  ["sequence/:seqId", () => <Sequence />],
] as const)
  .reduce<(readonly [string, () => JSX.Element])[][]>(
    (acc, cur) => acc.concat(acc.map((set) => [...set, cur])),
    [[]]
  )
  .flatMap((pathElt) => {
    const path = pathElt.map(([url]) => url).join("/");
    const element = pathElt.at(-1)?.[1]();
    return element ? [ { path, element } ] : [];
  });

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <DB />,
      },
      ...paths,
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
