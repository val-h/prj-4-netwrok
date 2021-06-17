// page flag
let page;
// Current ID of User profile being displayed
let usrProfileId;



document.addEventListener('DOMContentLoaded', () => {


    // Set the view
    changeView('all-posts-view');
    page = 'all-posts';

    let counter = 0;
    let quantity = 3; // bump this to 10 for the review
    let start;
    let end;

    resetCounterVars();
    // by default, load current posts
    get_all_posts(start, end);


    // Add window on scroll loading for posts TODO
    window.onscroll = () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {

            // get the posts
            start = counter;
            end = start + quantity;
            counter = end + 1;

            console.log(page);
            if (page === 'all-posts') {
                get_all_posts(start, end);
            } else if (page === 'profile') {
                get_user_posts(usrProfileId, start, end)
            } else if (page === 'following') {
                getFollowingPosts(start, end)
            }
        }
    };


    // All posts button
    document.querySelector('#all-posts').onclick = () => {
        // Change to the appropriate view
        changeView('all-posts-view');
        page = 'all-posts';

        // clear current view
        document.querySelector('#posts').innerHTML = "";

        resetCounterVars();
        get_all_posts(start, end);
    };

    // Profile button
    document.querySelector('#profile').onclick = () => {
        resetCounterVars();
        showProfile(usrProfileId, start, end);
    };

    // Following button
    document.querySelector('#following-page').onclick = () => {
        resetCounterVars();
        followingPage(start, end);
    };

    function resetCounterVars() {
        counter = 0;
        start = counter;
        end = start + quantity;
        counter = end + 1;
        return null;
    }
});

function get_all_posts(start, end) {
    // fetch all the posts
    fetch(`/api/v1/posts/start=${start}&end=${end}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            data.posts.forEach(post => add_post(contents = post, section = '#posts'));
        })
}

function add_post(contents, section) {
    post = create_post_element(contents);
    document.querySelector(`${section}`).append(post);
}

function showProfile(profile_id, start, end) {
    // Change to the appropriate view
    changeView('profile-view');
    page = 'profile';

    // Set the user profile
    setProfile(profile_id, start, end);
}

function setProfile(profile_id, start, end) {
    // Specify the user
    let id;
    if (profile_id === undefined) {
        // current user
        id = '';
    } else {
        // specific user
        id = `/${profile_id}`;
    }

    // API call for the user data
    fetch(`/api/v1/profile${id}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // Terrible implementation but i have no better ideas at 3am
            usrProfileId = data.user['id'];

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
            get_user_posts(usrProfileId, start, end);
        });
}

function get_user_posts(user_id, start, end) {
    fetch(`/api/v1/u-posts/${user_id}/start=${start}&end=${end}`)
        .then(response => response.json())
        .then(data => {
            console.log('User posts:', data)
            data.posts.forEach(post => add_post(contents = post, section = '#user-posts'));
        });
}

function create_post_element(post_data) {
    const post = document.createElement('div');
    post.className = 'post';
    post.innerHTML = `
        <div class="post-heading" onclick='showProfile(${post_data['op']['id']}, 0, 3)'>
            <img class="post-pfp" src="${post_data['op']['pfp']}" alt="Profile Picture"> - 
            ${post_data['op']['username']}
        </div>
        <div class="post-body">
            <p class="post-date">${post_data['created_at']}</p>
            <div class="content-field">
                <p class="post-content">${post_data['content']}</p>
            </div>
            <img class="post-img" src="${post_data['image']}" alt="image">
        </div>
        <div class="post-footer">
            <p class="post-likes">
            </p>
        </div>
    `;

    // Set up like button
    likeBtn = document.createElement('span');
    likeBtn.className = 'like-btn';
    // likeBtn = post.getElementsByClassName('like-btn')[0];
    // likeBtn = post['post-footer']['post-likes']['like-btn'];
    if (usrProfileId in post_data['likes']) {
        likeBtn.innerHTML = '&#128151; ' + post_data['likes'].length;
    } else {
        likeBtn.innerHTML = '🤍 ' + post_data['likes'].length;
    }

    // Like function - gives an error
    likeBtn.addEventListener('click', () => {
        fetch(`/api/v1/like-post/${post_data['id']}`)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data['message'] === 'Successfully liked.') {
                    likeBtn.innerHTML = '&#128151; ' + data['likes'].length;
                } else if (data["message"] === 'Successfully unliked.') {
                    likeBtn.innerHTML = '🤍 ' + data['likes'].length;
                }
            })
            .catch(err => {
                console.log(err);
            });
    });
    // doesn't append to the right post
    post.appendChild(likeBtn);
    // post.getElementsByClassName('post-likes')[0].appendChild(likeBtn);
    // console.log(post.childNodes)
    // post.childNodes[6].appendChild(likeBtn);

    // &#128151; - red heart

    if (usrProfileId === post_data['op']['id']) {
        editBtn = document.createElement('button');
        editBtn.innerHTML = 'Edit';
        editBtn.className = 'btn-edit-post nav-link-own';
        editBtn.addEventListener('click', () => {
            // editPost(post_data); Refactoring
            console.log(`Editing post ${post_data['id']}`)

            contentField = post.getElementsByClassName('content-field')[0];
            postContent = post.getElementsByClassName('post-content')[0];
            postContent.style.display = 'none';

            // Create a new field
            inputArea = document.createElement('input');
            inputArea.attributes.type = 'text';
            inputArea.className = 'input-area';
            inputArea.value = postContent.innerHTML;
            contentField.appendChild(inputArea);

            // Set the buttons
            editBtn.style.display = 'none'; // Doens't work

            saveBtn = document.createElement('button');
            saveBtn.innerHTML = 'Save';
            saveBtn.className = 'btn-edit-post nav-link-own';
            saveBtn.addEventListener('click', () => {
                // Save the updated post content
                context = {
                    method: 'PUT',
                    body: JSON.stringify({
                        'content': inputArea.value
                    })
                };
                fetch(`/api/v1/posts/${post_data['id']}`, context)
                    .then(result => result.json())
                    .then(data => {
                        console.log(data);
                        saveBtn.style.display = 'none';
                        // Temporary
                        showProfile(post_data.op['id'], 0, 3);
                        // TODO - load the <p> back with the updated content
                    })
                    .catch(err => {
                        console.log(err);
                    });
            });
            post.appendChild(saveBtn);
        });
        post.appendChild(editBtn);
    }
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
    // refresh the page after a while, give time to unfollow
    setTimeout(setProfile, '100', user_id);
}

// Following page
function followingPage(start, end) {
    // Change to the appropriate view
    changeView('following-view');
    page = 'following';

    document.querySelector('#following-view').innerHTML = '';

    // Make a call for posts from followed users
    getFollowingPosts(start, end);
}

function getFollowingPosts(start, end) {
    fetch(`/api/v1/followed-posts/start=${start}&end=${end}`)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            if (data.posts) {
                data.posts.forEach(post => add_post(post, section = '#following-view'))
            }
        });
}

function changeView(view) {
    // Hide all
    document.querySelector('#all-posts-view').style.display = 'none';
    document.querySelector('#profile-view').style.display = 'none';
    document.querySelector('#following-view').style.display = 'none';

    // Show the requested view
    document.querySelector(`#${view}`).style.display = 'block';
}
