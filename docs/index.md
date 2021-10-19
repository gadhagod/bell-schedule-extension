<script>
    const markdownConverter = new showdown.Converter();
    const req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if(this.readyState === 4 && this.status === 200) {
            let latestRelease = JSON.parse(this.responseText);
            document.getElementById("release_notes").innerHTML += `<br> <blockquote><b><a href="${latestRelease.html_url}">${latestRelease.tag_name}</a></b><br>${markdownConverter.makeHtml(latestRelease.body)}</blockquote>`;
        }
    };
    req.open("GET", "https://api.github.com/repos/gadhagod/bell-schedule-extension/releases/latest", true);
    req.send();
</script>

<center>
    <h1><b>Harker Bell Schedule Extension</b></h1>
    A chrome extension that displays the your school schedule.<br>
</center>

[](docs/features.md ':include')

# User Manual
[](docs/user-manual/installing-the-extension.md ':include')

[](docs/user-manual/custom-periods.md ':include')

[](docs/user-manual/other-schedules.md ':include')

[](docs/user-manual/schedule-variants.md ':include')

[](docs/user-manual/days-off.md ':include')

[](docs/user-manual/installing-a-new-version.md ':include')

# Versioning

Release notes can be found [here](https://github.com/gadhagod/bell-schedule-extension/releases). From here, you can also download a version's ZIP file.

<img src="docs/img/src-code.png" style="border: 5px solid #555" length="42%" width="42%">

<p id="release_notes">Latest release: </p>