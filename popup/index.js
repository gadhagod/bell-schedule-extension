var req = new XMLHttpRequest();
let time = new Date();
var header = document.getElementById("header");
var scheduleTable = document.getElementById("schedule");

function convertISO(ISOTime) {
    return ISOTime.substring(11, 16);
}

let url = `https://bell.dev.harker.org/api/schedule?year=${time.getFullYear()}&month=${time.getMonth()+1}&day=${time.getDate()}`

req.onreadystatechange = function() {
    if (this.readyState === 4 ) {
        if (this.status === 200) {
            let res = JSON.parse(this.responseText);

            header.innerHTML = `Today's Schedule: ${res.code}`;

            res.schedule.forEach(period => {
                let tr = document.createElement("tr");
                let td = document.createElement("td");

                td.innerHTML = `<center><b>${period.name}</b>
    ${convertISO(period.start)} - ${convertISO(period.end)}</center>`;

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