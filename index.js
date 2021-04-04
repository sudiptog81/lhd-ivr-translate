const express = require("express");
const morgan = require("morgan");
const { Translate } = require("@google-cloud/translate").v2;

const PORT = process.env.PORT || 5000;

const app = express();
const translate = new Translate({
  projectId: "lhd-video-playlists-project",
  keyFile: "/home/sudipto/lhd-ivr-translate/key.json",
});

app.use(express.json());
app.use(morgan("tiny"));

app.post("/webhooks/answer", (req, res) => {
  const ncco = [
    {
      action: "talk",
      text: "Please select 1 for English, 2 for Hindi and 3 for German",
      language: "en-IN",
      style: 2,
    },
    {
      action: "input",
      eventUrl: [`${req.protocol}://${req.get("host")}/webhooks/dtmf`],
      type: ["dtmf"],
      dtmf: {
        maxDigits: 1,
        timeOut: 10,
      },
    },
  ];

  res.json(ncco);
});

app.post("/webhooks/dtmf", async (req, res) => {
  let response, lang;
  if (!req.body.dtmf.digits) {
    response = "You did not enter anything!";
  } else {
    if (req.body.dtmf.digits == 1) {
      lang = "en-IN";
    } else if (req.body.dtmf.digits == 2) {
      lang = "hi-IN";
    } else if (req.body.dtmf.digits == 3) {
      lang = "de-DE";
    } else {
      lang = "en-US";
    }

    const text =
      "Please wear a mask before going out and help us defeat the pandemic! Thank you for calling!";
    const target =
      lang == "en-IN"
        ? "en"
        : lang == "hi-IN"
        ? "hi"
        : lang == "de-DE"
        ? "de"
        : "en";

    let [translations] = await translate.translate(text, target);
    response = translations;
  }

  const ncco = [
    {
      action: "talk",
      text: response,
      language: "en-IN",
      style: 2,
    },
  ];

  res.json(ncco);
});

app.post("/webhooks/event", (req, res) => {
  console.log(req.body.uuid, req.body.status);
  res.send("");
});

app.listen(PORT, () => console.log(`Listening on Port ${PORT}`));
