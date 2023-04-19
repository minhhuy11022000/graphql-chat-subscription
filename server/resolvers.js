import { GraphQLError } from "graphql";
import { createMessage, getMessages } from "./db/messages.js";
import { PubSub } from "graphql-subscriptions";

// PubSub: Publish and Subcribe
const pubSub = new PubSub();

export const resolvers = {
  Query: {
    messages: (_root, _args, { user }) => {
      if (!user) throw unauthorizedError();
      return getMessages();
    },
  },

  Mutation: {
    addMessage: async (_root, { text }, { user }) => {
      if (!user) throw unauthorizedError();
      const message = await createMessage(user, text);
      pubSub.publish("MESSAGE_ADDED", { messageAdded: message });
      return message;
    },
  },

  // Subscription doesn't return value like Query/Mutation
  // but notify events occur
  Subscription: {
    messageAdded: {
      subscribe: () => pubSub.asyncIterator("MESSAGE_ADDED"),
    },
  },
};

function unauthorizedError() {
  return new GraphQLError("Not authenticated", {
    extensions: { code: "UNAUTHORIZED" },
  });
}
