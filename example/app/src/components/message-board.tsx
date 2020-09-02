import React, { useState, useEffect } from "react";
import { Auth, API } from "aws-amplify";

export const MessageBoard = (props: { loggedIn: boolean }) => {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    getMessages();
  }, []);

  const getMessages = async () => {
    const messages = await API.get("MessageApi", "/messages", {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
    setMessages(messages);
  };

  const putMessage = async () => {
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
        onSubmit={(e) => {
          e.preventDefault();
          putMessage();
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
