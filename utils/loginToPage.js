
require('dotenv').config();


const loginToPage = async (page) => {
  const EMAIL = process.env.IMDB_EMAIL;
  const PASSWORD =  process.env.IMDB_PASSWORD;
  const LIST_ID = process.env.IMDB_LIST_ID;

  await page.waitForSelector("#ap_email");
  await page.type("#ap_email", EMAIL, { delay: 50 });

  await page.waitForSelector("#ap_password");
  await page.type("#ap_password", PASSWORD, { delay: 50 });

  await page.click("#signInSubmit");

  // Wsait for page redirect to complete
  await page.waitForNavigation({ waitUntil: "networkidle0" });

  // If we have a list ID edit that list otherwise create new list
  if (LIST_ID) {
    await page.goto(`https://www.imdb.com/list/${LIST_ID}/`);

    // Click the list menu button
    await page.waitForSelector("#main > div > div.overflow-menu > div");
    await page.click("#main > div > div.overflow-menu > div");

    // CLick edit
    await page.waitForSelector("#ui-id-1 > ul > li:nth-child(1) > a");
    await page.click("#ui-id-1 > ul > li:nth-child(1) > a");
  } else {
    // Open profile menu
    await page.waitForSelector(
      "#imdbHeader > div.ipc-page-content-container.ipc-page-content-container--center.navbar__inner > div._3x17Igk9XRXcaKrcG3_MXQ.navbar__user.UserMenu-sc-1poz515-0.lkfvZn > div > label.ipc-button.ipc-button--single-padding.ipc-button--center-align-content.ipc-button--default-height.ipc-button--core-baseAlt.ipc-button--theme-baseAlt.ipc-button--on-textPrimary.ipc-text-button.navbar__flyout__text-button-after-mobile.navbar__user-menu-toggle__button"
    );
    await page.click(
      "#imdbHeader > div.ipc-page-content-container.ipc-page-content-container--center.navbar__inner > div._3x17Igk9XRXcaKrcG3_MXQ.navbar__user.UserMenu-sc-1poz515-0.lkfvZn > div > label.ipc-button.ipc-button--single-padding.ipc-button--center-align-content.ipc-button--default-height.ipc-button--core-baseAlt.ipc-button--theme-baseAlt.ipc-button--on-textPrimary.ipc-text-button.navbar__flyout__text-button-after-mobile.navbar__user-menu-toggle__button"
    );

    // Navigate to lists page
    await page.waitForSelector("#navUserMenu-contents > ul > a:nth-child(6)");
    await page.click("#navUserMenu-contents > ul > a:nth-child(6)");

    // Click create new list
    await page.waitForSelector(
      "#sidebar > div.list-create-widget > a > button"
    );
    await page.click("#sidebar > div.list-create-widget > a > button");

    // Create new list titled "Netflix to IMDB"
    await page.waitForSelector("#list-create-name");
    await page.type("#list-create-name", "Netflix to IMDB", { delay: 50 });

    // Create List
    await page.click("#list-create-form > button");
  }
};

module.exports = { loginToPage };
