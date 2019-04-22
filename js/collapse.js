var now = new Date();
var nowDayOfWeek = now.getDay();
var nowDay = now.getDate();
var nowMonth = now.getMonth();
var nowYear = now.getYear();
nowYear += (nowYear < 2000) ? 1900 : 0;
var lastMonthDate = new Date();
lastMonthDate.setDate(1);
lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
var lastYear = lastMonthDate.getYear();
var lastMonth = lastMonthDate.getMonth();
var processingCount = 0;
$(function() {

    $('#collapseLog').on('show.bs.collapse', function() {
        $("#loadTodayHour").show();
        $("#toDay").css("visibility", "hidden");
        $.ajax({
            type: "POST",
            dataType: "json",
            url: "https://jira.exosite.com/rest/auth/1/session",
            contentType: 'application/json',
            data: '{"username": "' + account + '","password": "' + password + '"}',
            success: function(msg) {
                processingCount = 0;
                getDate();
                updateTodayWorkHour();
                updateWeekHour();
                updateMonthHour();
                updateThisCycleHourAndSalary();
                updateLastCycleHourAndSalary();
            },
            error: function(e1, e2, e3) {

            }
        });
    });

    $('#collapseLog').on('shown.bs.collapse', function() {
        $('html, body').animate({
            scrollTop: 999
        }, 600);

        $("#doubleAngle").addClass("fa-angle-double-up");
        $("#doubleAngle").removeClass("fa-angle-double-down");
    });

    $('#collapseLog').on('hidden.bs.collapse', function() {
        $("#doubleAngle").addClass("fa-angle-double-down");
        $("#doubleAngle").removeClass("fa-angle-double-up");
        $("#collapseMesh").addClass("collapseMesh");
        $("#loadWorkDetail").show();
    });

});

function getDate() {
    now = new Date();
    nowDayOfWeek = now.getDay();
    nowDay = now.getDate();
    nowMonth = now.getMonth();
    nowYear = now.getYear();
    nowYear += (nowYear < 2000) ? 1900 : 0;
    lastMonthDate = new Date();
    lastMonthDate.setDate(1);
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    lastYear = lastMonthDate.getYear();
    lastYear += (lastYear < 2000) ? 1900 : 0;
    lastMonth = lastMonthDate.getMonth();
    llastMonthDate = new Date();
    llastMonthDate.setDate(1);
    llastMonthDate.setMonth(llastMonthDate.getMonth() - 2);
    llastYear = llastMonthDate.getYear();
    llastYear += (llastYear < 2000) ? 1900 : 0;
    llastMonth = llastMonthDate.getMonth();
}

function getWeekStartDate() {
    var weekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek);
    return formatDate(weekStartDate);
}

function getWeekEndDate() {
    var weekEndDate = new Date(nowYear, nowMonth, nowDay + (6 - nowDayOfWeek));
    return formatDate(weekEndDate);
}

function getMonthDays(myMonth) {
    var monthStartDate = new Date(nowYear, myMonth, 1);
    var monthEndDate = new Date(nowYear, myMonth + 1, 1);
    var days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
    return days;
}

function getMonthStartDate() {
    var monthStartDate = new Date(nowYear, nowMonth, 1);
    return formatDate(monthStartDate);
}

function getMonthEndDate() {
    var monthEndDate = new Date(nowYear, nowMonth, getMonthDays(nowMonth));
    return formatDate(monthEndDate);
}

function updateThisCycleHourAndSalary() {
    if (nowDay >= 21) {
        addNum = 2;
    } else {
        addNum = 1;
    }
    thisM = nowMonth + addNum;
    if (thisM < 10) {
        thisM = "0" + thisM;
    }
    lastM = lastMonth + addNum;
    if (lastM < 10) {
        lastM = "0" + lastM;
    }
    thisYM = nowYear + "-" + thisM;
    lastYM = lastYear + "-" + lastM;
    url = "https://jira.exosite.com/rest/quicktimesheet-rest/1/calendar/get-user-worklog2/user/" + account + "/dateStart/" + lastYM + "-21/dateEnd/" + thisYM + "-20";
    $.ajax({
        type: "GET",
        url: url,
        contentType: 'application/json',
        success: function(jsonArray) {
            var sumHour = 0.0;
            for (items in jsonArray) {
                sumHour += parseFloat(jsonArray[items]['timeSpent']);
            }
            mins = 60 * (sumHour - Math.floor(sumHour));
            salary = Math.round(sumHour * 150);
            $("#thisYM").text(Math.floor(sumHour) + " hour " + Math.round(mins) + " mins");
            $("#thisYMSalary").text("NTD$ " + parseFloat(salary).toLocaleString());
            $("#thisYMDate").text(lastM + "/21 - " + thisM + "/20");
            $("#thisYMSDate").text(lastM + "/21 - " + thisM + "/20");
            countSuccess();
        },
        error: function(e1, e2, e3) {
            $("#thisYM").text("Err hour Err mins");
            $("#thisYMSalary").text("NTD$ Err");
            countSuccess();
        }
    });
}

