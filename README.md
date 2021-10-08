# Netflix to IMDB

A set of Node.js scripts to format your Netflix ratings to a format IMDB accepts and then go ahead automatically rate all those titles on IMDB thus allowing you to get recommendations across IMDBs entire catalog (Netflix, Hulu, Disney+, etc) and not just Netflix's.

## Table of contents

- [Overview](#overview)
  - [How to Run 🧰](##How-to-RUn)
  - [Challenges 🧠](#the-challenge)
    - [Incossient Netflix Data](###Incossient-Netflix-Data)
    - [Converting Ranges](###Converting-various-Netflix-ranges-to-IMBDBs-1-10)
    - [Slow UI Causes Crash](###IMDBs-UI-lag-Caused-Bot-to-Timeout)
    - [Graceful Error Handling](###Bot-Crash-Means-Starting-Over)

- [Continued development](#continued-development)

# Overview

## How to Run 🧰

To make the bot work for you to do the following, clone this repo and follow these steps:

### Getting Your Data
1. Go to Netflix and download request your data by clicking [here](https://www.netflix.com/account/getmyinfo).

2. Once you have the .zip file extract it and go into the CONTENT_INTERACTION folder and grab your Ratings.csv file.
3. Rename this file to **shows.csv** and copy it to the data folder in the repo you cloned

### Running Bot
Currently, the script only works using IMDB login credentials so make sure you have an account set up with them.

1. Add your email and password to the .env file

2. If you already have a list created that you want the bot to add titles to you can add its list id to the .env file otherwise it will create a new list for you.
3. Format your data by running ```node ./format.js``` follow the prompts in the CLI. Once your data is formatted you should have a ```formatted-shows.json``` file in the data folder.
4. Now run the bot using ```node ./bot.js```, sit back and watch the ratings fly by.

## Challenges 🧠

## TLDR
- Netflix had inconsistent rating data that needed to be formatted before the bot could use it - fixed with formatting script

- IMDBs UI would cause the bot to timeout due to waiting for so much data to load before it could click on the selectors - fixed by using IMDBs list feature
- Netflix and IMDB had inconsistent title naming which would cause the wrong title to be added - fixed using a Levenshtein Distance package
- Bot crash meant starting over - fixed with a try/catch block that would skip the problem title and write its name to a text file for you to refer to later

### Incossient Netflix Data
One of the main challenges of this project was how unpredictable the Netflix data turned out to be. I expected the ratings to be represented as thumbs up or down with their value being either a 0 or 1. Well, my viewing history goes back to 2014 which means it also contained ratings represented as a scale of stars. Once I learned this I then assumed the star ratings would go from 1-5, nope see below for an example of the data Netflix spit out.


| Profile Name  | Title Name  | Rating Type   | Star Value  | Thumbs Value  |
|-------------- |------------ |-------------  |------------ |-------------- |
| User A        | Show A      | star          | 5           |               |
| User B        | Movie B     | star          | 1           |               |
| User A        | Show C      | star          | -2          |               |
| User A        | Movie D     | thumb         |             | 0             |
| User C        | Movie E     | thumb         |             | 1             |
| User B        | Show F      | thumb         |             | 2             |

So after matching the values I saw in the data to the ratings in the Netflix UI, I made the following assumptions:

- Shows can have a rating type of either star or thumb
- Thumb rating types value can range from 0 - 2 with the following meaning:
  - 0 = Unrated
  - 1 = thumbs down
  - 2 = thumbs up
- Star ratings can range from negative numbers up to 5
- The data contains all users associated with the account


### Converting various Netflix ranges to IMBDBs 1-10

So after combing over and exploring the data I realized that a script was going to need to be written to convert all Netflix's various rating values and rating types to one rating type and on a scale of 1-10 as well filter out all the shows for users who were not me. The script I wrote (```format.js```) does the following:

- Extract out only the titles I have rated
- Ignore any title that has a thumb rating and value of 0
- Convert any title that has a thumb rating of 2 to be 10
- Convert any title that has a star rating of less than 2 to 1
- Convert any title that has a star rating greater than 2 to be doubled 
- Finally, write all the data to a JSON file we can loop over

### IMDBs UI lag Caused Bot to Timeout

So initially I was thinking I could just use a puppeteer script to loop over all the formatted data and go to each title's page and rate it and be done with it. However what I soon realized was that when loading the page you are getting the whole kitchen sink, you need to wait for a ton of data to load before you can interact with the page, however, **we're only interested in the rating functionality**. This meant that sometimes the bot would go faster than the page could keep up with. Initially I thought I would just wait for the selectors to load then click them but that ended up making the bot take forever.

After poking around I found that IMDB has a **lists feature**. This feature allows users to create a list and then use small text input to search for titles that instantly return title names matching what you have typed in, no images, no actors. When you click on the title name it immediately appends it to the list and shows a title name and rating this is  **wayyyyy faster***.

### Inconscient Netflix vs IMDB Title Names (Levenshtein Distance)

So Netflix title names are just the title ex: "Iron Man", IMDB's on the other hand is the title name plus the release date ex: "Iron Man (2008)". So this wasn't a problem until titles also had upcoming sequels. Initially, I wrote the bot to just click on the first result hoping that names would match, bad idea. 

Turns out IMDB's search will return results matching your input, BUT if there is an upcoming sequel it will make that the first result meaning that when the bot would add the sequel it would crash when trying to click on the rating button since upcoming titles cannot be rated. So when the bot tried to rate "Doctor Strange" it clicked on  "Doctor Strange in the Multiverse of Madness". After wracking my brain and doing some googling I found I could use the Levenshtein Distance equation to get the closest text match and click on that.

So first I would collect all the search results returned from the text input, grab the text content, and regex out the dates, and then drop that array into the```closest()``` function provided by the [fastest-levenshtein](https://www.npmjs.com/package/fastest-levenshtein) package, this would spit out the closest match and I would select that and move on.

### Bot Crash Means Starting Over

So even after all that there would still be occurrences where the bot would fail to rate a title and then timeout and crash, usually this was a show in their database that for some reason existed but couldn't be assigned a rating. This also meant that whenever the bot would crash we would need to stat over which if you have a lot of shows rated means waiting all over again. To overcome this I just added a simple try-catch around the rating function that if the bot failed to rate a title it would just skip it and write the name of the title it couldn't rate to a text file.


# Continued development
This was just a project I build in an evening because I wasn't happy with the recommendations Netflix was giving me. There are lots of places this script can be improved so feel free to open a PR if you feel you can improve it!
