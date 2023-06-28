import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Sortable, { MultiDrag } from "sortablejs";

import App from "./App.tsx";
import DanceView from "./components/DanceView.tsx";
import DBView from "./components/DBView.tsx";
import SequenceView from "./components/SequenceView.tsx";
import TipView from "./components/TipView.tsx";

const theme = extendTheme({
  fonts: {
    body: "Fira Sans, system-ui, sans-serif",
    heading: "Fira Sans, system-ui, sans-serif",
  },
});

const paths = ([
  ["dance/:danceId", () => <DanceView />],
  ["tip/:tipId", () => <TipView />],
  ["sequence/:seqId", () => <SequenceView />],
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
        element: <DBView />,
      },
      ...paths,
    ],
  },
]);

Sortable.mount(new MultiDrag());

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <RouterProvider router={router} />
    </ChakraProvider>
  </React.StrictMode>
);
