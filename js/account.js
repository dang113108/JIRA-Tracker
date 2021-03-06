var userToken = "";
$(function() {

    chrome.storage.sync.get(['account', 'password'], function(items) {
        if (items['account'] && items['password']) {
            $("#issueWorkTimeDash").hide();
            $('#pills-home').tab('show');
            $('#pills-profile').removeClass('active show');
            $.ajax({
                type: "POST",
                dataType: "json",
                url: "https://jira.exosite.com/rest/auth/1/session",
                contentType: 'application/json',
                data: '{"username": "' + account + '","password": "' + password + '"}',
                success: function(msg) {
                    updateTodayWorkHour();
                    account = items['account'];
                    password = items['password'];
                    userToken = btoa(account + ":" + password);
                }
            });
        }
    });

    $("#signInForm").on('submit', function(e) {
        e.preventDefault();

        account = $("#account").val();
        password = $("#password").val();

        $("#submitSignIn").attr('disabled', true);
        $("#loadingSignIn").show();
        $("#normalSignIn").hide();
        $("#errorSignIn").hide();

        $.ajax({
            type: "POST",
            dataType: "json",
            url: "https://jira.exosite.com/rest/auth/1/session",
            contentType: 'application/json',
            data: '{"username": "' + account + '","password": "' + password + '"}',
            success: function(msg) {
                updateTodayWorkHour();
                chrome.storage.sync.set({ 'account': account }, function() {});
                chrome.storage.sync.set({ 'password': password }, function() {});
                userToken = btoa(account + ":" + password);
                $('#pills-home').tab('show');
                $('#pills-profile').removeClass('active show');
                $("#account").val("");
                $("#password").val("");
                $("#submitSignIn").attr('disabled', false);
                $("#loadingSignIn").hide();
                $("#normalSignIn").show();
            },
            error: function(e1, e2, e3) {
                $("#submitSignIn").attr('disabled', false);
                $("#loadingSignIn").hide();
                $("#errorSignIn").show();
                $("#submitSignIn").addClass("btn-danger");
                $("#submitSignIn").removeClass("btn-primary");
            }
        });
    });
});