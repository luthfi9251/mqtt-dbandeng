let db = require("../services/db");

function saveDataIOT(id, panjang, berat, harga) {
    return new Promise((resolve, reject) => {
        db.query(
            "insert into iotdbandengs(id,power,panjang,berat,harga,created_at,updated_at) values (?,?,?,?,?,CURRENT_TIMESTAMP(),CURRENT_TIMESTAMP())",
            [id, "ON", panjang, `${berat} Gram`, harga]
        )
            .then((data) => {
                resolve(data);
            })
            .catch((err) => {
                console.log(`[!] Error : dbMethod : saveDataIOT : ${err}`);
                reject(err);
            });
    });
}

function getDataIOTbyId(id, date) {
    return new Promise((resolve, reject) => {
        db.query(
            "SELECT panjang, berat, harga, created_at FROM iotdbandengs WHERE id = ? AND created_at BETWEEN ? AND ? ",
            [id, date + " 00:00:00", date + " 23:59:59"]
        )
            .then((data) => {
                resolve(data);
            })
            .catch((err) => {
                console.log(`[!] Error : dbMethod : getDataIOTbyId : ${err}`);
                reject(err);
            });
    });
}

function getAvailableLaporanData(id) {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT DATE(created_at) AS tanggal,SUM(CASE WHEN panjang = 'Besar' THEN 1 ELSE 0 END) AS besar_count,SUM(CASE WHEN panjang = 'Sedang' THEN 1 ELSE 0 END) AS sedang_count, SUM(CASE WHEN panjang = 'Kecil' THEN 1 ELSE 0 END) AS kecil_count, SUM(berat) AS total_berat, SUM(harga) AS total_harga FROM iotdbandengs WHERE id = ? GROUP BY DATE(created_at) ORDER BY tanggal;`,
            [id]
        )
            .then((data) => {
                resolve(data);
            })
            .catch((err) => {
                console.log(`[!] Error : dbMethod : getAvailableLaporanData : ${err}`);
                reject(err);
            });
    });
}

function getDetailMitra(id, field) {
    return new Promise((resolve, reject) => {
        db.query(`SELECT ${field.map((item) => item)} from mitras where id=?`, [
            id,
        ])
            .then((data) => {
                resolve(data);
            })
            .catch((err) => {
                console.log(`[!] Error : dbMethod : getDetailMitra : ${err}`);
                reject(err);
            });
    });
}

function getIOTRunningData(id){
    return new Promise((resolve, reject) => {
        db.query(`SELECT DATE(time_on) as tanggal, SUM(TIMESTAMPDIFF(MINUTE, time_on, time_off)/60) AS hours_work FROM log_iotdbandeng WHERE id_mitra=? GROUP BY DATE(time_on) `, [
            id,
        ])
            .then((data) => {
                resolve(data);
            })
            .catch((err) => {
                console.log(`[!] Error : dbMethod : getIOTRunningData : ${err}`);
                reject(err);
            });
    })
}

function addLogDeviceIOT(id){
    return new Promise((resolve, reject)=>{
        //console.log("running query")
        db.query(`INSERT INTO log_iotdbandeng VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`, [
            id,
        ])
        .then((data) => {
            
            resolve(data);
        })
        .catch((err) => {
            console.log(`[!] Error : dbMethod : addLogDeviceIOT : ${err}`);
            reject(err);
        });
    })
}

function updateLogIOTDevices(id){
    return new Promise((resolve, reject)=>{
        db.query(`UPDATE log_iotdbandeng SET time_off=CURRENT_TIMESTAMP WHERE id_mitra=? ORDER BY time_on DESC LIMIT 1`, [
            id,
        ])
        .then((data) => {
            resolve(data);
        })
        .catch((err) => {
            console.log(`[!] Error : dbMethod : updateLogIOTDevices : ${err}`);
            reject(err);
        });
    })
}

module.exports = {
    saveDataIOT,
    getDataIOTbyId,
    getDetailMitra,
    getAvailableLaporanData,
    getIOTRunningData,
    addLogDeviceIOT,
    updateLogIOTDevices
};
