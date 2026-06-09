import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import {
  ApolloClient,
  InMemoryCache,
  split,
  HttpLink,
} from "@apollo/client";

import { ApolloProvider } from "@apollo/client/react";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
const wsUrl  = apiUrl.replace(/^http/, "ws");

const httpLink = new HttpLink({
  uri: `${apiUrl}/graphql`,
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: `${wsUrl}/graphql`,
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);

    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);