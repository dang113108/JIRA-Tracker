var processingCount = 0;
var salary2018 = 140;
var salary2019 = 150;
var LaborHealth2018 = 673;
var LaborHealth2019 = 706;

$(function() {

    $(window).scroll(function() {
        var scrollHeight = $('html, body').scrollTop();
        if (scrollHeight > 400 && scrollHeight < 2150) {
            $("#downArrow").css("visibility", "visible");
        } else {
            $("#downArrow").css("visibility", "hidden");
        }
    });

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
                updateTodayWorkHour();
                updateWeekHour();
                updateMonthHour();
                for (var num = 0; num < 14; num++) {
                    updateCycleHourAndSalary(num);
                }
            },
            error: function(e1, e2, e3) {

            }
        });
    });

    $('#collapseLog').on('shown.bs.collapse', function() {
        $('html, body').animate({
            scrollTop: 430
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

function getWeekStartDate(monthBeforeNow = 0) {
    var now = getDate(monthBeforeNow);
    var weekStartDate = new Date(now.calcYear, now.calcMonth, now.calcDay - now.calcDayOfWeek);
    return formatDate(weekStartDate);
}

function getWeekEndDate(monthBeforeNow = 0) {
    var now = getDate(monthBeforeNow);
    var weekEndDate = new Date(now.calcYear, now.calcMonth, now.calcDay + (6 - now.calcDayOfWeek));
    return formatDate(weekEndDate);
}

function getMonthDays(myMonth) {
    var now = getDate();
    var monthStartDate = new Date(now.calcYear, myMonth, 1);
    var monthEndDate = new Date(now.calcYear, myMonth + 1, 1);
    var days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
    return days;
}

function getMonthStartDate(monthBeforeNow = 0) {
    var now = getDate(monthBeforeNow);
    var monthStartDate = new Date(now.calcYear, now.calcMonth, 1);
    return formatDate(monthStartDate);
}

function getMonthEndDate(monthBeforeNow = 0) {
    var now = getDate(monthBeforeNow);
    var monthEndDate = new Date(now.calcYear, now.calcMonth, getMonthDays(now.calcMonth));
    return formatDate(monthEndDate);
}

function updateCycleHourAndSalary(monthBeforeNow = 0) {
    var thisMonth = getDate(monthBeforeNow);
    var lastMonth = getDate(monthBeforeNow + 1);
    if (thisMonth.calcDay >= 21) {
        addNum = 2;
    } else {
        addNum = 1;
    }
    var thisM = thisMonth.calcMonth + addNum;
    var lastM = lastMonth.calcMonth + addNum;
    var thisY = thisMonth.calcYear;
    var lastY = lastMonth.calcYear;
    if (thisM < 1) {
        thisM = "12";
        thisY -= 1;
    } else if (thisM < 10) {
        thisM = "0" + thisM;
    } else if (thisM > 12) {
        thisM = "01";
        thisY += 1;
    }

    if (lastM < 1) {
        lastM = "12";
        lastY -= 1;
    } else if (lastM < 10) {
        lastM = "0" + lastM;
    } else if (lastM > 12) {
        lastM = "01";
        lastY += 1;
    }
    thisYM = thisY + "-" + thisM;
    lastYM = lastY + "-" + lastM;
    if (account == "markchang") {
        url = "https://jira.exosite.com/rest/quicktimesheet-rest/1/calendar/get-user-worklog2/user/mark chung/dateStart/" + lastYM + "-21/dateEnd/" + thisYM + "-20";
    } else {
        url = "https://jira.exosite.com/rest/quicktimesheet-rest/1/calendar/get-user-worklog2/user/" + account + "/dateStart/" + lastYM + "-21/dateEnd/" + thisYM + "-20";
    }
    if (lastY == 2019) {
        var LaborHealth = LaborHealth2019;
        var salaryMonth = salary2019;
    } else {
        var LaborHealth = LaborHealth2018;
        var salaryMonth = salary2018;
    }
    $.ajax({
        type: "GET",
        url: url,
        contentType: 'application/json',
        success: function(jsonArray) {
            var workTime = getWorkTime(jsonArray, true);
            salary = (workTime.judgeSumHour * salaryMonth) + Math.round(workTime.judgeMins * (salaryMonth / 60)) - LaborHealth;
            if (salary < 0) { salary = 0; }
            $("#YM" + monthBeforeNow).text(workTime.sumHour + " hour " + workTime.mins + " mins");
            $("#YM" + monthBeforeNow + "Salary").text("NTD$ " + parseFloat(salary).toLocaleString());
            $("#YM" + monthBeforeNow + "Date").text(lastM + "/21 - " + thisM + "/20");
            $("#YM" + monthBeforeNow + "SDate").text(lastM + "/21 - " + thisM + "/20");
            countSuccess();
        },
        error: function(e1, e2, e3) {
            $("#YM" + monthBeforeNow).text("Err hour Err mins");
            $("#YM" + monthBeforeNow + "Salary").text("NTD$ Err");
            countSuccess();
        }
    });
}

function updateTodayWorkHour() {
    var now = getDate();
    if (account == "markchang") {
        url = "https://jira.exosite.com/rest/quicktimesheet-rest/1/calendar/get-user-worklog2/user/mark chung/dateStart/" + formatDate(now.now) + "/dateEnd/" + formatDate(now.now);
    } else {
        url = "https://jira.exosite.com/rest/quicktimesheet-rest/1/calendar/get-user-worklog2/user/" + account + "/dateStart/" + formatDate(now.now) + "/dateEnd/" + formatDate(now.now);
    }
    $.ajax({
        type: "GET",
        url: url,
        contentType: 'application/json',
        success: function(jsonArray) {
            var workTime = getWorkTime(jsonArray);
            $("#toDay").text(workTime.sumHour + " hour " + workTime.mins + " mins");
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
    if (account == "markchang") {
        url = "https://jira.exosite.com/rest/quicktimesheet-rest/1/calendar/get-user-worklog2/user/mark chung/dateStart/" + getMonthStartDate() + "/dateEnd/" + getMonthEndDate();
    } else {
        url = "https://jira.exosite.com/rest/quicktimesheet-rest/1/calendar/get-user-worklog2/user/" + account + "/dateStart/" + getMonthStartDate() + "/dateEnd/" + getMonthEndDate();
    }
    $.ajax({
        type: "GET",
        url: url,
        contentType: 'application/json',
        success: function(jsonArray) {
            var workTime = getWorkTime(jsonArray);
            $("#thisMonth").text(workTime.sumHour + " hour " + workTime.mins + " mins");
            countSuccess();
        },
        error: function(e1, e2, e3) {
            $("#thisMonth").text("Err hour Err mins");
            countSuccess();
        }
    });
}

function updateWeekHour() {
    if (account == "markchang") {
        url = "https://jira.exosite.com/rest/quicktimesheet-rest/1/calendar/get-user-worklog2/user/mark chung/dateStart/" + getWeekStartDate() + "/dateEnd/" + getWeekEndDate();
    } else {
        url = "https://jira.exosite.com/rest/quicktimesheet-rest/1/calendar/get-user-worklog2/user/" + account + "/dateStart/" + getWeekStartDate() + "/dateEnd/" + getWeekEndDate();
    }
    $.ajax({
        type: "GET",
        url: url,
        contentType: 'application/json',
        success: function(jsonArray) {
            var workTime = getWorkTime(jsonArray);
            $("#thisWeek").text(workTime.sumHour + " hour " + workTime.mins + " mins");
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

function getDate(monthBeforeNow = 0) {
    now = new Date();
    now.setMonth(now.getMonth() - monthBeforeNow);
    calcDayOfWeek = now.getDay();
    calcDay = now.getDate();
    calcMonth = now.getMonth();
    calcYear = now.getYear();
    calcYear += (calcYear < 2000) ? 1900 : 0;
    return {
        now: now,
        calcYear: calcYear,
        calcMonth: calcMonth,
        calcDay: calcDay,
        calcDayOfWeek: calcDayOfWeek
    }
}

function getWorkTime(jsonArray, judge = false) {
    var sumHour = 0;
    var mins = 0;
    var judgeSumHour = 0;
    var judgeMins = 0;
    for (items in jsonArray) {
        timeSpent = jsonArray[items]['timeSpent'];
        workComment = jsonArray[items]['comment'];
        if (judge == true && workComment.toLowerCase().indexOf("exosite welfare") == -1) {
            judgeSumHour += Math.floor(timeSpent);
            judgeMins += Math.round((timeSpent - Math.floor(timeSpent)) * 60);
        }
        sumHour += Math.floor(timeSpent);
        mins += Math.round((timeSpent - Math.floor(timeSpent)) * 60);
    }
    sumHour += Math.floor(mins / 60);
    mins -= Math.floor(mins / 60) * 60;
    judgeSumHour += Math.floor(judgeMins / 60);
    judgeMins -= Math.floor(judgeMins / 60) * 60;
    return {
        sumHour: sumHour,
        mins: mins,
        judgeSumHour: judgeSumHour,
        judgeMins: judgeMins
    }
}