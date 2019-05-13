var version = "v0.2.1";
var lastViewRelease = "";

$(function() {
    checkVersion(version);

    $("#versionText").on('click', function() {
        chrome.tabs.create({ url: "https://github.com/dang113108/JIRA-Tracker/tree/master" });
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
                try {
                    chrome.storage.sync.get("lastViewRelease", function(item) {
                        lastViewRelease = item["lastViewRelease"];
                        if (getTodayDate() != lastViewRelease) {
                            $("#versionModalTitle").text("New Version Update!")
                            $("#modal-body").load("../RELEASE.html");
                            $("#versionModal").modal('show');
                            chrome.storage.sync.set({ 'lastViewRelease': getTodayDate() }, function() {});
                        }
                    });
                } catch (e) {
                    console.log("Get last view release note error: " + e);
                }
            } else {
                try {
                    chrome.storage.sync.get("nowVersion", function(item) {
                        if (masterVer != item["nowVersion"]) {
                            $("#versionModalTitle").text("New Version Update!")
                            $("#modal-body").load("https://dang113108.github.io/JIRA-Tracker/RELEASE.html");
                            $("#versionModal").modal('show');
                            chrome.storage.sync.set({ 'nowVersion': masterVer }, function() {});
                        }
                    });
                } catch (e) {
                    console.log("Get now version error: " + e);
                }
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