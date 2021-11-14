const markdownConverter = new showdown.Converter();
const req = new XMLHttpRequest();

function versionChange() {
    window.location.replace(`${window.location.origin}/${window.location.pathname.split("/").slice(1, -2) || ""}/${document.getElementById("versionSelect").value}`);
}

req.onreadystatechange = function() {
    if(this.readyState === 4 && this.status === 200) {
        let releases = JSON.parse(this.responseText);
        let latestRelease = releases[0];
        
        document.getElementsByClassName("app-name")[0].innerHTML = "";
        document.getElementsByClassName("app-name")[0].appendChild((function() {
            let versionSelect = document.createElement("select");
            versionSelect.setAttribute("id", "versionSelect");
            versionSelect.setAttribute("class", "form-select-sm");
            versionSelect.setAttribute("onchange", "versionChange()");
            for(let i = 0; i < releases.length; i++) {
                if(parseInt(releases[i].tag_name.slice(0, 1)) >= 3 && releases[i].tag_name != "3.0.0") {
                    let option = document.createElement("option");
                    option.innerHTML = `${releases[i].tag_name}`;
                    versionSelect.appendChild(option);
                }
            }
            versionSelect.value = window.location.pathname.split("/").slice(-2)[0] || latestRelease.tag_name;
            return versionSelect;
        })());
    }
};
req.open("GET", "https://api.github.com/repos/gadhagod/bell-schedule-extension/releases", true);
req.send();
