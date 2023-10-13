const fs = require("fs");
const path = require("path");
const { degrees, PDFDocument, rgb, StandardFonts } = require("pdf-lib");

function isiTabel({
    baris,
    kolom,
    activePage,
    startKolom,
    startBaris,
    timesRomanFont,
    widthCell,
    heightCell,
    dataText,
}) {
    if (baris === 0) {
        switch (kolom) {
            case 1:
                activePage.drawText("Panjang", {
                    x:
                        startKolom +
                        0.5 * widthCell -
                        "Panjang".length * 6 * 0.5,
                    y: startBaris + 0.25 * heightCell,
                    font: timesRomanFont[1],
                    size: 12,
                });
                break;
            case 2:
                activePage.drawText("Berat", {
                    x: startKolom + 0.5 * widthCell - "Berat".length * 6 * 0.5,
                    y: startBaris + 0.25 * heightCell,
                    font: timesRomanFont[1],
                    size: 12,
                });
                break;
            case 3:
                activePage.drawText("Harga", {
                    x: startKolom + 0.5 * widthCell - "Harga".length * 6 * 0.5,
                    y: startBaris + 0.25 * heightCell,
                    font: timesRomanFont[1],
                    size: 12,
                });
                break;
        }
    } else {
        activePage.drawText(dataText, {
            x: startKolom + 0.5 * widthCell - dataText.length * 6 * 0.5,
            y: startBaris + 0.25 * heightCell,
            font: timesRomanFont[0],
            size: 12,
        });
    }
}

