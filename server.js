const express = require("express");
require("dotenv").config();
const MQTTHandler = require("./services/mqttHandler");
const http = require("http");
const { Server } = require("socket.io");
const dbAction = require("./database/dbMethod");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let mqttClient = new MQTTHandler(io);
mqttClient.connect();

io.on("connection", (socket) => {
  socket.on("message", (msg) => {
    let splittedMsg = msg.split(";");
    mqttClient.sendMessage(
      splittedMsg[0],
      splittedMsg.slice(0, splittedMsg.length).join(";")
    );
  });
});

app.get("/", (req, res) => {
  // dbAction
  //   .saveDataIOT("ada", "233", "add gram", "10000")
  //   .then((data) => {
  //     return res.json({ data });
  //   })
  //   .catch((err) => {
  //     return res.json({ data: err });
  //   });
  res.json({
    detail: {
      clientToServer: {
        formatMessage: "[ACTION];[PAYLOAD]",
        socketChannel: "message",
        action: "PERINTAH, AUTH",
        payload: [
          { action: "PERINTAH", message: "ON | OFF", example: "PERINTAH;ON" },
          {
            action: "AUTH",
            message: "[TOKEN_IOT];[ID_USER]",
            example: "AUTH;5422AD;adaadj-aeieie-client-id",
          },
        ],
      },
      serverToClient: {
        formatMessage: "[PAYLOAD]",
        topic: "/databandeng, /perintahiot, /authbandengiot",
        payload: [
          {
            topic: "/databandeng",
            payload: "[PANJANG];[BERAT];[HARGA]",
            example: "Berat;100;10000",
            type: "PUBLISH ONLY",
            socketChannelResponse: "data-bandeng",
          },
          {
            topic: "/perintahiot",
            payload: "ON || OFF",
            example: "ON",
            type: "SUBCRIBER ONLY",
          },
          {
            topic: "/authbandengiot",
            payload: "success || failed",
            example: "ON",
            type: "SUBCRIBER PUBLISHER",
            socketChannelResponse: "auth-iot",
          },
        ],
      },
    },
  });
});

server.listen(PORT, () => {
  console.log(`[#] Info : Server listening on : ${PORT}`);
});
