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

module.exports = {
  saveDataIOT,
};
