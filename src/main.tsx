import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import App from "./App.tsx";
import DBView from "./components/DBView.tsx";

const theme = extendTheme({
  fonts: {
    body: "Fira Sans, system-ui, sans-serif",
    heading: "Fira Sans, system-ui, sans-serif",
  },
});

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      children: [
        {
          path: "",
          element: <DBView />,
        },
      ],
    },
  ],
  {
    basename: window.location.pathname.replace(/(\/[^/]+)$/, ""),
  }
);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <RouterProvider router={router} />
    </ChakraProvider>
  </React.StrictMode>
);
