const appDetails = chrome.app.getDetails();
const repo = "gadhagod/bell-schedule-extension";

const req = new XMLHttpRequest();
const time = new Date();
const markdownConverter = new showdown.Converter();

const header = document.getElementById("header");
const scheduleTable = document.getElementById("schedule");
const settings = document.getElementById("settings");
const settingsForm = document.getElementById("settingsForm");
const submitSettingsButton = document.getElementById("submitSettingsButton");
const settingsBackButton = document.getElementById("settingsBackButton");
const lunchBackButton = document.getElementById("lunchBackButton");
const newReleaseBackButton = document.getElementById("newReleaseBackButton");
const newReleaseButton = document.getElementById("newReleaseButton");
const newReleaseText = document.getElementById("newReleaseText");
const noWifiImage = document.getElementById("noWifiImage");
const noWifiText = document.getElementById("noWifiText");
const footer = document.getElementById("footer");
const loader = document.getElementById("loader");
const lunchTable = document.getElementById("lunch");
const copyrightYear = document.getElementById("copyrightYear");

/**
 * Returns a copy of `emptyPeriodNames`
 * @returns {{P1: null, P2: null, P3: null, P4: null, P5: null, P6: null, P7: null}}
 */
function getEmptyPeriodNames() {
    return {
        P1: null,
        P2: null,
        P3: null,
        P4: null,
        P5: null,
        P6: null,
        P7: null
    };
}

/**
 * Converts a given string to title case
 * @param {string} str String to be converted
 * @return {string}
 */
