var req = new XMLHttpRequest();
let time = new Date();
var header = document.getElementById("header");
var scheduleTable = document.getElementById("schedule");
var settings = document.getElementById("settings");
var settingsForm = document.getElementById("settingsForm");
var submitSettingsButton = document.getElementById("submitSettingsButton");
var backButton = document.getElementById("back");

function loadSchedule() {
    scheduleTable.innerHTML = "";
    chrome.storage.local.get(["periodNames"], function(res) {
        let periodNames = res.periodNames;
        let url = `https://bell.dev.harker.org/api/schedule?year=${time.getFullYear()}&month=${time.getMonth()+1}&day=${time.getDate()}`

        req.onreadystatechange = function() {
            if (this.readyState === 4 ) {
                if (this.status === 200) {
                    let res = JSON.parse(this.responseText);
    
                    header.innerHTML = `Today's Schedule: ${res.code}`;
    
                    res.schedule.forEach(period => {
                        let tr = document.createElement("tr");
                        let td = document.createElement("td");
    
                        td.innerHTML = `<center><b>${ periodNames[period.name] ?? period.name }</b>
            ${parseTime(period.start)} - ${parseTime(period.end)}</center>`;
                        if(["P1", "P2", "P3", "P4", "P5", "P6", "P7"].includes(period.name)) {
                            td.setAttribute("class", "nonPeriod");
                        }
    
                        tr.appendChild(td);
    
                        scheduleTable.appendChild(tr);
                    });
                } else if (this.status === 404) {
                    document.write("No schedule for today");
                } else {
                    document.write("An error occured");
                }
            }
        };
        req.open("GET", url, true);
        req.send();
    });
}

function setToScheduleScreen() {
    document.body.style.width = "250px"
    scheduleTable.style.display = "block";
    settings.style.display = "block";
    settingsForm.style.display = "none";
    backButton.style.display = "none";

    loadSchedule();
}

function setToSettingsScreen() {
    document.body.style.width = "210px"
    scheduleTable.style.display = "none";
    settings.style.display = "none";
    settingsForm.style.display = "block";
    backButton.style.display = "block";
    header.innerHTML = "Settings";
}

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

chrome.storage.local.get(["periodNames"], function(res) {
    let periodNames = res.periodNames;
    if(!periodNames) {
        chrome.storage.local.set({
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

    ["1", "2", "3", "4", "5", "6", "7"].forEach(function(periodNumber) {
        let customPeriodNameBox = document.getElementById(`P${periodNumber}`);
        customPeriodNameBox.setAttribute("placeholder", periodNames[`P${periodNumber}`] ?? "");

        let resetButton = document.getElementById(`P${periodNumber}ResetButton`);
        resetButton.addEventListener("click", function() {
            document.getElementById(`P${periodNumber}`).value = "";
            document.getElementById(`P${periodNumber}`).setAttribute("placeholder", "");
            periodNames[`P${periodNumber}`] = null;
            chrome.storage.local.set(
                { periodNames: periodNames }
            );
        })
    })
})

settings.addEventListener("click", function() {
    setToSettingsScreen();
});

submitSettingsButton.addEventListener("click", function() {
    chrome.storage.local.get(["periodNames"], function(res) {
        let periodNames = res.periodNames;
        ["1", "2", "3", "4", "5", "6", "7"].forEach(function(periodNumber) {
            let setClass = document.getElementById(`P${periodNumber}`).value;
            if(setClass) {
                periodNames[`P${periodNumber}`] = document.getElementById(`P${periodNumber}`).value;
                chrome.storage.local.set(
                    { periodNames: periodNames }
                );
            }
        })
        setToScheduleScreen();
    })
});

backButton.addEventListener("click", function() {
    setToScheduleScreen();
})



loadSchedule();