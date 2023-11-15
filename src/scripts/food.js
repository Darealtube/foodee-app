$(document).ready(function () {
  var urlQuery = new URLSearchParams(window.location.search);
  let postId = urlQuery.get("p") || 0;

  var loggedInUser = null;
  
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
            success: (datas) => {loggedInUser = datas; 
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
                    <h6 class="comment-author">${data[i].author}</h6>
                    <p class="comment-text">${data[i].message}</p>
                  </div>`
              ));
              console.log(loggedInUser);
              // Check if the logged-in user is not the author
              if (loggedInUser.name === data[i].author) {
                // Append the edit profile link
                $(".comment").append($(`<a class="edit-comment"><p>Edit</p></a>`));
              }
            },
            error: (error) => {console.error("Error fetching logged in user information:", error);},
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
    })
  }
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
          console.log(data);
        },
        error: () => {
          console.error("error");
        }
     })

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
  



  ///////////////////////////////////////////// Comment Pagination (Kindly debug this code)
  let currentPage = 0;

  // Function to fetch comments for the current page
  function getComments() {
    let postId = '6554a0e0082efe73ef4eb1a6'; // Replace with your actual post ID

    $.ajax({
      url: `/api/comments?p=${postId}&cp=${currentPage}`,
      method: 'GET',
      success: function(response) {
        if (response.length > 0) {
          $('.comment-list').empty();

          response.forEach(function(comment) {
            let commentElem = `
              <div class="comment">
                <img src="" alt="" height="32px" width="32px" class="comment-author-pfp" />
                <div class="comment-msg">
                  <h6 class="comment-author">${comment.author}</h6>
                  <p class="comment-text">${comment.message}</p>
                </div>
              </div>
            `;

            $('.comment-list').append(commentElem);
          });

          $('#prev').prop('disabled', currentPage === 0);
          $('#next').prop('disabled', response.length < 10);
        }
      },
      error: function() {
        console.log('Error occurred while fetching comments.');
      }
    });
  }

  // Fetch comments for the initial page
  getComments();

  // Event listener for previous button
  $('#prev').on('click', function() {
    if (currentPage > 0) {
      currentPage--;
      getComments();
    }
  });

  // Event listener for next button
  $('#next').on('click', function() {
    currentPage++;
    getComments();
  });

  // Event listener for comment submission
  $('.comment-button').on('click', function() {
    let post = '6554a0e0082efe73ef4eb1a6'; // Replace with your actual post ID
    let message = $('.comment-input').val();
    let author = 'Darryl Javier'; // Replace with the actual author name

    if (message !== '') {
      $.ajax({
        url: '/api/comments',
        method: 'POST',
        data: { post, message, author },
        success: function(response) {
          console.log(response.message);
          // Clear the comment input field
          $('.comment-input').val('');
          // Fetch comments for the current page
          getComments();
        },
        error: function() {
          console.log('Error occurred while creating comment.');
        }
      });
    }
  });
  ///////////////////////////////////////////////////////////////////////
});
