import React, { useState, useEffect } from "react";
import { Auth, API } from "aws-amplify";

export const MessageBoard = (props: { loggedIn: boolean }): JSX.Element => {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getMessages();
  }, []);

  const getMessages = async (): Promise<void> => {
    const messages = await API.get("MessageApi", "/messages", {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
    setMessages(messages);
  };

  const putMessage = async (): Promise<void> => {
    await API.post("MessageApi", "/messages", {
      body: {
        message,
      },
      headers: {
        "Access-Control-Allow-Origin": "*",
        Authorization: (await Auth.currentSession()).getIdToken().getJwtToken(),
      },
    });
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
        {messages?.map((item: { message: string }, index: number) => {
          return (
            <p key={index} className="message">
              {item.message}
            </p>
          );
        })}
      </div>
    </>
  );
};
