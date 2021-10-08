const fs = require("fs");
const path = require("path");
const csv = require("fast-csv");
const prompts = require("prompts");

require("dotenv").config();

const users = new Set();
const data = [];

const getCurrentUser = async (possibleUsers) => {
  const response = await prompts({
    type: "text",
    name: "selectedUser",
    message: `Whose shows are we converting: ${possibleUsers.join(", ")} ?`,
    validate: (selectedUser) => {
      if (possibleUsers.includes(selectedUser)) {
        return true;
      } else {
        return "Please input one of the names above !";
      }
    },
  });
  return response;
};

 fs.createReadStream(path.resolve(__dirname, "data", "shows.csv"))
  .pipe(
    csv.parse({
      renameHeaders: true,
      headers: [
        "Profile Name",
        "Title Name",
        "Rating Type",
        "Star Value",
        "Thumbs Value",
        undefined,
        undefined,
        undefined,
      ],
    })
  )
  .on("error", (error) => console.error(error))
  .on("data", (row) => {
    // Add profile name to set to get unique list of users
    users.add(row["Profile Name"]);

    // Convert thumbs down to a 1 and a thumbs up to a 10
    if (row["Rating Type"] === "thumb" && parseInt(row["Thumbs Value"]) > 0) {
      const newRating = parseInt(row["Thumbs Value"]) < 2 ? 1 : 10;
      data.push({
        ...row,
        "Star Value": newRating,
        "Rating Type": "converted",
      });
    }
    //Anything below a 2 star rating will stay as one, everything else scales by 2
    else if (row["Rating Type"] === "star") {
      const newRating =
        parseInt(row["Star Value"]) < 2 ? 1 : parseInt(row["Star Value"]) * 2;
      data.push({
        ...row,
        "Star Value": newRating,
        "Rating Type": "converted",
      });
    }
  })
  .on("end", async (rowCount) => {
    const selectedUser = await getCurrentUser([...users]).then(
      ({ selectedUser }) => {
        // Get only shows rated by selected user
        const selectedUserShows = data.filter(
          (show) => show["Profile Name"] === selectedUser
        );

        // Write formatted shows to json file
        try {
          fs.writeFileSync(
            "data/formatted-shows.json",
            JSON.stringify({ shows: selectedUserShows })
          );
          //file written successfully
        } catch (err) {
          console.error(err);
        }
      }
    )
  });
