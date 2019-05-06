var countSec = 0;
var isRecord = false;
var isPause = false;
var isStop = false;
var saveData = ['img', 'startTime', 'countSec', 'issue', 'timeSpent', 'comment', 'isRecord', 'isPause', 'isStop', 'account', 'password'];
var removeData = ['startTime', 'countSec', 'isRecord', 'isPause', 'isStop'];
var removeUIData = ['img', 'issue', 'timeSpent', 'comment'];

$(function() {
    // chrome.storage.sync.clear(function() {});
    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="popover"]').popover();

    var select = $("#issue").selectize({
        valueField: 'title',
        labelField: 'title',
        searchField: 'title',
        create: false,
        selectOnTab: true,
        optgroupField: 'class',
        optgroups: [
            { value: 'recentIssues', label: 'Recent Issues' }
        ],
        render: {
            item: function(item, escape) {
                return "<div><img class='ticketIcon' src='" + escape(item.img) + "'></img> <issue class='ticketText'>" + escape(item.title) + "</issue></div>";
            },
            option: function(item, escape) {
                return "<div><img class='ticketIcon' src='" + escape(item.img) + "'></img> <issue class='ticketText'>" + escape(item.title) + "</issue></div>";
            },
            optgroup_header: function(item, escape) {
                return '<div class="optgroup-header">' + escape(item.label) + '</div>';
            }
        }
    });
    var selectize = select[0].selectize;
    $("#issue").attr('max-height', '43px');

    $("#issue-selectized").on('focus', function() {
        if ($("#issue-selectized").val() != "") {
            return;
        }
        isTyping++;
        var typingNum = isTyping;
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
                    url: "https://jira.exosite.com/rest/quicktimesheet-rest/1/calendar/search-issues-picker?q=",
                    success: function(msg) {
                        selectize.clearOptions();
                        var optionArray = [];
                        $("#selectizeInput").removeClass("selectizeInputRed");
                        for (ticket in msg) {
                            optionArray.push({
                                class: "recentIssues",
                                img: "https://jira.exosite.com" + msg[ticket]['issueTypeIconUrl'],
                                title: msg[ticket]['issueKey'] + " - " + msg[ticket]['issueSummary']
                            });
                        }
                        if (isTyping == typingNum) {
                            selectize.addOption(optionArray);
                            selectize.refreshOptions(true);
                        }
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
    });

    $("#issue-selectized").on('keyup', function(key) {
        isTyping++;
        var typingNum = isTyping;
        if (key.originalEvent.keyCode) {
            var pressKeyCode = key.originalEvent.keyCode;
        } else {
            var pressKeyCode = false;
        }
        if (pressKeyCode == 9 || pressKeyCode == 27 || pressKeyCode == 13) {
            isTyping = 0;
            return;
        }
        if (pressKeyCode == 27 || pressKeyCode == 40 || pressKeyCode == 38 || pressKeyCode == 37 || pressKeyCode == 39) {
            return;
        }
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
                        var optionArray = [];
                        if (msg.length == 0) {
                            $("#selectizeInput").addClass("selectizeInputRed");
                        } else if ($("#issue-selectized").val() == "") {
                            $("#selectizeInput").removeClass("selectizeInputRed");
                            for (ticket in msg) {
                                optionArray.push({
                                    class: "recentIssues",
                                    img: "https://jira.exosite.com" + msg[ticket]['issueTypeIconUrl'],
                                    title: msg[ticket]['issueKey'] + " - " + msg[ticket]['issueSummary']
                                });
                            }
                        } else {
                            $("#selectizeInput").removeClass("selectizeInputRed");
                            for (ticket in msg) {
                                optionArray.push({
                                    class: "otherIssues",
                                    img: "https://jira.exosite.com" + msg[ticket]['issueTypeIconUrl'],
                                    title: msg[ticket]['issueKey'] + " - " + msg[ticket]['issueSummary']
                                });
                            }
                        }
                        if (isTyping == typingNum) {
                            selectize.addOption(optionArray);
                            selectize.refreshOptions(true);
                        }
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
            secondConvertAndSetTime(countSec, true);
            chrome.storage.sync.set({ 'countSec': countSec }, function() {});
            chrome.storage.sync.set({ 'startTime': getTimestamp() }, function() {});
            startRecord()
            $("#startRecord").addClass('iconButtonDisable');
            $("#pauseRecord").removeClass('iconButtonDisable');
            $("#stopRecord").removeClass('iconButtonDisable');
        }
        if (isPause) {
            secondConvertAndSetTime(countSec, true);
            $("#startRecord").removeClass('iconButtonDisable');
            $("#pauseRecord").addClass('iconButtonDisable');
            $("#stopRecord").removeClass('iconButtonDisable');
        }
        if (issue != '[object HTMLSelectElement]' && issue != '') {
            selectize.addOption({
                img: img,
                title: issue
            });
            selectize.setValue(issue);
        }
        if (timeSpent != '[object HTMLInputElement]' && !isRecord && !isPause) {
            $("#timeSpent").val(timeSpent);
            setTimeout(function() {
                $("#timeSpent").change();
            }, 1000);
        }

        if (comment != '[object HTMLTextAreaElement]') {
            $("#comment").val(comment);
        }
    });

    selectize.on('change', function() {
        setTimeout(function() {
            try {
                chrome.storage.sync.set({ 'issue': selectize.getValue() }, function() {});
                chrome.storage.sync.set({ 'img': selectize.getItem(selectize.getValue())[0]['children'][0]['currentSrc'] }, function() {});
                updateIssueWorkTime(selectize.getValue());
            } catch (e) {
                console.log("Set issue title and image error: " + e);
            }
        }, 500);
    });

    $("#timeSpent").on('change', function() {
        chrome.storage.sync.set({ 'timeSpent': $("#timeSpent").val() }, function() {});
    });

    $("#comment").on('change', function() {
        chrome.storage.sync.set({ 'comment': $("#comment").val() }, function() {});
    });

    $("#issueWorkTime").on("click", function() {
        chrome.tabs.create({ url: "https://jira.exosite.com/browse/" + getIssueNumber(selectize.getValue()) });
    });

    $("#startRecord").on('click', function() {
        if (isRecord) {
            return
        }
        if (isPause) {
            isPause = false;
            chrome.storage.sync.set({ 'isPause': false }, function() {});
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
        chrome.storage.sync.set({ 'countSec': countSec }, function() {});
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
        $("#errorSave").hide();

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

        issue = getIssueNumber(selectize.getValue());
        timeSpent = $("#timeSpent").val();
        comment = $("#comment").val();

        if (timeSpent.indexOf("h") != -1) {
            if (timeSpent.indexOf("m") != -1) {
                timeSpent = timeSpent.substring(0, timeSpent.length - 1);
            }
            timeSpent = timeSpent.split("h");
            if (timeSpent.length == 2) {
                totalTime = timeSpent[0] * 3600 + timeSpent[1] * 60;
            } else {
                totalTime = timeSpent[0] * 3600;
            }
        } else {
            timeSpent = timeSpent.substring(0, timeSpent.length - 1);
            totalTime = timeSpent * 60;
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
                        $("#loadTodayHour").show();
                        $("#toDay").css("visibility", "hidden");
                        $("#submitWork").attr('disabled', false);
                        $("#issueWorkTime").text("");
                        for (var dataName in removeUIData) {
                            chrome.storage.sync.remove(removeUIData[dataName], function(items) {});
                        }
                        $("#submitWork").addClass("btn-success");
                        $("#submitWork").removeClass("btn-danger");
                        $("#submitWork").removeClass("btn-primary");
                        setTimeout(function() {
                            $("#submitWork").removeClass("btn-success");
                            $("#submitWork").addClass("btn-primary");
                        }, 3000);
                        selectize.setValue("");
                        selectize.clearOptions();
                        $("#timeSpent").val("");
                        $("#timeSpent").change();
                        $("#comment").val("");
                        $("#hour").text("0");
                        $("#minute").text("0");
                        $("#second").text("0");
                        updateTodayWorkHour();
                    },
                    error: function(e1, e2, e3) {
                        $("#submitWork").attr('disabled', false);
                        $("#loadingSave").hide();
                        $("#errorSave").show();
                        $("#submitWork").addClass("btn-danger");
                        $("#submitWork").removeClass("btn-primary");
                        $("#submitWork").removeClass("btn-success");
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
    var timestamp = Math.round(dateTime / 1000);
    return timestamp;
}

function secondConvertAndSetTime(second, reopen = false) {
    seconds = second % 60;
    if (second >= 3600) {
        hour = Math.floor(second / 3600);
        minute = Math.floor((second - (3600 * hour)) / 60);
        if (seconds == 0 || reopen) {
            $("#timeSpent").val(hour + "h " + minute + "m");
        }
        $("#hour").text(hour);
        $("#minute").text(minute);
        $("#second").text(seconds);
    } else if (second >= 60) {
        minute = Math.floor(second / 60);
        if (seconds == 0 || reopen) {
            $("#timeSpent").val(minute + "m");
        }
        $("#minute").text(minute);
        $("#second").text(seconds);
    } else {
        $("#second").text(seconds);
    }
    if (seconds == 0) {
        $("#timeSpent").change();
    }
}

function startRecord() {
    var intervalInt = setInterval(function() {
        if (isStop) {
            clearInterval(intervalInt);
            isStop = false;
            secondConvertAndSetTime(countSec + 30, true);
            countSec = 0;
            $("#hour").text(0);
            $("#minute").text(0);
            $("#second").text(0);
            for (var dataName in removeData) {
                chrome.storage.sync.remove(removeData[dataName], function(items) {});
            }
            chrome.storage.sync.set({ 'isStop': false }, function() {});
            $("#timeSpent").change();
        } else if (isPause) {
            clearInterval(intervalInt);
            return;
        } else {
            countSec += 1;
            secondConvertAndSetTime(countSec);
        }
    }, 1000);
}

function updateIssueWorkTime(issueValue) {
    if (issueValue == "") {
        $("#issueWorkTime").text("");
        $("#issueWorkTimeDash").hide();
        return;
    }
    issue = getIssueNumber(issueValue);
    $.ajax({
        type: "GET",
        dataType: "json",
        url: "https://jira.exosite.com/rest/api/2/issue/" + issue,
        success: function(msg) {
            issueStatus = msg['fields']['status']['name'];
            original = msg['fields']['timetracking']['originalEstimate'];
            timeOriginal = msg['fields']['timetracking']['originalEstimateSeconds'];
            issueSpentTime = msg['fields']['timetracking']['timeSpent'];
            timeIssueSpentTime = msg['fields']['timetracking']['timeSpentSeconds'];
            if (!issueSpentTime) { issueSpentTime = "0 h"; }
            if (!original) { original = "0 h"; }
            $("#issueWorkTimeDash").show();
            $("#issueWorkTime").text(issueSpentTime + " / " + original + " [ " + issueStatus + " ]");
            if (timeIssueSpentTime > timeOriginal || issueStatus == "Closed") {
                $("#issueWorkTime").addClass("issueWorkTimeWarn");
            } else {
                $("#issueWorkTime").removeClass("issueWorkTimeWarn");
            }
        },
        error: function(e1, e2, e3) {
            $("#issueWorkTime").text();
            $("#issueWorkTimeDash").hide();
        }
    });
}

function getIssueNumber(issue) {
    issue = issue.split(" - ");
    issue = issue[0];
    return issue;
}