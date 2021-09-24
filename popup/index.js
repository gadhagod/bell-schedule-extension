const appDetails = chrome.app.getDetails();
const repo = "gadhagod/bell-schedule-extension"

const req = new XMLHttpRequest();
const time = new Date();

const header = document.getElementById("header");
const scheduleTable = document.getElementById("schedule");
const settings = document.getElementById("settings");
const settingsForm = document.getElementById("settingsForm");
const submitSettingsButton = document.getElementById("submitSettingsButton");
const settingsBackButton = document.getElementById("settingsBackButton");
const newReleaseBackButton = document.getElementById("newReleaseBackButton");
const newReleaseButton = document.getElementById("newReleaseButton");
const newReleaseText = document.getElementById("newReleaseText");
const footer = document.getElementById("footer");

/**
 * Checks if the version of the installed extension is that of the 
 * latest release. If not, prompt the user to install the new version.
 */
function checkVersioning() {
    let url = `https://api.github.com/repos/${repo}/releases/latest`; // GitHub releases API url
    req.onreadystatechange = function() {
        if(this.readyState === 4 && this.status === 200) { // if the request to GitHub's API is successful
            let latestRelease = JSON.parse(this.responseText); // parse the response as an object
            if (latestRelease.name !== appDetails.version) { // if the installed extension's version is not that of the latest release
                newReleaseButton.style.display = "block"; // show the alert button in the settings screen
            }
        }
    };
    // send request
    req.open("GET", url, true);
    req.send();
}

/**
 * Replaces table items with parsed data from API request.
 */
function loadSchedule() {
    scheduleTable.innerHTML = ""; // replace old schedule
    chrome.storage.local.get(["periodNames"], function(res) { // get period names
        let periodNames = res.periodNames;
        let url = `https://bell.dev.harker.org/api/schedule?year=${time.getFullYear()}&month=${time.getMonth()+1}&day=${time.getDate()}`; // url to be requested to

        req.onreadystatechange = function() {
            if (this.readyState === 4) { // if response recieved
                if (this.status === 200) { // if request is successful
                    let res = JSON.parse(this.responseText); // convert response text to object
    
                    header.innerHTML = `Today's Schedule: ${res.code}`; // set header of page
    
                    res.schedule.forEach(period => { // for each period in the API response
                        let tr = document.createElement("tr"); // create empty table row
                        let td = document.createElement("td"); // create empty table data
    
                        // set the table data to custom period name or API's default period name 
                        // followed by times
                        td.innerHTML = `<center><b>${ periodNames[period.name] ?? period.name }</b>
            ${parseTime(period.start)} - ${parseTime(period.end)}</center>`;
                        if(periodStrings.includes(period.name)) { // if it's not a period (e.g. "lunch")
                            td.setAttribute("class", "nonPeriod"); // set `class` to `nonPeriod` for seperate styling
                        }
    
                        tr.appendChild(td); // add the table data to the row
                        scheduleTable.appendChild(tr); // add the row to the table
                    });
                } else if (this.status === 404) { // if no schedule for the day
                    document.write("No schedule for today"); // tell the user by writing to screen
                } else { // if another kind of error occurred
                    document.write("An error occured"); // tell the user by writing to screen
                }
            }
        };
        // send request
        req.open("GET", url, true);
        req.send();
    });
}

/**
 * Changes the popup to the schedule screen by hiding and showing
 * elements and changing popup size, and then loads the schedule with
 * `loadSchedule()`.
 */
function setToScheduleScreen() {
    document.body.style.width = "250px"
    scheduleTable.style.display = "";
    settings.style.display = "block";
    settingsForm.style.display = "none";
    settingsBackButton.style.display = "none";
    newReleaseButton.style.display = "none";
    newReleaseText.style.display = "none";
    newReleaseBackButton.style.display = "none";
    footer.style.display = "none";

    loadSchedule();
}

/**
 * Changes the popup to the settings screen by hiding and showing elements 
 * and changing popup size. If the extension's version is not up-to-date,
 * it shows an alert button on the top right of the settings screen
 * with `checkVersioning()`.
 */
function setToSettingsScreen() {
    document.body.style.width = "210px"
    scheduleTable.style.display = "none";
    settings.style.display = "none";
    newReleaseText.style.display = "none";
    settingsForm.style.display = "block";
    settingsBackButton.style.display = "block";
    header.innerHTML = "Settings";
    newReleaseBackButton.style.display = "none";
    footer.style.display = "block";

    checkVersioning();
}

/**
 * Changes the popup to the 'new version' page, by hiding and showing
 * elements and changing popup size. This screen contains information 
 * about the new release.
 */
