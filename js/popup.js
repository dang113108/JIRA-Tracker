var countSec = 0;
var isRecord = false;
var isPause = false;
var isStop = false;
var saveData = ['startTime', 'pauseTime', 'countSec', 'issue', 'timeSpent', 'comment', 'isRecord', 'isPause', 'isStop', 'account', 'password'];
var removeData = ['startTime', 'pauseTime', 'countSec', 'isRecord', 'isPause', 'isStop'];
var removeUIData = ['issue', 'timeSpent', 'comment']

$(function() {

    // chrome.storage.sync.clear(function() {});
    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="popover"]').popover();

    var select = $("#issue").selectize({
        valueField: 'title',
        labelField: 'title',
        searchField: 'title',
        create: false
    });
    var selectize = select[0].selectize;
    $("#issue-selectized").on('keyup', function(key) {
        if (key.originalEvent.keyCode != 16) {
            $.ajax({
                type: "POST",
                dataType: "json",
                url: "https://jira.exosite.com/rest/auth/1/session",
                contentType: 'application/json',
                data: '{"username": "' + account + '","password": "' + password + '"}',
                success: function(msg) {
                    $.ajax({
                        type: "GET",
                        beforeSend: function(request) {
                            request.setRequestHeader("Access-Control-Allow-Origin", "https://jira.exosite.com");
                            request.setRequestHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                            request.setRequestHeader("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept, Authorization");
                        },
                        url: "https://jira.exosite.com/rest/quicktimesheet-rest/1/calendar/search-issues-picker?q=" + $("#issue-selectized").val(),
                        success: function(msg) {
                            selectize.clearOptions();
                            for (ticket in msg) {
                                selectize.addOption({
                                    title: msg[ticket]['issueKey'] + " - " + msg[ticket]['issueSummary']
                                });
                            }
                            selectize.refreshOptions(true);
                        },
                        error: function(e1, e2, e3) {
                            console.log("Search error: ");
                            console.log(e1);
                        }
                    });
                },
                error: function(e1, e2, e3) {
                    console.log("Auth error: ");
                    console.log(e1);
                }
            });
        }
    });

    chrome.storage.sync.get(null, function(items) {
        for (var dataName in saveData) {
            if (typeof(items[saveData[dataName]]) !== 'undefined') {
                window[saveData[dataName]] = items[saveData[dataName]];
            }
        }
        if (isRecord) {
            var elapsed = getTimestamp() - startTime;
            countSec += elapsed;
            secondConvertAndSetTime(countSec);
            chrome.storage.sync.set({ 'countSec': countSec }, function() {});
            chrome.storage.sync.set({ 'startTime': getTimestamp() }, function() {});
            startRecord()
            $("#startRecord").addClass('iconButtonDisable');
            $("#pauseRecord").removeClass('iconButtonDisable');
            $("#stopRecord").removeClass('iconButtonDisable');
        }
        if (isPause) {
            var elapsed = pauseTime - startTime;
            countSec += elapsed;
            chrome.storage.sync.set({ 'countSec': countSec }, function() {});
            chrome.storage.sync.set({ 'startTime': 0 }, function() {});
            chrome.storage.sync.set({ 'pauseTime': 0 }, function() {});
            secondConvertAndSetTime(countSec);
            $("#startRecord").removeClass('iconButtonDisable');
            $("#pauseRecord").addClass('iconButtonDisable');
            $("#stopRecord").removeClass('iconButtonDisable');
        }
        if (issue != '[object HTMLSelectElement]' && issue != '') {
            selectize.addOption({
                title: issue
            });
            selectize.setValue(issue);
        }
        if (timeSpent != '[object HTMLInputElement]') {
            $("#timeSpent").val(timeSpent);
        }

        if (comment != '[object HTMLTextAreaElement]') {
            $("#comment").val(comment);
        }
    });

    selectize.on('change', function() {
        setTimeout(function() {
            chrome.storage.sync.set({ 'issue': selectize.getValue() }, function() {});
        }, 500);
    });

    $("#timeSpent").on('change', function() {
        chrome.storage.sync.set({ 'timeSpent': $("#timeSpent").val() }, function() {});
    });

    $("#comment").on('change', function() {
        chrome.storage.sync.set({ 'comment': $("#comment").val() }, function() {});
    });

    $("#startRecord").on('click', function() {
        if (isRecord) {
            return
        }
        if (isPause) {
            isPause = false;
            chrome.storage.sync.set({ 'isPause': false }, function() {});
            chrome.storage.sync.get('startTime', function(startTime) {
                chrome.storage.sync.get('pauseTime', function(pauseTime) {
                    var elapsed = pauseTime['pauseTime'] - startTime['startTime'];
                    countSec += elapsed;
                    chrome.storage.sync.set({ 'countSec': countSec }, function() {});
                });
            });
        }
        chrome.storage.sync.set({ 'startTime': getTimestamp() }, function() {});
        startRecord();
        isRecord = true;
        $("#startRecord").addClass('iconButtonDisable');
        $("#pauseRecord").removeClass('iconButtonDisable');
        $("#stopRecord").removeClass('iconButtonDisable');
        chrome.storage.sync.set({ 'isRecord': true }, function() {});
    });

    $("#pauseRecord").on('click', function() {
        if (!isRecord) {
            return
        }
        isRecord = false;
        isPause = true;
        $("#startRecord").removeClass('iconButtonDisable');
        $("#pauseRecord").addClass('iconButtonDisable');
        $("#stopRecord").removeClass('iconButtonDisable');
        chrome.storage.sync.set({ 'pauseTime': getTimestamp() }, function() {});
        chrome.storage.sync.set({ 'isRecord': false }, function() {});
        chrome.storage.sync.set({ 'isPause': true }, function() {});
    });

    $("#stopRecord").on('click', function() {
        if (!isRecord && !isPause) {
            return
        }
        isRecord = false;
        isStop = true;
        $("#startRecord").removeClass('iconButtonDisable');
        $("#pauseRecord").addClass('iconButtonDisable');
        $("#stopRecord").addClass('iconButtonDisable');
        chrome.storage.sync.set({ 'isRecord': false }, function() {});
        chrome.storage.sync.set({ 'isStop': true }, function() {});
    });

    $("#profile-tab").on('click', function() {
        $('#pills-profile').tab('show');
        $('#pills-home').removeClass('active show');
        chrome.storage.sync.remove(['account', 'password'], function() {});
    });

    $("#logWork").on('submit', function(e) {
        e.preventDefault();

        $("#submitWork").attr('disabled', true);
        $("#loadingSave").show();
        $("#normalSave").hide();

        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();

        if (dd < 10) {
            dd = '0' + dd;
        }
        if (mm < 10) {
            mm = '0' + mm;
        }
        var today = yyyy + "-" + mm + "-" + dd + "T08: 00: 00.000+0000";

        issue = selectize.getValue();
        console.log(issue);
        issue = issue.split(" - ");
        issue = issue[0];
        timeSpent = $("#timeSpent").val();
        comment = $("#comment").val();

        timeSpent = timeSpent.substring(0, timeSpent.length - 1);
        timeSpent = timeSpent.split("h");
        if (timeSpent.length == 2) {
            totalTime = timeSpent[0] * 3600 + timeSpent[1] * 60;
        } else {
            totalTime = timeSpent[0] * 60;
        }

        workData = '{"comment":"' + comment + '","started":"' + today + '","timeSpentSeconds":"' + totalTime + '"}';

        $.ajax({
            type: "POST",
            dataType: "json",
            url: "https://jira.exosite.com/rest/auth/1/session",
            contentType: 'application/json',
            data: '{"username": "' + account + '","password": "' + password + '"}',
            success: function(msg) {
                $.ajax({
                    type: "POST",
                    beforeSend: function(request) {
                        request.setRequestHeader("Access-Control-Allow-Origin", "https://jira.exosite.com");
                        request.setRequestHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                        request.setRequestHeader("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept, Authorization");
                    },
                    dataType: "json",
                    url: "https://jira.exosite.com/rest/api/2/issue/" + issue + "/worklog/",
                    contentType: 'application/json; charset=UTF-8',
                    data: workData,
                    success: function(msg) {
                        $("#loadingSave").hide();
                        $("#normalSave").show();
                        $("#submitWork").attr('disabled', false);
                        for (var dataName in removeUIData) {
                            chrome.storage.sync.remove(removeUIData[dataName], function(items) {});
                        }
                        selectize.setValue("");
                        selectize.clearOptions();
                        $("#timeSpent").val("");
                        $("#comment").val("");
                        $("#hour").text("0");
                        $("#minute").text("0");
                        $("#second").text("0");
                    },
                    error: function(e1, e2, e3) {
                        $("#submitWork").attr('disabled', false);
                        $("#loadingSave").hide();
                        $("#errorSave").show();
                        $("#submitWork").addClass("btn-danger");
                        $("#submitWork").removeClass("btn-primary");
                        console.log("Log error: ");
                        console.log(e1);
                    }
                });
            },
            error: function(e1, e2, e3) {
                $("#submitWork").attr('disabled', false);
                $("#loadingSave").hide();
                $("#errorSave").show();
                $("#submitWork").addClass("btn-danger");
                $("#submitWork").removeClass("btn-primary");
                console.log("Auth error: ");
                console.log(e1);
            }
        });
    });

});

