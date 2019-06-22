var version = "v1.0.1";
var lastViewRelease = "";

$(function() {
    checkVersion(version);

    $("#versionText").on('click', function() {
        chrome.tabs.create({ url: "https://github.com/dang113108/JIRA-Tracker/tree/master" });
    });

    $("#release-tab").on('click', function() {
        $("#versionModalTitle").text("Your version: " + version)
        $("#modal-body").load("../RELEASE.html");
        $("#versionModal").modal('show');
    });
});

function checkVersion(appVer) {
    $.ajax({
        type: "GET",
        dataType: "json",
        url: "https://api.github.com/repos/dang113108/JIRA-Tracker/branches/master",
        success: function(msg) {
            masterVer = msg['commit']['commit']['message'];
            if (appVer != masterVer) {
                $("#versionText").text("NEW VERSION");
                $("#versionText").addClass("text-light bg-danger");
            }
        },
        error: function(e1, e2, e3) {
            console.log("Get master version error: " + e);
        }
    });
}


function getTodayDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();

    return yyyy + "-" + mm + "-" + dd;
}