require("dotenv").config();
const puppeteer = require("puppeteer");
const fs = require("fs");
let writeStream = fs.createWriteStream("file.xlsx");
const HEADER = "Nome\tPreço\n";

async function start() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(process.env.AMAZON_URL);
  await page.waitForSelector("#twotabsearchtextbox");
  await page.type("#twotabsearchtextbox", "iphone");
  await page.keyboard.press("Enter");
  await page.waitForNavigation();
  writeStream.write(HEADER);
  const results = await page.evaluate(() => {
    const phoneList = {};
    const phones = Array.from(
      document.querySelectorAll(".a-section.a-spacing-medium")
    );

    for (const phone of phones) {
      const [phoneName, t, b, phonePrice] = phone.innerText.split(/\n/);
      if (!/iphone/i.test(phoneName)) continue;
      if (phonePrice && phonePrice !== ",") {
        phoneList[phoneName] = phonePrice;
      } else if (t && t.includes("R$")) {
        phoneList[phoneName] = t;
      } else {
        phoneList[phoneName] = "Sem Preço";
      }
    }
    return phoneList;
  });

  for (const result in results) {
    writeStream.write(`${result}\t${results[result]}\n`);
  }
  console.log("FINALIZADO");
  await browser.close();
}

start();
