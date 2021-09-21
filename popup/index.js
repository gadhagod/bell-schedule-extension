var req = new XMLHttpRequest();
let time = new Date();
var header = document.getElementById("header");
var scheduleTable = document.getElementById("schedule");

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
    ${parseTime(period.start)} - ${parseTime(period.end)}</center>`;

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