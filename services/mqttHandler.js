const mqtt = require("mqtt");
const dbAction = require("../database/dbMethod");

class MQTTHandler {
  constructor(io) {
    this.TOPIC_DATABANDENG = "/databandeng";
    this.TOPIC_ACTIONTOIOT = "/perintahiot";
    this.TOPIC_AUTHIOT = "/authbandengiot";

    this.socketIoInstance = io;
    this.clientId = "mqttjs_" + Math.random().toString(8).substr(2, 4);
    this.mqtt_client = null;
    // this.mqtt_server = `ws://${process.env.MQTT_SERVER}:${process.env.MQTT_PORT}`;
    this.mqtt_server = `${process.env.MQTT_PROTOCOL}://${process.env.MQTT_SERVER}:${process.env.MQTT_PORT}`;
    this.mqtt_username = process.env.MQTT_USERNAME;
    this.mqtt_password = process.env.MQTT_PASSWORD;
  }

  connect() {
    this.mqtt_client = mqtt.connect(this.mqtt_server, {
      clientId: this.clientId,
      username: this.mqtt_username,
      password: this.mqtt_password,
    });

    this.mqtt_client.on("error", (err) => {
      console.log(err);
      this.mqttClient.end();
    });

    this.mqtt_client.on("connect", () => {
      console.log(`[#] Info : MQTT client connected`);
    });

    this.mqtt_client.subscribe(this.TOPIC_DATABANDENG, { qos: 0 });
    this.mqtt_client.subscribe(this.TOPIC_ACTIONTOIOT + "/res", { qos: 0 });
    this.mqtt_client.subscribe(this.TOPIC_AUTHIOT + "/res", { qos: 0 });

    this.mqtt_client.on("message", (topic, message) => {
      console.log(topic + " " + message);
      switch (topic) {
        case this.TOPIC_ACTIONTOIOT + "/res":
          this.socketIoInstance.emit("cmd_iot", message);
          break;

        case this.TOPIC_AUTHIOT + "/res":
          if (message.toString().toLowerCase() === "success") {
            this.socketIoInstance.emit("auth_iot", "success");
          } else {
            this.socketIoInstance.emit("auth_iot", "failed");
          }
          break;

        case this.TOPIC_DATABANDENG:
          let arrMessage = message.toString().split(";");
          dbAction.saveDataIOT(
            arrMessage[0],
            arrMessage[1],
            arrMessage[2],
            arrMessage[3]
          );
          this.socketIoInstance.emit("data_bandeng", message.toString());
          break;

        default:
          console.log(`[!] Error : Topik tidak ditemukan : ${topic}`);
          break;
      }
    });

    this.mqtt_client.on("close", () => {
      console.log(`[#] Info : MQTT Client Disconnected`);
    });
  }

  sendMessage(type, message) {
    switch (type) {
      case "PERINTAH":
        this.mqtt_client.publish(this.TOPIC_ACTIONTOIOT, message);
        break;
      case "AUTH":
        this.mqtt_client.publish(this.TOPIC_AUTHIOT, message);
        break;
      default:
        console.log(`[!] Error : Unknown type to publish message`);
        break;
    }
  }
}

module.exports = MQTTHandler;
