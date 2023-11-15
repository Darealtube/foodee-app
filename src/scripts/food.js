$(document).ready(function () {
  var urlQuery = new URLSearchParams(window.location.search);
  let postId = urlQuery.get("p") || 0;

  const getLoggedInUser = () => {
    return new Promise((resolve, reject) => {
      $.ajax({
        method: "GET",
        url: `/api/session`,
        cache: true,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: (data) => {
          console.log(data);
          resolve(data); // Resolve the promise with the logged-in user data
        },
        error: (error) => {
          console.error("Error fetching logged in user information:", error);
          reject(error); // Reject the promise with the error
        },
      });
    });
  };
  
  
  // LOAD SINGLE POST
  const getSinglePost = () => {
    $.ajax({
      method: "GET",
      url: `/api/posts/${postId}`,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: (data) => {
        $(".food-img img").attr("src", data.post_img);
        $(".food-title").text(data.title);
        $(".author-name").text(data.author);
        $(".author-details img").attr("src", data.authorPFP);
        $(".food-description").text(data.caption);
        $(".food-location").text(data.location);

        const fullDate = data.date_created;
        const dateOnly = fullDate.split("T")[0]; // Extract the date portion

        $(".post-date").text(dateOnly);
      },
      error: ({ responseJSON }) => {
        // Show the status popup saying that the get single post has failed
        $(".status-popup").addClass("popup-active").addClass("error");
        $("#status-message").text(responseJSON.error);
        setTimeout(() => {
          $(".status-popup").removeClass("popup-active").removeClass("error");
        }, 2000);
      },
    });
  };
  getSinglePost();

  // START OF COMMENTS

  // GET POST COMMENTS
  const getPostComments = async () => {
    try {
      const loggedInUser = await getLoggedInUser(); // Assuming getLoggedInUser returns a Promise
  
      const comments = await $.ajax({
        method: "GET",
        url: `/api/comments/?p=${postId}`,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
      });
  
      console.log(comments);
  
      for (let i = 0; i < comments.length; i++) {
        const commentAuthor = comments[i].author;
  
        $(".food-comments").append($(
          `<div class="comment">
            <img
              src="${loggedInUser.pfp}"
              alt=""
              height="32px"
              width="32px"
              class="comment-author-pfp"
            />
            <div class="comment-msg">
              <h6 class="comment-author">${commentAuthor}</h6>
              <p class="comment-text">${comments[i].message}</p>
            </div>`
        ));
  
        console.log(loggedInUser);
        console.log(commentAuthor);
  
        // Check if the logged-in user is the author of the current comment
        if (loggedInUser.name === commentAuthor) {
          // Append the edit comment link
          $(".comment:last-child").append($(
            `<a class="comment-edit" id="edit"><p>Edit</p></a>
            <a class="comment-delete" id="delete"><p>Delete</p></a>
              `));
        }
      }
    } catch (error) {
      console.error("Error fetching comments or logged-in user information:", error);
    }
  };
  
  getPostComments();


  // ADD POST COMMENTS
  $(".comment-button").click(function () {  
    const message = $(".comment-input").val(); 
    const author = "darryl_javier@dlsu.edu.ph";
    const post = postId;

    $.ajax({
      method: "POST",
      url: `/api/comments`,
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify({message, author, post}),
      success: (data) => {
        // Show the status popup saying that the user has been logged in successfully
        $(".status-popup").addClass("popup-active").addClass("success");
        $("#status-message").text(data.message);
        setTimeout(() => {
          window.location.reload();
          $(".comment-input").text("");
          $(".status-popup").removeClass("popup-active").removeClass("success");
        }, 2000);
      },
      error: () => {
        // Show the status popup saying that the login/signup has failed
        $(".status-popup").addClass("popup-active").addClass("error");
        $("#status-message").text(responseJSON.error);
        setTimeout(() => {
          $(".status-popup").removeClass("popup-active").removeClass("error");
        }, 2000);
      }
  })
  })

  $(".food-comments").on("click", ".comment-delete", function () {
    const commentId = $(this).closest(".comment").attr("id");
    $.ajax({
      method: "DELETE",
      url: "/api/comments",
      data: { comment: commentId },
      dataType: "json",
      success: function (response) {
        console.log(response.message);
      },
      error: function (error) {
        console.error("Error deleting comment:", error.responseJSON.error);
      }
    });
 })

  // END OF COMMENTS

  // START OF APPBAR
  const appBar = (loggedInUser) => {
    if (!loggedInUser) {
      return `
      <a href="./login.html"><button class="loginBtn">LOG IN</button></a>`;
    }

    return `
    <div class="pfp">
      <a href='profile.html?u=${loggedInUser.name}'>
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

  var searchKey;
  $("input[name='search-bar']").on("keyup", function() {
    searchKey = $(this).val();
    if (searchKey.trim() !== "") {
      $.ajax({
        url: `/api/searchCategories?k=${searchKey}`,
        type: "GET",
        success: function(response) {
          $(".search-results").empty();
          response.forEach(function(category) {
            $(".search-results").append($(`<div><a href="/index.html?p=0&f=date&c=${category.name}">${category.name}</a></div>`));
          });
        },
        error: function() {
          $(".search-results").empty();
          $(".search-results").append($("<div>").text("Error occured."));
        }
      });
    } else {
      $(".search-results").empty();
    }
  });

 $(".search").submit(function (event) {
  event.preventDefault();
  window.location.href = `/index.html?p=0&f=date&c=${searchKey}`
  })
  
});
