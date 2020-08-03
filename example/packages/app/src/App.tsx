import React, { useState, useEffect } from "react";
import Amplify, { Auth, Hub } from "aws-amplify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import awsconfig from "./aws-config";
import jelly_design from "./jelly-design.svg";
import "./App.css";

Amplify.configure(awsconfig);
const githubIcon = <FontAwesomeIcon icon={faGithub} />;

function App() {
  const [user, setUser] = useState(null);
  const messages = ["1", "2", "3"];

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then((user) => {
        console.log("currentAuthenticatedUser", user);
        setUser(user);
      })
      .catch(() => console.log("Not signed in"));
  }, []);

  Hub.listen("auth", (content) => {
    switch (content.payload.event) {
      case "signIn":
        console.log(content.payload.data);
        setUser(user);

        break;
      case "signOut":
        console.log(content.payload.data);
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
            authentication, and database-backed API calls.
          </p>
          <p>
            <img src={jelly_design} alt="Jelly design" />
          </p>
        </section>

        <section>
          <h2 className="section-header">Try it out!</h2>
          <p>
            This website was built using Jelly. You can login and logout using the button below.
            Once logged in, you'll be able to leave an anonymous message as well that will persist
            for 30 days.
          </p>
          <div style={{ textAlign: "center" }}>
            {user ? (
              <button onClick={() => Auth.signOut()}>Log out</button>
            ) : (
              <button onClick={() => Auth.federatedSignIn()}>Log in</button>
            )}
          </div>
          <div>
            {messages.map((message, index) => {
              return (
                <p key={index} className="message">
                  {message}
                </p>
              );
            })}
          </div>
          <form style={{ textAlign: "right" }}>
            <textarea placeholder="Enter a message!" disabled={!user} />
            <input type="submit" disabled={!user} />
          </form>
        </section>
      </div>

      <footer className="App-footer">
        Developed by <a href="https://github.com/tneely">Taylor Neely</a>
      </footer>
    </div>
  );
}

export default App;
