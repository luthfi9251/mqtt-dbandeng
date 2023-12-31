const express = require("express");
require("dotenv").config();
const MQTTHandler = require("./services/mqttHandler");
const http = require("http");
const { Server } = require("socket.io");
const dbAction = require("./database/dbMethod");
const { generatePDF } = require("./services/pdfCreator");
const utils = require("./utils/utils");
const stream = require("stream");

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

    socket.on("add_device_log", (msg) => {
        let MODE = {
            CREATE: 1,
            UPDATE: 2,
        }
        // format = 1;id_mitra-ada-adad-adada-daa
        let message = msg.split(";")
        //console.log(message)
        switch(parseInt(message[0])){
            case MODE.CREATE:
                //console.log("mode create")
                dbAction.addLogDeviceIOT(message[1])
                .then(data => socket.emit("response_socket",utils.formatSocketResponse("add_device_log", "Success add Device Log") ))
                break;
            case MODE.UPDATE:
                dbAction.updateLogIOTDevices(message[1])
                .then(data => socket.emit("response_socket",utils.formatSocketResponse("add_device_log", "Success update Device Log") ))
                break;
            default:
                console.log("default")
                break;
        }
    })

    socket.on("log_devices", msg => {
        dbAction.getIOTRunningData(msg)
        .then(res => {
            res.forEach(item => {
                item.fullTanggal = utils.convertDate(item.tanggal)
                item.tanggal = item.tanggal.toLocaleString("id-ID").slice(0,10)
            })
            socket.emit("log_devices/res", res)
            //console.log(res)
        })
        .catch(err => {
            //console.log(err)
            socket.emit("log_devices/res", {err: err})
        })
    })

});

app.get("/", (req, res) => {
    res.json({
        detail: {
            clientToServer: {
                formatMessage: "[ACTION];[PAYLOAD]",
                socketChannel: "message",
                action: "PERINTAH, AUTH",
                payload: [
                    {
                        action: "PERINTAH",
                        message: "ON | OFF",
                        example: "PERINTAH;ON",
                    },
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

app.get("/laporan", async (req, res) => {
    let { date, id } = req.query;

    if (!id) {
        return res
            .status(400)
            .json({ success: "false", messaage: "please provide ID" });
    }
    if (!date) {
        date = new Date().toISOString().slice(0, 10);
    }

    let dataMitra = await dbAction.getDetailMitra(id, [
        "namaMitra",
        "alamatMitra",
    ]);

    console.log(dataMitra);
    if (dataMitra.length < 1) {
        return res
            .status(400)
            .json({ success: "false", messaage: "ID not found" });
    }

    let dataBandeng = await dbAction.getDataIOTbyId(id, date);

    let data = {
        namaMitra: dataMitra[0].namaMitra,
        alamatMitra: dataMitra[0].alamatMitra,
        tanggal: utils.convertDate(date),
        bandengBesar: dataBandeng.filter((item) => item.panjang === "Besar")
            .length,
        bandengSedang: dataBandeng.filter((item) => item.panjang === "Sedang")
            .length,
        bandengKecil: dataBandeng.filter((item) => item.panjang === "Kecil")
            .length,
        data: dataBandeng.map((item) => [item.panjang, item.berat, item.harga]),
    };

    let bufferPdf;
    try {
        bufferPdf = await generatePDF(data);
    } catch (err) {
        return res.status(400).json({
            success: "false",
            messaage: err,
        });
    }

    const readStream = new stream.PassThrough();
    readStream.end(bufferPdf);
    res.set(
        "Content-disposition",
        "attachment; filename=" +
            `Laporan_${dataMitra[0].namaMitra}_${date}.pdf`
    );
    res.set("Content-Type", "application/pdf");
    readStream.pipe(res);
});

app.get("/laporan/available", async (req, res) => {
    let { id } = req.query;
    if (!id) {
        return res
            .status(400)
            .json({ success: "false", messaage: "please provide ID" });
    }

    let result = await dbAction.getAvailableLaporanData(id);

    res.status(200).json({
        success: "true",
        message: result.map((item) => {
            const [day, month, year] = item.tanggal
                .toLocaleString("id-ID")
                .slice(0, 10)
                .split("/");
            return {
                ...item,
                tanggalRaw: `${year}-${month}-${day}`,
                tanggal: utils.convertDate(item.tanggal),
            };
        }),
    });
});

server.listen(PORT, () => {
    console.log(`[#] Info : Server listening on : ${PORT}`);
});