function setToNewVersionScreen() {
    document.body.style.width = "300px";
    scheduleTable.style.display = "none";
    settings.style.display = "none";
    settingsForm.style.display = "none";
    newReleaseText.style.display = "block";
    newReleaseBackButton.style.display = "block";
    settingsBackButton.style.display = "none";
    newReleaseButton.style.display = "none";
    header.innerHTML = "New Version Available";

    let url = `https://api.github.com/repos/${repo}/releases/latest`; // GitHub releases API url
    req.onreadystatechange = function() {
        if(this.readyState === 4 && this.status === 200) { // if the request to GitHub's API is successful
            let latestRelease = JSON.parse(this.responseText); // parse the response text to an object
            newReleaseText.innerHTML = `A new version of the bell schedule extension is available. <br><br>
<u><sub>Published on ${parseDate(latestRelease.published_at)}</sub></u><br>
<b>v${latestRelease.name} notes: <br>
${latestRelease.body}</b> <br><br>
Please remove this extension that re-install from <b><a href="https://github.com/${repo}/releases/latest" target="_blank">here</a></b>. <br><br>
<small>NOTE: Updating extensions is highly recommended, as new features and fixes are implimemented.</small>`; // Tell the user info on the new version
        }
    };
    // send request
    req.open("GET", url, true);
    req.send();
}

/**
 * Converts an ISO time string to the 12 hour clock.
 * @param {string} ISOTime Time string to be converted
 * @return {string} Converted string
 */
function parseTime(ISOTime) {
    let str = ISOTime.substring(11, 16);
    if (str.substring(0, 1) === "0"){
        str = str.substring(1);
    }
    if (parseInt(str.substring(0, 2)) > 12) {
        str = str.replace(str.substring(0, 2), (parseInt(str.substring(0, 2)) - 12).toString());
    }
    return str;
}

/**
 * Converts an ISO date time string to YYYY-MM-DD format.
 */
 function parseDate(ISODateTime) {
    return ISODateTime.substring(0, 10)
}

// create an array of period names to be used throughout the program
var periodStrings = []; // initialize array
for(i = 1; i <= 7; i++) {
    periodStrings[i-1] = `P${i}`; // set the element of periodStrings to the period string
}

chrome.storage.local.get(["periodNames"], function(res) { // get period names from storage
    let periodNames = res.periodNames;
    if(!periodNames) { // if period names are not in storage (probably the first time opening the extension)
        chrome.storage.local.set({ // store the period names as nulls
            periodNames: {
                P1: null,
                P2: null,
                P3: null,
                P4: null,
                P5: null,
                P6: null,
                P7: null
            }
        })
    }

    periodStrings.forEach(function(periodNumber) { // for each period
        let customPeriodNameBox = document.getElementById(periodNumber); // get the period-corresponding textbox where custom period names are input
        customPeriodNameBox.setAttribute("placeholder", periodNames[periodNumber] ?? ""); // set the placeholder to the stored custom period name, if any

        let resetButton = document.getElementById(`${periodNumber}ResetButton`); // get the period-corresponding custom period name reset button
        resetButton.addEventListener("click", function() { // when the period's custom period 'reset' button is pressed
            document.getElementById(periodNumber).value = ""; // clear custom period text box
            document.getElementById(periodNumber).setAttribute("placeholder", ""); // clear the custom period box's placeholder
            periodNames[periodNumber] = null; // set the local stored period name to null
            chrome.storage.local.set({ periodNames: periodNames }); // push the local period names to storage
        })
    })
})

submitSettingsButton.addEventListener("click", function() { // when the 'save' button is pressed in the settings screen
    chrome.storage.local.get(["periodNames"], function(res) { // retrieve the custom period names from storage
        let periodNames = res.periodNames;
        periodStrings.forEach(function(periodNumber) { // for each period
            let setClass = document.getElementById(periodNumber).value; // get value of the period's custom name textbox
            if(setClass) { // if a value is in the textbox (meaning the user wants to set a custom period name(s))
                periodNames[periodNumber] = document.getElementById(periodNumber).value; // update the local custom period names to contain the new name(s)
                chrome.storage.local.set({ periodNames: periodNames }); // store the new period name(s)
            }
        })
        setToScheduleScreen(); // return to the schedule screen
    })
});

newReleaseButton.addEventListener("click", setToNewVersionScreen); // when the 'new release' button (from the settings screen) is pressed, change to the 'new release' screen
settings.addEventListener("click", setToSettingsScreen); // when the settings button is pressed, change to the settings screen
settingsBackButton.addEventListener("click", setToScheduleScreen); // when the back button (from the settings screen) is pressed, change to the schedule screen
newReleaseBackButton.addEventListener("click", setToSettingsScreen);

setToScheduleScreen(); // start with the schedule screen activated