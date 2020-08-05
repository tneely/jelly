import React, { useState, useEffect } from "react";
import Amplify, { Auth, Hub, API } from "aws-amplify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import awsconfig from "./aws-config";
import jelly_design from "./jelly-design.svg";
import "./App.css";

Amplify.configure(awsconfig);
const githubIcon = <FontAwesomeIcon icon={faGithub} />;

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
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

  useEffect(() => {
    getMessages();
    Auth.currentAuthenticatedUser()
      .then((user) => {
        setUser(user);
      })
      .catch(() => console.log("Not signed in"));
  }, []);

  Hub.listen("auth", (content) => {
    switch (content.payload.event) {
      case "signIn":
        setUser(user);
        break;
      case "signOut":
        setUser(null);
        break;
    }
  });

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="App-logo">Jelly</h1>
        <a href="https://github.com/tneely/jelly">
          <button>{githubIcon} GitHub</button>
        </a>
      </header>

      <div className="App-body">
        <section>
          <p>
            Jelly is a high-level <a href="https://aws.amazon.com/cdk/">AWS CDK</a> construct for{" "}
            <a href="https://jamstack.org/">Jamstack</a> applications. It fully leverages AWS to
            deploy distributed, scalable web applications. Jelly supports domain routing, user
            authentication, and database-backed API calls. To get started with Jelly, follow the
            documentation on <a href="https://github.com/tneely/jelly">GitHub</a>.
          </p>
          <p>
            <img src={jelly_design} alt="Jelly design" />
          </p>
        </section>

        <section>
          <h2 className="section-header">Try it out!</h2>
          <p>
            This website was built using Jelly. You can log in and log out using the button below.
            Once logged in, you'll be able to leave an anonymous message as well. Only the 10 most
            recent messages are displayed. Messages persist for 7 days.
          </p>
          <div style={{ textAlign: "center" }}>
            {user ? (
              <button onClick={() => Auth.signOut()}>Log out</button>
            ) : (
              <button onClick={() => Auth.federatedSignIn()}>Log in</button>
            )}
          </div>
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
              disabled={!user}
            />
            <input type="submit" value="Submit" disabled={!user || message.trim().length < 1} />
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
        </section>
      </div>

      <footer className="App-footer">
        Developed by <a href="https://github.com/tneely">Taylor Neely</a>
      </footer>
    </div>
  );
};

export default App;
