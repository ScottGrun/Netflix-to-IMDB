const { closest } = require("fastest-levenshtein");

const rateTitle = async (titleToRate, rating, page) => {
  try {
    // Search for title
    await page.waitForSelector("#add-to-list-search");
    await page.type("#add-to-list-search", titleToRate, { delay: 200 });
    await page.waitForTimeout(1500);

    // Grab list of shows that appear in the search
    // Nede to trim out the date that IMDB adds to not mess with the Levenshtein distance
    const possibleTitles = await page.$$eval(".search_item", (elements) =>
      elements.map((item) =>
        item.textContent.replace(/\([^)]*\)|\[[^\]]*\]/, "").trim()
      )
    );

    // Find the closest IMDB title name that matches the Netflix Title Name
    const closestMatch = possibleTitles.indexOf(
      closest(titleToRate, possibleTitles)
    );

    // Click on closest match
    await page.waitForSelector(
      `#add-to-list-search-results > a:nth-child(${closestMatch + 1})`
    );
    await page.click(
      `#add-to-list-search-results > a:nth-child(${closestMatch + 1})`,
      {
        delay: 50,
      }
    );

    // Get the id
    await page.waitForSelector(
      `#add-to-list-search-results > a:nth-child(${closestMatch + 1})`
    );
    const id = await page.evaluate(
      `document.querySelector("#add-to-list-search-results > a:nth-child(${
        closestMatch + 1
      })").getAttribute("data-const")`
    );

    // Click rating button
    await page.waitForSelector(`#urv_${id}`);
    await page.click(`#urv_${id}`, { delay: 50 });

    await page.waitForSelector(
      `#${id} > span.rating-stars > a:nth-child(${rating > 0 ? rating : 1})`
    );
    await page.click(
      `#${id} > span.rating-stars > a:nth-child(${rating > 0 ? rating : 1})`,
      { delay: 50 }
    );
  } catch (err) {
    console.log(
      red(
        `Issue Rating ${titleToRate}, skipping rating check 'unable-to-rate-titles.txt' for a list of all titles that couldnt be rated`
      )
    );

    // Write name of title that couldn't be rated to file
    fs.writeFile(
      "data/unable-to-rate-titles.txt",
      titleToRate,
      { flag: "a+" },
      (err) => {
        if (err) throw err;
      }
    );
    return;
  }
};

module.exports = { rateTitle };
