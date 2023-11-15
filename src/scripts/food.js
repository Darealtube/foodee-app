$(document).ready(function () {
  var loggedInUser;
  var postIsLiked = false;

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

  const getSession = () => {
    $.ajax({
      method: "GET",
      url: `/api/session`,
      cache: true,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: (data) => {
        loggedInUser = data;
        $(".appbar-nav").append(appBar(data));
      },
      error: () => {
        loggedInUser = null;
        $(".appbar-nav").append(appBar(null));
      },
    });
  };

  getSession();
  // END OF APPBAR

  var urlQuery = new URLSearchParams(window.location.search);
  let postId = urlQuery.get("p") || 0;

  $(".comment-form").hide();
  $("#edit-post").hide();
  $("#edit-post-link").attr("href", `/editpost.html?p=${postId}`);

  const loadPost = (post) => {
    postIsLiked = post.isLiked;
    if (loggedInUser && loggedInUser.name == post.author) {
      $(".comment-form").show();
      $("#edit-post").show();
      $(".comment-form #pfp").attr("src", loggedInUser.pfp);
    }

    $(".food-img img").attr("src", post.post_img);
    $(".food-title").text(post.title);
    $(".food-likes").text(post.likes);

    if (postIsLiked === true) {
      $(".like").addClass("liked");
    }

    $(".author-name").text(post.author);

    // not working
    $(".author-details img").attr("src", post.authorPFP);
    // -----------

    $(".food-description").text(post.caption);
    $(".food-location").text(post.location);

    const fullDate = post.date_created;
    const dateOnly = fullDate.split("T")[0]; // Extract the date portion

    $(".post-date").text(dateOnly);
  };

  const like = (operation) => {
    if (operation == "like") {
      $(".food-likes").text(parseInt($(".food-likes").text()) + 1);
      $(".like").addClass("liked");
    } else {
      $(".food-likes").text(parseInt($(".food-likes").text()) - 1);
      $(".like").removeClass("liked");
    }

    $.ajax({
      method: "PUT",
      url: `/api/posts/favorite`,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      data: JSON.stringify({ post: postId }),
      error: () => {
        // Show the status popup saying that the liking/disliking has failed.
        $(".status-popup").addClass("popup-active").addClass("error");
        $("#status-message").text("You must be logged in to like posts.");
        setTimeout(() => {
          $(".status-popup").removeClass("popup-active").removeClass("error");
          window.location.href = "/login.html";
        }, 2000);
      },
    });
  };

  $(".like").click(() => {
    if (postIsLiked == true) {
      like("dislike");
    } else like("like");
  });

  // LOAD SINGLE POST
  const getSinglePost = () => {
    $.ajax({
      method: "GET",
      url: `/api/posts/${postId}`,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: (data) => loadPost(data),
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
  const getPostComments = (loggedInUser) => {
    $.ajax({
      method: "GET",
      url: `/api/comments/?p=${postId}`,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: (data) => {
        console.log(data);

        for (let i = 0; i < data.length; i++) {
          var loggedInUser = null;
          $.ajax({
            method: "GET",
            url: `/api/session`,
            cache: true,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: (datas) => {
              loggedInUser = datas;
              $(".food-comments").append(
                $(
                  `<div class="comment">
                  <img
                    src="${loggedInUser.pfp}"
                    alt=""
                    height="32px"
                    width="32px"
                    class="comment-author-pfp"
                  />
                  <div class="comment-msg">
                    <h6 class="comment-author">${data[i].author}</h6>
                    <p class="comment-text">${data[i].message}</p>
                  </div>`
                )
              );
              console.log(loggedInUser);
              // Check if the logged-in user is not the author
              if (loggedInUser.name === data[i].author) {
                // Append the edit profile link
                $(".comment").append(
                  $(`<a class="edit-comment"><p>Edit</p></a>`)
                );
              }
            },
            error: (error) => {
              console.error(
                "Error fetching logged in user information:",
                error
              );
            },
          });
        }
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
  getPostComments(loggedInUser);

  // ADD POST COMMENTS

  $(".comment-button").click(function () {
    const message = $(".comment-input").val();
    const author = "Darryl Javier";
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

  // END OF COMMENTS

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
  $("input[name='search-bar']").on("keyup", function () {
    searchKey = $(this).val();
    if (searchKey.trim() !== "") {
      $.ajax({
        url: `/api/searchCategories?k=${searchKey}`,
        type: "GET",
        success: function (response) {
          $(".search-results").empty();
          response.forEach(function (category) {
            $(".search-results").append(
              $(
                `<div><a href="/index.html?p=0&f=date&c=${category.name}">${category.name}</a></div>`
              )
            );
          });
        },
        error: function () {
          $(".search-results").empty();
          $(".search-results").append($("<div>").text("Error occured."));
        },
      });
    } else {
      $(".search-results").empty();
    }
  });

  $(".search").submit(function (event) {
    event.preventDefault();
    window.location.href = `/index.html?p=0&f=date&c=${searchKey}`;
  });
});