function updateLastCycleHourAndSalary() {
    if (nowDay >= 21) {
        addNum = 2;
    } else {
        addNum = 1;
    }
    lastM = lastMonth + addNum;
    if (lastM < 10) {
        lastM = "0" + lastM;
    }
    llastM = llastMonth + addNum;
    if (llastM < 10) {
        llastM = "0" + llastM;
    }
    lastYM = lastYear + "-" + lastM;
    llastYM = llastYear + "-" + llastM;
    url = "https://jira.exosite.com/rest/quicktimesheet-rest/1/calendar/get-user-worklog2/user/" + account + "/dateStart/" + llastYM + "-21/dateEnd/" + lastYM + "-20";
    $.ajax({
        type: "GET",
        url: url,
        contentType: 'application/json',
        success: function(jsonArray) {
            var sumHour = 0.0;
            for (items in jsonArray) {
                sumHour += parseFloat(jsonArray[items]['timeSpent']);
            }
            mins = 60 * (sumHour - Math.floor(sumHour));
            salary = Math.round(sumHour * 150);
            $("#lastYM").text(Math.floor(sumHour) + " hour " + Math.round(mins) + " mins");
            $("#lastYMSalary").text("NTD$ " + parseFloat(salary).toLocaleString());
            $("#lastYMDate").text(llastM + "/21 - " + lastM + "/20");
            $("#lastYMSDate").text(llastM + "/21 - " + lastM + "/20");
            countSuccess();
        },
        error: function(e1, e2, e3) {
            $("#lastYM").text("Err hour Err mins");
            $("#lastYMSalary").text("NTD$ Err");
            countSuccess();
        }
    });
}

function updateTodayWorkHour() {
    url = "https://jira.exosite.com/rest/quicktimesheet-rest/1/calendar/get-user-worklog2/user/" + account + "/dateStart/" + formatDate(now) + "/dateEnd/" + formatDate(now);
    $.ajax({
        type: "GET",
        url: url,
        contentType: 'application/json',
        success: function(jsonArray) {
            var sumHour = 0.0;
            for (items in jsonArray) {
                sumHour += parseFloat(jsonArray[items]['timeSpent']);
            }
            mins = 60 * (sumHour - Math.floor(sumHour));
            $("#toDay").text(Math.floor(sumHour) + " hour " + Math.round(mins) + " mins");
            $("#loadTodayHour").hide();
            $("#toDay").css("visibility", "visible");
            countSuccess();
        },
        error: function(e1, e2, e3) {
            $("#toDay").text("Err hour Err mins");
            countSuccess();
        }
    });
}

function updateMonthHour() {
    url = "https://jira.exosite.com/rest/quicktimesheet-rest/1/calendar/get-user-worklog2/user/" + account + "/dateStart/" + getMonthStartDate() + "/dateEnd/" + getMonthEndDate();
    $.ajax({
        type: "GET",
        url: url,
        contentType: 'application/json',
        success: function(jsonArray) {
            var sumHour = 0.0;
            for (items in jsonArray) {
                sumHour += parseFloat(jsonArray[items]['timeSpent']);
            }
            mins = 60 * (sumHour - Math.floor(sumHour));
            $("#thisMonth").text(Math.floor(sumHour) + " hour " + Math.round(mins) + " mins");
            countSuccess();
        },
        error: function(e1, e2, e3) {
            $("#thisMonth").text("Err hour Err mins");
            countSuccess();
        }
    });
}

function updateWeekHour() {
    url = "https://jira.exosite.com/rest/quicktimesheet-rest/1/calendar/get-user-worklog2/user/" + account + "/dateStart/" + getWeekStartDate() + "/dateEnd/" + getWeekEndDate();
    $.ajax({
        type: "GET",
        url: url,
        contentType: 'application/json',
        success: function(jsonArray) {
            var sumHour = 0.0;
            for (items in jsonArray) {
                sumHour += parseFloat(jsonArray[items]['timeSpent']);
            }
            mins = 60 * (sumHour - Math.floor(sumHour));
            $("#thisWeek").text(Math.floor(sumHour) + " hour " + Math.round(mins) + " mins");
            countSuccess();
        },
        error: function(e1, e2, e3) {
            $("#thisWeek").text("Err hour Err mins");
            countSuccess();
        }
    });
}

function formatDate(date) {
    var myyear = date.getFullYear();
    var mymonth = date.getMonth() + 1;
    var myweekday = date.getDate();
    if (mymonth < 10) {
        mymonth = "0" + mymonth;
    }
    if (myweekday < 10) {
        myweekday = "0" + myweekday;
    }
    return (myyear + "-" + mymonth + "-" + myweekday);
}

function countSuccess() {
    processingCount += 1;
    if (processingCount >= 5) {
        processingCount = 0;
        $("#collapseMesh").removeClass("collapseMesh");
        $("#loadWorkDetail").hide();
    }
}