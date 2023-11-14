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
        $(".status-popup")
          .removeClass("popup-active")
          .removeClass("error")
          .removeClass("success"); // Reset the status message display
        $(".status-popup").addClass("popup-active").addClass("success");
        $("#status-message").text("Login Success! Redirecting to homepage...");
        setTimeout(() => {
          window.location.href = "/index.html";
          $(".status-popup").removeClass("popup-active").removeClass("success");
        }, 2000);
      },
      // Use destructuring to destructure the error parameter to get the responseJSON data
      error: ({ responseJSON }) => {
        // Show the status popup saying that the login/signup has failed
        $(".status-popup")
          .removeClass("popup-active")
          .removeClass("error")
          .removeClass("success"); // Reset the status message display
        $(".status-popup").addClass("popup-active").addClass("error");
        $("#status-message").text(responseJSON.error);
        setTimeout(() => {
          $(".status-popup").removeClass("popup-active").removeClass("error");
        }, 2000);
      },
    });

    // Reset the text once the popup hides
    $("#status-message").text("");
  });

  // START OF APPBAR
  const appBar = (loggedInUser) => {
    if (!loggedInUser) {
      return `
      <a href="./login.html"><button class="loginBtn">LOG IN</button></a>`;
    }

    return `
    <div class="pfp">
      <a href='profile.html?p=${loggedInUser.name}'>
        <img
          src="${loggedInUser.pfp}"
          width="32px"
          height="32px"
          alt="PFP"
        />
      </a>
    </div>
    <button class="loginBtn logout">LOG OUT</button>
  `;
  };

  $.ajax({
    method: "GET",
    url: `/api/session`,
    cache: true,
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: (data) => $(".appbar-nav").append(appBar(data)),
    error: () => $(".appbar-nav").append(appBar(null)),
  });

  // END OF APPBAR

  // START OF LOGOUT
  const logout = () => {
    $.ajax({
      url: "/api/logout",
      method: "POST",
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: (data) => {
        // Show the status popup saying that the user has been logged in successfully
        $(".status-popup").addClass("popup-active").addClass("success");
        $("#status-message").text(data.message);
        setTimeout(() => {
          window.location.href = "/index.html";
          $(".status-popup").removeClass("popup-active").removeClass("success");
        }, 2000);
      },
      // Use destructuring to destructure the error parameter to get the responseJSON data
      error: ({ responseJSON }) => {
        // Show the status popup saying that the login/signup has failed
        $(".status-popup").addClass("popup-active").addClass("error");
        $("#status-message").text(responseJSON.error);
        setTimeout(() => {
          $(".status-popup").removeClass("popup-active").removeClass("error");
        }, 2000);
      },
    });
  };

  $(".appbar-nav").on("click", ".logout", () => {
    logout();
  });
  // END OF LOGOUT
});
