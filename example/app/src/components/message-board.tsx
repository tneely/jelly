import React, { useState, useEffect } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { createComment } from "../graphql/mutations";
import { listComments } from "../graphql/queries";

export const MessageBoard = (props: { loggedIn: boolean }): JSX.Element => {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<{ text: string }[]>([]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getMessages().catch((e) => console.log(`Problem getting messages: ${e}`));
  }, []);

  const getMessages = async (): Promise<void> => {
    const messages = (await API.graphql({ query: listComments })) as {
      data: { listComments: { text: string }[] };
    };
    setMessages(messages.data.listComments);
  };

  const putMessage = async (): Promise<void> => {
    console.log(`Writing message ${message}`);
    await API.graphql(graphqlOperation(createComment, { text: message }));
    setMessage("");
    await getMessages();
  };

  return (
    <>
      <form
        style={{ textAlign: "right" }}
        onSubmit={async (e) => {
          e.preventDefault();
          await putMessage();
        }}
      >
        <textarea
          placeholder="Enter a message!"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={250}
          disabled={!props.loggedIn}
        />
        <input type="submit" value="Submit" disabled={!props.loggedIn || message.trim().length < 1} />
      </form>
      <div>
        {messages?.map((item, index: number) => {
          return (
            <p key={index} className="message">
              {item.text}
            </p>
          );
        })}
      </div>
    </>
  );
};