async function generatePDF(dataMitra) {
    // dataMitra = {
    //     namaMitra: "Joko bandeng",
    //     alamatMitra: "Jl. Raya Mranggen No.21",
    //     tanggal: "Senin, 28 Februari 2023",
    //     bandengBesar: 8,
    //     bandengSedang: 5,
    //     bandengKecil: 10,
    //     data: [
    //         ["Besar", "15 gram", "12000"],
    //         ["Besar", "17 gram", "12000"],
    //         ["Kecil", "3 gram", "12000"],
    //         ["Sedang", "14 gram", "12000"],
    //         ["Besar", "16 gram", "12000"],
    //         ["Besar", "15 gram", "12000"],
    //         ["Besar", "17 gram", "12000"],
    //         ["Kecil", "3 gram", "12000"],
    //         ["Sedang", "14 gram", "12000"],
    //         ["Besar", "16 gram", "12000"],
    //         ["Besar", "15 gram", "12000"],
    //         ["Besar", "17 gram", "12000"],
    //         ["Kecil", "3 gram", "12000"],
    //         ["Sedang", "14 gram", "12000"],
    //         ["Besar", "16 gram", "12000"],
    //         ["Besar", "15 gram", "12000"],
    //         ["Besar", "17 gram", "12000"],
    //         ["Kecil", "3 gram", "12000"],
    //         ["Sedang", "14 gram", "12000"],
    //         ["Besar", "16 gram", "12000"],
    //         ["Besar", "15 gram", "12000"],
    //         ["Besar", "17 gram", "12000"],
    //         ["Kecil", "3 gram", "12000"],
    //         ["Sedang", "14 gram", "12000"],
    //         ["Besar", "16 gram", "12000"],
    //         ["Besar", "15 gram", "12000"],
    //         ["Besar", "17 gram", "12000"],
    //         ["Kecil", "3 gram", "12000"],
    //         ["Sedang", "14 gram", "12000"],
    //         ["Besar", "16 gram", "12000"],
    //         ["Besar", "15 gram", "12000"],
    //         ["Besar", "17 gram", "12000"],
    //         ["Kecil", "3 gram", "12000"],
    //         ["Sedang", "14 gram", "12000"],
    //         ["Besar", "16 gram", "12000"],
    //     ],
    // };

    let pdfTemplateArrayBuffer = fs.readFileSync(
        path.resolve("./template/laporan-template.pdf"),
        null
    ).buffer;
    let pdfDoc = await PDFDocument.load(pdfTemplateArrayBuffer);

    let timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    let timesRomanFontBold = await pdfDoc.embedFont(
        StandardFonts.TimesRomanBold
    );

    let indexPage = 0;
    let pages = pdfDoc.getPages();
    let activePage = pages[indexPage];

    let { width, height } = activePage.getSize();

    //Generate Nama Mitra
    activePage.drawText(dataMitra.namaMitra, {
        x: 300,
        y: height - 120,
        font: timesRomanFont,
        size: 14,
    });
    //generate Alamat Mitra
    activePage.drawText(dataMitra.alamatMitra, {
        x: 300,
        y: height - 145,
        font: timesRomanFont,
        size: 14,
    });
    activePage.drawText(dataMitra.tanggal, {
        x: 300,
        y: height - 171,
        font: timesRomanFont,
        size: 14,
    });

    //Jumlah Bandeng Besar
    activePage.drawText(dataMitra.bandengBesar.toString(), {
        x: 280,
        y: height - 224,
        font: timesRomanFont,
        size: 12,
    });
    activePage.drawText(dataMitra.bandengSedang.toString(), {
        x: 280,
        y: height - 247,
        font: timesRomanFont,
        size: 12,
    });
    activePage.drawText(dataMitra.bandengKecil.toString(), {
        x: 280,
        y: height - 268,
        font: timesRomanFont,
        size: 12,
    });

    //generate table
    let tablePositionStart = {
        x: 60,
        y: 550,
    };
    let tableWidth = width - 2 * tablePositionStart.x;
    let tableHeight = 23;
    let noColWidth = (1 / 15) * tableWidth;
    tableWidth -= noColWidth;
    let colWidth = (1 / 3) * tableWidth;
    let startBaris = tablePositionStart.y - tableHeight;

    for (let baris = 0; baris < dataMitra.data.length + 1; baris++) {
        let startKolom = tablePositionStart.x;

        if (startBaris < 50) {
            pdfDoc.addPage();
            pages = pdfDoc.getPages();
            activePage = pages[(indexPage += 1)];
            startBaris = 750 - tableHeight;
        }

        for (let kolom = 0; kolom < 4; kolom++) {
            if (kolom === 0) {
                activePage.drawRectangle({
                    x: startKolom,
                    y: startBaris,
                    width: colWidth,
                    height: tableHeight,
                    borderWidth: 1,
                    color: rgb(1, 1, 1),
                });

                if (baris === 0) {
                    activePage.drawText("No", {
                        x:
                            startKolom +
                            0.5 * noColWidth -
                            "No".length * 6 * 0.5,
                        y: startBaris + 0.25 * tableHeight,
                        font: timesRomanFontBold,
                        size: 12,
                    });
                } else {
                    let no = baris + "";
                    activePage.drawText(no, {
                        x: startKolom + 0.5 * noColWidth - no.length * 6 * 0.5,
                        y: startBaris + 0.25 * tableHeight,
                        font: timesRomanFontBold,
                        size: 12,
                    });
                }

                startKolom += noColWidth;
                continue;
            }
            activePage.drawRectangle({
                x: startKolom,
                y: startBaris,
                width: colWidth,
                height: tableHeight,
                borderWidth: 1,
                color: rgb(1, 1, 1),
            });

            isiTabel({
                baris,
                kolom,
                activePage,
                startKolom,
                startBaris,
                timesRomanFont: [timesRomanFont, timesRomanFontBold],
                widthCell: colWidth,
                heightCell: tableHeight,
                dataText: baris > 0 && dataMitra.data[baris - 1][kolom - 1],
            });

            startKolom += colWidth;
        }
        startBaris -= tableHeight;
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
    //fs.writeFileSync("./hasil.pdf", pdfBytes);
}

module.exports = {
    generatePDF,
};