function toTitleCase(str) {
    return !str ? null : str.toLowerCase().split(" ").map(function(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(" ");
}

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
 * Replaces scheduleTable items with parsed data from API request.
 */
function loadSchedule() {
    scheduleTable.innerHTML = ""; // cleare old schedule
    header.innerHTML = `${parseWeekday(time.getDay())} ${time.getMonth()+1}/${time.getDate()}` + (time.getFullYear() != new Date().getFullYear() ? `/${time.getFullYear() - 2000}` : ""); // set the header to contain the weekday, day of month, month, and year if not the current
    chrome.storage.local.get(["periodNames"], function(res) { // get period names
        let periodNames = res.periodNames ?? getEmptyPeriodNames(); // if no custom period names are stored, assign them nulls
        let url = `https://bell.dev.harker.org/api/schedule?year=${time.getFullYear()}&month=${time.getMonth()+1}&day=${time.getDate()}`; // url to be requested to

        req.onreadystatechange = function() {
            if (this.readyState === 4) { // if response recieved
                if (this.status === 200) { // if request is successful
                    (function(apiRes){
                        let res = JSON.parse(apiRes.responseText); // convert response text to object

                        if(!res.schedule[0] || res.schedule[0].name === "No School") {
                            scheduleTable.setAttribute("style", "border:none;"); // remove border from table
                            scheduleTable.innerHTML = "No school!"; // set the schedule table's HTML
                            return;
                        }
        
                        header.innerHTML += `<br><small><span style="color:green">${(toTitleCase(res.variant) ?? "") + " "}</span>${res.code} Schedule</small>`; // add letter to header
        
                        res.schedule.forEach(period => { // for each period in the API response
                            let periodIsFirstLunch = period.name.toLowerCase().includes("lunch") && !scheduleTable.innerHTML.includes("lunch"); // see if current period is the first occurance of lunch today
                            let tr = document.createElement("tr"); // create empty table row
                            let td = document.createElement("td"); // create empty table data

                            // set the table data to custom period name or API's default period name followed by times
                            td.innerHTML = `<center><b>${periodNames[period.name] ?? period.name}</b>${
                                periodIsFirstLunch ? " <a class='lunchButton' href='#'>&#x2197;</a>" : ""
                            } ${parseTime(period.start)} - ${parseTime(period.end)}</center>`; // if the period is lunch, add a link
                            if(periodStrings.includes(period.name)) { // if it's not a period (e.g. "lunch")
                                td.setAttribute("class", "nonPeriod"); // set `class` to `nonPeriod` for seperate styling
                            }

                            tr.appendChild(td); // add the table data to the row
                            scheduleTable.appendChild(tr); // add the row to the table

                            if(periodIsFirstLunch) { // if this is the first lunch in the day
                                document.querySelector(".lunchButton").addEventListener("click", setToLunchScreen); // when the link is clicked open the lunch view
                            }
                        });
                    })(this);
                } else if (this.status === 404) { // if no schedule for the day
                    scheduleTable.setAttribute("style", "border:none;"); // remove border from table
                    scheduleTable.innerHTML = "No school!"; // set the schedule table's HTML
                } else { // if another kind of error occurred
                    if (!this.status) { // if the request was cancelled
                        header.innerHTML = ""; // clear the header
                        noWifiImage.style.display = "block"; // show the "no wifi" image
                        noWifiText.innerHTML = "No internet connection"; // show the "no wifi" text
                        settings.style.display = "none"; // hide the settings button
                        scheduleTable.parentNode.removeChild(scheduleTable); // remove the schedule table
                    } else {
                        document.write("An error occured"); // tell the user by writing to screen
                    }
                }
                settings.addEventListener("click", setToSettingsScreen); // when the settings button is pressed, change to the settings screen
                loader.style.display = "none"; // hide the loader
            }
        };
        // send request
        req.open("GET", url, true);
        req.send();
    });
}

/**
 * Replaces lunchTable items with parsed data from API request.
 */
 function loadLunch() {
    lunchTable.innerHTML = ""; // clear old lunch table
    let url = `https://bell.dev.harker.org/api/lunchmenu?year=${time.getFullYear()}&month=${time.getMonth()+1}&day=${time.getDate()}`;
    req.onreadystatechange = function() {
        if (this.readyState === 4) { // if response recieved
            if (this.status === 200) { // if request is successful
                lunch = JSON.parse(this.responseText).lunch; // parse JSON and get lunch key
                lunch.forEach((item) => { // for each lunch location
                    lunchTable.appendChild( // add row to lunchTable
                        (() => {
                            let row = document.createElement("tr"); // create empty table row
                            let foodLocation = document.createElement("td"); // create empty td element
                            foodLocation.innerHTML = `<b><center>${item.place}</center></b>`; // set the td's text to the item place
                            let foodItem = document.createElement("td"); // create empty td element
                            foodItem.innerHTML = item.food; // set new td's text to item's dish

                            row.appendChild(foodLocation); // add food location
                            row.appendChild(foodItem); // add dish to the row
                            return row;
                        })()
                    );
                });
            } else if (this.status === 404) { // if no schedule for the day
                lunchTable.setAttribute("style", "border:none"); // remove border from table
                lunchTable.innerHTML = "Lunch menu unavailable today!"; // set the lunch table's HTML
            }
            loader.style.display = "none"; // hide loader
        }
    }
    req.open("GET", url, true);
    req.send();
}

/**
 * Changes the popup to the schedule screen by hiding and showing
 * elements and changing popup size, and then loads the schedule with
 * `loadSchedule()`.
 */
function setToScheduleScreen() {
    loader.style.display = "block";
    document.body.style.width = "220px";
    scheduleTable.style.display = "";
    settings.style.display = "block";
    settingsForm.style.display = "none";
    lunchTable.style.display = "none";
    settingsBackButton.style.display = "none";
    lunchBackButton.style.display = "none";
    newReleaseButton.style.display = "none";
    newReleaseText.style.display = "none";
    newReleaseBackButton.style.display = "none";
    footer.style.display = "none";
    header.innerHTML = "";
    scheduleTable.style.display = "";
    scheduleTable.setAttribute("style", ""); // add border to table
    loadSchedule();
}

function setToLunchScreen() {
    loader.style.display = "block";
    lunchTable.style.display = "block";
    lunchBackButton.style.display = "block";
    scheduleTable.style.display = "none";
    settings.style.display = "none";
    loadLunch();
}

/**
 * Changes the popup to the settings screen by hiding and showing elements 
 * and changing popup size. If the extension's version is not up-to-date,
 * it shows an alert button on the top right of the settings screen
 * with `checkVersioning()`.
 */
function setToSettingsScreen() {
    scheduleTable.style.display = "none";
    settings.style.display = "none";
    newReleaseText.style.display = "none";
    settingsForm.style.display = "block";
    settingsBackButton.style.display = "block";
    header.innerHTML = "Settings";
    newReleaseBackButton.style.display = "none";
    lunchBackButton.style.display = "none";
    footer.style.display = "block";
    checkVersioning();
}

/**
 * Changes the popup to the 'new version' page, by hiding and showing
 * elements and changing popup size. This screen contains information 
 * about the new release.
 */
function setToNewVersionScreen() {
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
            let latestReleaseNotes = markdownConverter.makeHtml(latestRelease.body); // convert the release notes from mardown to HTML
            newReleaseText.innerHTML = `A new version of the bell schedule extension is available. <br><br>
<u>Published on ${parseDate(latestRelease.published_at)}</u>
${latestReleaseNotes}
Please remove this extension and install <u>v${latestRelease.name}</u> from <a href="https://github.com/${repo}/releases/latest" target="_blank">here</a>. <br><br>
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
 * @param {string} ISODateTime
 * @return {string}
 */
function parseDate(ISODateTime) {
    return ISODateTime.substring(0, 10);
}

/**
 * Converts an int from 0 - 6 to the respective weekday, starting from Sunday representing 0
 * @param { 0 | 1 | 2 | 3 | 4 | 5 | 6} dayNumber
 * @returns {"Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"}
 */
function parseWeekday(dayNumber) {
    return ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"][dayNumber];
}

// create an array of period names to be used throughout the program
var periodStrings = []; // initialize period strings array
for(let i = 1; i <= 7; i++) {
    periodStrings[i-1] = `P${i}`; // set the element of periodStrings to the period string
}

chrome.storage.local.get(["periodNames"], function(res) { // get period names from storage
    let periodNames = res.periodNames;
    if(!periodNames) { // if period names are not in storage (probably the first time opening the extension)
        periodNames = getEmptyPeriodNames(); // if no custom period names are stored, assign them nulls
        chrome.storage.local.set(periodNames); // store the period names object
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
        });
    });
});

submitSettingsButton.addEventListener("click", function() { // when the 'save' button is pressed in the settings screen
    chrome.storage.local.get(["periodNames"], function(res) { // retrieve the custom period names from storage
        let periodNames = res.periodNames ?? getEmptyPeriodNames(); // if no custom period names are stored, assign them nulls
        periodStrings.forEach(function(periodNumber) { // for each period
            let setClass = document.getElementById(periodNumber).value; // get value of the period's custom name textbox
            if(setClass) { // if a value is in the textbox (meaning the user wants to set a custom period name(s))
                periodNames[periodNumber] = document.getElementById(periodNumber).value; // update the local custom period names to contain the new name(s)
                chrome.storage.local.set({ periodNames: periodNames }); // store the new period name(s)
            }
        });
        setToScheduleScreen(); // return to the schedule screen
    });
});

newReleaseButton.addEventListener("click", setToNewVersionScreen); // when the 'new release' button (from the settings screen) is pressed, change to the 'new release' screen
settingsBackButton.addEventListener("click", setToScheduleScreen); // when the back button (from the settings screen) is pressed, change to the schedule screen
lunchBackButton.addEventListener("click", setToScheduleScreen);
newReleaseBackButton.addEventListener("click", setToSettingsScreen); // when the back button from the new release screen is clicked, change to the settings screen

document.onkeydown = function(event) { // when any key is pressed
    if(event.keyCode === 39) { // if the key pressed is the right arrow
        time.setDate(time.getDate() + 1); // set the date one day forwards
    } else if (event.keyCode === 37) { // if the key pressed is the left arrow
        time.setDate(time.getDate() - 1); // set the date when day backwards
    } else if (event.keyCode === 40) { // if the key pressed is the down arrow
        time.setDate(time.getDate() + 7); // set the date seven days backwards
    } else if (event.keyCode === 38) { // if the key pressed is the up arrow
        time.setDate(time.getDate() - 7); // set the date seven days forwards
    } else { // if the key pressed is none of the arrow keys
        return; // exit the function
    }
    setToScheduleScreen(); // re-render the schedule screen
};

setToScheduleScreen(); // start with the schedule screen activated

copyrightYear.innerHTML = time.getFullYear(); // set copyright year