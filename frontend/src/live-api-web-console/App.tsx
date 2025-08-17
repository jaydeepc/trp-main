import { useRef, useState } from "react";
import "./App.scss";
import { LiveAPIProvider } from "./contexts/LiveAPIContext";
import { Altair } from "./components/altair/Altair";
import ControlTray from "./components/control-tray/ControlTray";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY as string;
if (typeof API_KEY !== "string") {
  throw new Error("set REACT_APP_GEMINI_API_KEY in .env");
}

const host = "generativelanguage.googleapis.com";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;

function App() {
  return (
    <div className="App">
      <LiveAPIProvider url={uri} apiKey={API_KEY}>
        <div className="streaming-console">
          <main>
            <div className="main-app-area">
              {/* APP goes here */}
              <Altair />
            </div>

            <ControlTray
              supportsVideo={false}
              enableEditingSettings={true}
            />
          </main>
        </div>
      </LiveAPIProvider>
    </div>
  );
}

export default App;
