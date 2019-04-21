$(function() {

    chrome.storage.sync.get(['account', 'password'], function(items) {
        if (items['account'] && items['password']) {
            account = items['account'];
            password = items['password'];
            $('#pills-home').tab('show');
            $('#pills-profile').removeClass('active show');
        }
    });

    $("#signInForm").on('submit', function(e) {
        e.preventDefault();

        account = $("#account").val();
        password = $("#password").val();

        $("#submitSignIn").attr('disabled', true);
        $("#loadingSignIn").show();
        $("#normalSignIn").hide();

        $.ajax({
            type: "POST",
            dataType: "json",
            url: "https://jira.exosite.com/rest/auth/1/session",
            contentType: 'application/json',
            data: '{"username": "' + account + '","password": "' + password + '"}',
            success: function(msg) {
                chrome.storage.sync.set({ 'account': account }, function() {});
                chrome.storage.sync.set({ 'password': password }, function() {});
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