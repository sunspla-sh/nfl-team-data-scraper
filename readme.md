# NFL TEAM DATA SCRAPER

#### WARNING:
  
If NFL.com changes the structure of their website, it is highly likely that this scraper will no longer function correctly.  
  
It relies upon specific CSS selectors to accurately find the data within the team roster pages.

---

#### DESCRIPTION:

Exactly like it sounds. Old data is currently included in the `/team-data` folder.  

---

#### HOW TO USE:

To get newer, potentially updated data:
- Clone this git repository.
- Run the `npm install` command to download all necessary node modules.
- Run `node index.js` and the scraper will begin pulling data from the nfl.com website
- Scraper will politely wait between 0 to 30 seconds before loading and scraping each team page
- One json file per team will be outputted in a `/team-data-${yourCurrentDate}` folder
- Each json file contains an array of objects representing players with the following keys `player no pos status height weight experience college team`
- If the scraper did not find data for a given key, the associated value will be `null`
- Finally, a `teams.json` file containing all teams and players will be outputted in the `/team-data-${yourCurrentDate}` folder



Sample Player Object:  
```json
{ 
  "player": "Zach Allen",
  "no":"94",
  "pos":"DE",
  "status":"ACT",
  "height":"77",
  "weight":"285",
  "experience":"4",
  "college":"Boston College",
  "team":"arizona cardinals"
}
```  

---

Technologies used for this project include the following:

![List of technologies](tech.png "List of Technologies")
   




