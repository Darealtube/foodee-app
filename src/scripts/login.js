$(document).ready(function () {
  let operation = "";

  $(".login").click(function () {
    operation = "login";
  });

  $(".signup").click(function () {
    operation = "register";
  });

  $("#loginForm").submit(function (event) {
    event.preventDefault(); // Prevent the form from submitting
    const username = $("#username").val();
    const password = $("#password").val();

    // We use AJAX for out calls for easy error and success handling, and header setting, etc.
    $.ajax({
      url: "/api/login",
      method: "POST",
      data: JSON.stringify({ username, password, operation }),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: (data, status) => {
        // Set cookie to logged in user
        // authenticate user

        // Show the status popup saying that the user has been logged in successfully
        $(".status-popup").addClass("popup-active");
        $("#status-message").text("Login Success! Redirecting to homepage...");
        setTimeout(() => {
          window.location.href = "/index.html";
          $(".status-popup").removeClass("popup-active");
        }, 2000);
      },
      // Use destructuring to destructure the error parameter to get the responseJSON data
      error: ({ responseJSON }) => {
        // Show the status popup saying that the login/signup has failed
        $(".status-popup").addClass("popup-active");
        $("#status-message").text(responseJSON.error);
        setTimeout(() => {
          $(".status-popup").removeClass("popup-active");
        }, 2000);
      },
    });

    // Reset the text once the popup hides
    $("#status-message").text("");
  });
});
