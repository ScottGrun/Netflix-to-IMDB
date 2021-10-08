const fs = require("fs");
const puppeteer = require("puppeteer");
const { green, cyan, red } = require("kleur");

// Data
const rawdata = fs.readFileSync("./data/formatted-shows.json");
const { shows } = JSON.parse(rawdata);

// Utils
const { loginToPage } = require("./utils/loginToPage");
const { rateTitle } = require("./utils/rateTitle");

const rateBot = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Go to the IMDB sign in page
  await page.goto(
    "https://www.imdb.com/ap/signin?openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.imdb.com%2Fregistration%2Fap-signin-handler%2Fimdb_us&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=imdb_us&openid.mode=checkid_setup&siteState=eyJvcGVuaWQuYXNzb2NfaGFuZGxlIjoiaW1kYl91cyIsInJlZGlyZWN0VG8iOiJodHRwczovL3d3dy5pbWRiLmNvbS8_cmVmXz1sb2dpbiJ9&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&tag=imdbtag_reg-20"
  );

  try {
    //Login to page using IMDB creds not SSO
    await loginToPage(page);

    // Loop overs shows and rate them
    for await (let [idx, title] of shows.entries()) {
      console.log(
        green(
          "Attempting to rate: " +
            cyan().bold(title["Title Name"]) +
            ` (${idx} / ${shows.length})`
        )
      );
      await rateTitle(title["Title Name"], title["Star Value"], page);
    }

    await browser.close();
    console.log(
      green(
        "Rating Complete ! - Make sure to check unable-to-rate-titles.txt incase there were issues rating some titles."
      )
    );
  } catch (err) {
    console.log(red(err));
    await page.screenshot({ path: "error.png" });
    await browser.close();
  }
};

rateBot();