function getTimestamp() {
    var dateTime = Date.now();
    var timestamp = Math.floor(dateTime / 1000);
    return timestamp;
}

function secondConvertAndSetTime(second) {
    seconds = second % 60;
    if (second >= 3600) {
        hour = Math.floor(second / 3600);
        minute = Math.floor((second - (3600 * hour)) / 60);
        $("#timeSpent").val(hour + "h " + minute + "m");
        $("#hour").text(hour);
        $("#minute").text(minute);
        $("#second").text(seconds);
    } else if (second >= 60) {
        minute = Math.floor(second / 60);
        $("#timeSpent").val(minute + "m");
        $("#minute").text(minute);
        $("#second").text(seconds);
    } else {
        $("#second").text(seconds);
    }
}

function startRecord() {
    var intervalInt = setInterval(function() {
        if (isStop) {
            clearInterval(intervalInt);
            isStop = false;
            secondConvertAndSetTime(countSec + 30);
            countSec = 0;
            $("#hour").text(0);
            $("#minute").text(0);
            $("#second").text(0);
            for (var dataName in removeData) {
                chrome.storage.sync.remove(removeData[dataName], function(items) {});
            }
            chrome.storage.sync.set({ 'isStop': false }, function() {});
        } else if (isPause) {
            clearInterval(intervalInt);
        } else {
            countSec += 1;
            secondConvertAndSetTime(countSec);
        }
    }, 1000);
}