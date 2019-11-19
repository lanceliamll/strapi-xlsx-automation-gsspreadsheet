const GoogleSpreadsheet = require("google-spreadsheet");
const { promisify } = require("util");
const creds = require("./client_secret.json");
const axios = require("axios");

async function main() {
  const doc = new GoogleSpreadsheet(
    "1vriWaFAeS1hA-OAXu2pHbVG6QqFy6505xan-iZvp-5M"
  );

  await promisify(doc.useServiceAccountAuth)(creds);
  const info = await promisify(doc.getInfo)();
  const sheet = info.worksheets[0];

  const rows = await promisify(sheet.getRows)({
    offset: 1
  });

  //Get each row and store to database
  rows.map(row => {
    if (!row) return;

    if (row.stored !== "TRUE") {
      //SETS THE ROW VALUES TO TRUE
      row.stored = "TRUE";

      //SAVE THE EXCEL SHEET CHANGES
      row.save();

      //STORE TO STRAPI
      console.log(row.name, row.stored);
      const { name, stored } = row;
      axios
        .post("http://localhost:1337/xlsxes", { Name: name, Stored: stored })
        .then(res => console.log(res))
        .catch(err => console.log(err));
    }
  });
}

main();
