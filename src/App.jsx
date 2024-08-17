import { useState, useEffect } from "react";
import axios from "axios";
import reactLogo from "./assets/react.svg";
import { Button } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import IconButton from "@mui/material/IconButton";
import LoadingButton from "@mui/lab/LoadingButton";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import TextField from "@mui/material/TextField";
import { FormControlLabel, Checkbox } from "@mui/material";

import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [jsonOutput, setJsonOutput] = useState(true);
  const [messages, setMessages] = useState([]);
  const [messagesDone, setMessagesDone] = useState(false);
  const [websocket, setWebsocket] = useState(null);

  const [loadingAnswers, setLoadingAnswers] = useState(false);
  // const [json] = useState();

  // List all the movies and TV shows in which Jennifer Aniston played the main role. Include a valid IMDb ID for each item. Results is a list of objects for each item with the following keys: `title`, `imdb_id`, `type` ('movie', 'tv_show')

  const askGptStream = async () => {
    setMessages([]);
    setLoadingAnswers(true);
    setMessagesDone(false);

    const ws = new WebSocket("ws://localhost:5000/askgptstream");
    ws.onopen = () => {
      console.log("WebSocket Connected");
      const message = { question: question, jsonOutput: jsonOutput };
      ws.send(JSON.stringify(message)); // Initial message to start streaming
    };
    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };
    ws.onclose = () => {
      setLoadingAnswers(false);
      console.log("WebSocket Disconnected");
    };
    setWebsocket(ws);

    return () => {
      ws.close();
      setLoadingAnswers(false);
      setMessagesDone(true);
    };
  };

  const omdb_template = (imdb_id) => `https://www.omdbapi.com/?i=${imdb_id}&apikey=2136fa1`;

  const getOmdbData = (imdb_id) => {
    const url = omdb_template(imdb_id);
    axios.get(url).then((res) => console.log(res.data.Poster));
  };

  const augmentDataWithImages = async (resourcesToAugment) => {
    console.log(resourcesToAugment);

    resourcesToAugment.slice(0, 3).map((item) => getOmdbData(item?.imdb_id));
  };

  useEffect(() => {
    if (messages && messages.length > 0) {
      let msgs = [...messages];
      msgs.shift();
      msgs.shift();
      msgs.shift();
      msgs.pop();
      const res = augmentDataWithImages(JSON.parse(msgs.join("")));
      console.log(res);
    }
  }, [messagesDone]);

  return (
    <Grid container className="ChatContainer">
      <Grid xs={12}>
        <div>
          <h1>CelebGPT V1.0</h1>
          <Grid container spacing={2}>
            <Grid xs={12} style={{ textAlign: "left" }}>
              <FormControlLabel onChange={() => setJsonOutput((c) => !c)} control={<Checkbox checked={jsonOutput} />} label="JSON Output?" />
            </Grid>
            <Grid xs={10}>
              <TextField
                fullWidth
                id="outlined-basic"
                label="Ask Your Question"
                variant="outlined"
                style={{ color: "white" }}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </Grid>
            <Grid xs={2} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <LoadingButton
                loading={loadingAnswers}
                fullWidth
                size="large"
                onClick={askGptStream}
                variant="outlined"
                color="primary"
                size="small"
                endIcon={<SendIcon color="primary" />}
              >
                Ask CelebPGT
              </LoadingButton>
            </Grid>

            <Grid xs={12}>
              <div style={{ textAlign: "left" }}>
                {messages.map((msg, index) => (
                  <span key={index}>{msg}</span>
                ))}
              </div>
            </Grid>
          </Grid>
        </div>
      </Grid>
    </Grid>
  );
}

export default App;
