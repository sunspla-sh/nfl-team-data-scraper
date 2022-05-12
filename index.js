const puppeteer = require('puppeteer');
const fs = require('fs');

const dateString = (new Date).toDateString().split(' ').slice(1).join('-').toLowerCase()
let teamUrlArray = [];
let currentTeamIndex = 0;


//Event handler function to scrape the NFL.com teams page for url subsections and build roster urls when the load event triggers
async function getTeamUrls(page){
  teamUrlArray = await page.$$eval('.nfl-o-cta--primary:first-of-type', linkElementArray => {
    return linkElementArray.map(linkElement => {
      let href = linkElement.getAttribute('href');
      if(href[href.length - 1] === '/'){
        href += 'roster';
      } else {
        href += '/roster'
      }
      return href;
    })
  });

  console.log('Found team urls:');
  console.log(teamUrlArray);

  page.emit('foundTeamArray');

}

/**
 * - Parse the team name and player data from NFL.com roster pages when the load event triggers
 * - Write the player data to the team's json file
 * - After writing, navigate to the next team roster page to trigger the next parsing with an on load event
 * - If there are no more urls to parse, invoke the browser.close() method to shut down Puppeteer
 */
async function getTeamJson(page, browser){
    
    const teamName = await page.$eval('.nfl-c-team-header__title', el => el.textContent.toLowerCase());
    console.log(`${currentTeamIndex + 1} - Fetching data for team - ${teamName.toUpperCase()}`);

    const playerArray = [];

    const columnDataArray = await page.$$eval(`table[summary="Roster"] > thead > tr > th`, thElementArray => thElementArray.map(thElement => thElement.textContent.toLowerCase()));

    const totalPlayers = await page.$$eval('table[summary="Roster"] > tbody > tr', trElementArray => trElementArray.length);

    const promiseArray = [];

    for(let count = 1; count < totalPlayers; count++){
      promiseArray.push(page.$$eval(`table[summary="Roster"] > tbody > tr:nth-of-type(${count}) > td`, tdElementArray => {
        return tdElementArray.map(tdElement => tdElement.textContent);
      }));
    }

    const playerStatsArray = await Promise.all(promiseArray);

    playerStatsArray.forEach(player => {
      const playerObj = {};
      player.forEach((stat, index) => {
        playerObj[columnDataArray[index]] = stat === '' ? null : stat;
      });
      playerObj.team = teamName;
      playerArray.push(playerObj);
    })

    const writeData = JSON.stringify(playerArray);

    const teamNameForFile = teamName.split(' ').join('-');

    fs.writeFileSync(`team-data-${dateString}/${teamNameForFile}.json`, writeData);

    currentTeamIndex += 1;

    if(currentTeamIndex >= teamUrlArray.length){
      console.log(`${currentTeamIndex} - ${teamName.length} players successfully parsed from page.`);
      console.log(`${currentTeamIndex} - Finished generating ${teamName.toUpperCase()} json file.`);
      console.log(`FINISHED - No more teams in the array.`);
      await browser.close();
    } else {
      const waitRandomSeconds = Math.floor(Math.random() * 31);
      console.log(`${currentTeamIndex} - ${teamName.length} players successfully parsed from page.`);
      console.log(`${currentTeamIndex} - Finished generating ${teamName.toUpperCase()} json file.`);
      console.log(`${currentTeamIndex} - Waiting ${waitRandomSeconds} seconds before loading next team page...`);
      setTimeout(async () => {
        console.log(`${currentTeamIndex + 1} - Navigating to https://www.nfl.com${teamUrlArray[currentTeamIndex]}...`);
        await page.goto(`https://www.nfl.com${teamUrlArray[currentTeamIndex]}`);  
      }, waitRandomSeconds * 1000);
    }
    
    
}

/**
 * - Create a directory to hold the team json files
 * - Launch Puppeteer and listen for page load event
 * - After team page loads, event will trigger and parse team roster urls
 * - Listen for foundTeamArray event which will fire after team roster urls are parsed successfully
 * - After foundTeamArray event triggers, set another on load event to parse player data
 * - Navigate to team pages, with each navigation triggering the on load event to parse player data and afterwards navigating to the next page
 */
const main = async () => {
  
  fs.mkdirSync(`team-data-${dateString}`);
  console.log(`Created new directory for team json files: /team-data-${dateString}`);

  const browser = await puppeteer.launch();
  console.log('Puppeteer launched...');

  const page = await browser.newPage();
  console.log('Empty page loaded...');

  const getTeamUrlsFromPage = async () => await getTeamUrls(page);
  const getTeamJsonFromPage = async () => await getTeamJson(page, browser);

  page.once('load', getTeamUrlsFromPage);

  page.once('foundTeamArray', async () => {
    page.on('load', getTeamJsonFromPage);
    console.log(`${currentTeamIndex + 1} - Navigating to https://www.nfl.com${teamUrlArray[currentTeamIndex]}...`);
    await page.goto(`https://www.nfl.com${teamUrlArray[currentTeamIndex]}`);
  });
  
  console.log('Navigating to https://www.nfl.com/teams/ and parsing team urls...');
  await page.goto('https://www.nfl.com/teams/');
  
}

main();



