document.addEventListener('DOMContentLoaded', () => {

    // Add window on scroll loading for posts TODO

    // by default, load current posts
    document.querySelector('#all-posts-view').style.display = 'block';
    document.querySelector('#profile-view').style.display = 'none';
    get_all_posts();

    // All posts button
    document.querySelector('#all-posts').onclick = () => {
        // Change to the appropriate view
        document.querySelector('#all-posts-view').style.display = 'block';
        document.querySelector('#profile-view').style.display = 'none';

        // clear current view
        document.querySelector('#posts').innerHTML = "";

        // get the posts
        get_all_posts();
    };

    // Profile button
    document.querySelector('#profile').onclick = () => {
        show_profile();
    };
});

function get_all_posts() {
    // fetch all the posts
    fetch('/api/v1/posts')
        .then(response => response.json())
        .then(data => {
            data.posts.forEach(add_post);
        })
}

function add_post(contents) {
    post = create_post_element(contents);
    document.querySelector('#posts').append(post);
}

function show_profile(profile_id) {
    // Change to the appropriate view
    document.querySelector('#all-posts-view').style.display = 'none';
    document.querySelector('#profile-view').style.display = 'block';

    get_profile(profile_id)
}

function get_profile(profile_id) {
    // Specify the user
    let id;
    if (profile_id === undefined) {
        // current user
        id = '';
    } else {
        // specific user
        id = `/${profile_id}`;
    }

    // Get the user profile info
    fetch(`/api/v1/profile${id}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // console.log(data['is_current_user'])
            let profile_view = document.querySelector('#profile-view');
            profile_view.innerHTML = `
                <h1>${data.user['username']}</h1>
                <div id='follow-section'></div>
            `;

            // Staff check
            if (data.user['is_staff']) {
                profile_view.innerHTML += `<div>Is staf? - BIG BOSS</div>`;
            }

            // Profile Picture check
            if (data.user['pfp']) {
                profile_view.innerHTML += `<img id="profile-pfp" src="${data.user['pfp']}" alt="Profile Picture">`;
            } else {
                profile_view.innerHTML += 'No profile Picture :<';
            }

            // Is current user check
            if (data.is_current_user === false) {
                // Set the button's text
                if (data.following === true) {
                    btnFollowText = 'Unfollow';
                } else {
                    btnFollowText = 'Follow';
                }
                // Display the follow/Unfollow button, temp func :D
                profile_view.innerHTML += `
                    <div><button id="follow-user" onclick='follow(${data.user['id']})'>${btnFollowText}</button></div>
                `;
            }

            // Create and fill the Follow section
            fetch(`/api/v1/u-follow-count/${data.user['id']}`)
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    // Create the fileds
                    document.querySelector('#follow-section').innerHTML += `
                            <span>Followers: ${data.followers_data['followers']}</span>
                            <span>Following: ${data.followers_data['following']}</span>
                        `;
                });

            profile_view.innerHTML += '<div id="user-posts"></div>'
            // Load the posts for that user
            // Wierd error from nowhere, loads the logged in user's posts
            get_user_posts(data.user['id']);
        });
}

function get_user_posts(user_id) {
    fetch(`/api/v1/u-posts/${user_id}`)
        .then(response => response.json())
        .then(data => {
            console.log('User posts:', data)
            // profile_posts = document.querySelector('#user-posts');
            // I don't like having specific functions like that, but for now it will do
            data.posts.forEach(add_user_post);
        });
}

function add_user_post(contents) {
    post = create_post_element(contents);
    document.querySelector('#user-posts').append(post);
}

function create_post_element(post_data) {
    const post = document.createElement('div');
    post.className = 'post';
    post.innerHTML = `
        <div class="post-heading" onclick='show_profile(${post_data['op']['id']})'>
            <img class="post-pfp" src="${post_data['op']['pfp']}" alt="Profile Picture"> - 
            ${post_data['op']['username']}
        </div>
        <div class="post-body">
            <p class="post-date">${post_data['created_at']}</p>
            <p class="post-content">${post_data['content']}</p>
            <img class="post-img" src="${post_data['image']}" alt="image">
        </div>
        <div class="post-footer">
            <p class="post-likes">&#128151; 🤍 ${post_data['likes']}</p>
        </div>
    `;
    return post;
}

function follow_count(user_id) {
    // follow the user, api call to update the model
    fetch(`/api/v1/u-follow-count/${user_id}`)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            return data['followers'], data['following']
        });
}

function follow(user_id) {
    fetch(`/api/v1/follow/${user_id}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
        })
    // refresh the page 
    get_profile(user_id);
}
