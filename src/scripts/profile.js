$(document).ready(() => {
  var urlQuery = new URLSearchParams(window.location.search);
  const postData = {}; // Hashmap for post data sorted by date
  const postLikesData = {}; // Hashmap for post data sorted by likes
  
  var user = urlQuery.get("p");
  let filter = urlQuery.get("f") || "date";
  let page = 0;
  let endPage;

    const getUserInfo = () => {
      $.ajax({
        method: "GET",
        url: `/api/profile?p=${user}`,
        dataType: "json",
        success: (userData) => {
          // Updates HTML elements with the user information
          $(".profile-name").text(userData.name);
          $(".bio-text").text(userData.bio);
          $("#location").text(userData.address);
          $(".profile-img").attr("src", userData.pfp);
          $(".backdrop-img").attr("src", userData.header);
        },
        error: (error) => {
          // Error handling
          console.error("Error fetching user information:", error);
        }
      });
    };


    
    const getUserPosts = (user, page, filter) => {
      $.ajax({
        method: "GET",
        url: `/api/posts/${user}?p=${page}&f=${filter}`,
        dataType: "json",
        success: (data) => {
          if (data.length < 2) endPage = page;
          if (filter == "date") {
            postData[page] = data;
          } else postLikesData[page] = data;
          appendPosts(data);
        },
        error: (error) => {
          // Handle errors, such as displaying an error message
          console.error("Error fetching posts:", error);
        }
      });
    };

    const generatePost = (postData) => {
      const isLiked = likedPosts.has(postData._id);
      const postLikes = isLiked ? postData.likes + 1 : postData.likes;
      return `
      <div class="container" id="${postData._id}">
      <header class="food-img">
        <a href="/food?=${postData._id}">
          <img src="${postData.post_img}" alt="Food pic" />
        </a>
      </header>
      <footer class="food-details">
        <div class="food-details-container">
          <div class="food-tags"> 
              ${generateTags(postData.categories)}
          </div>
          <p class="like-count">${postLikes}</p>
          <div class="material-symbols-outlined like ${
            isLiked ? "liked" : ""
          }">favorite</div>
        </div>
      </footer>
    </div>
      `;
    };

    const appendPosts = (posts) => {
      for (let i = 0; i < posts.length; ++i) {
        const post = $(generatePost(posts[i]));
        $(".container").append(post);
      }
    };

  getUserInfo();
  getUserPosts(user, page, filter);
});