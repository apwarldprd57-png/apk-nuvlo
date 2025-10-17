
{// Data stores - In-memory arrays for demonstration (replace with real DB)
const postsContainer = document.getElementById('postsContainer');
let blockedUsers = [];
const users = JSON.parse(localStorage.getItem('users')) || [];
let posts = JSON.parse(localStorage.getItem('posts')) || [];

const bannedWords = ['badword1', 'badword2', 'offensive'];
let currentFilter = 'videos';
let currentHashtagFilter = null;
let commentTarget = null;
const currentUserEmail = JSON.parse(localStorage.getItem('currentUser'));
// Fix currentUser by loading saved user or fallback to bot
const savedUser = JSON.parse(localStorage.getItem('currentUser'));
if (savedUser && savedUser.id) {
  currentUser = savedUser;
} else {
  // fallback bot user
  currentUser = null;
}

const svgLike = (liked = false) => `<svg class="btn-svg like-btn ${liked ? 'liked' : ''}" width="60px" height="60px" viewBox="0 0 24 24"  xmlns="http://www.w3.org/2000/svg">
  <path d="M12 21s-6.5-5.6-8.5-8.1C1.4 10.2 2.3 7.5 5 6.2 7.2 5.2 9.6 6 12 8.3 14.4 6 16.8 5.2 19 6.2c2.7 1.3 3.6 4 1.5 6.7C18.5 15.4 12 21 12 21z"></path>
</svg>`;
const svgComment = `<svg  class="btn-svg" id="comment-btn" stroke-width="2" viewBox="0 0 48 48" fill="transparent" xmlns="http://www.w3.org/2000/svg">
<path d="M16 20H32V22H16V20ZM16 25H28V27H16V25Z" fill="black"></path>
  <path d="M18 32L16 36L22 33H30C33.3137 33 36 30.3137 36 27V17C36 13.6863 33.3137 11 30 11H18C14.6863 11 12 13.6863 12 17V27C12 29.4639 13.6356 31.5776 16 32Z" stroke-width="2"></path>
</svg>`;

const svgReply = `
  <text class="reply" x="28" y="17" font-family="Arial" font-size="14" fill="black">Reply</text>
</svg>`;
const svgReport = `
  <svg class="report" viewBox="0 0 24 24" fill="none" stroke="#d00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line><circle cx="12" cy="16" r="0.5" fill="black"></circle>`;

function updateOfficialStatus() {
  const likesCountPerUser = {};
  const postsCountPerUser = {};

  posts.forEach(post => {
    postsCountPerUser[post.userId] = (postsCountPerUser[post.userId] || 0) + 1;
    likesCountPerUser[post.userId] = (likesCountPerUser[post.userId] || 0) + post.likes.length;
  });

  users.forEach(user => {
    const postCount = postsCountPerUser[user.id] || 0;
    const likeCount = likesCountPerUser[user.id] || 0;
    user.isOfficial = postCount >= 4 && likeCount >= 3;
  });
}


function syncCurrentUserOfficialFlag() {
  if (!currentUser) return;
  const userObj = users.find(u => u.id === currentUser.id);
  if (userObj) {
    currentUser.isOfficial = userObj.isOfficial || false;
  }
}

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    let originalPos = { x: window.innerWidth - 100, y: window.innerHeight - 100 };
    btn = document.getElementById('navUploadBtn');

    // Set initial position
    btn.style.left = originalPos.x + 'px';
    btn.style.top = originalPos.y + 'px';

    const setBackground = (dragging) => {
      btn.style.backgroundColor = dragging ? 'transparent' : ' #009C94';
      btn.style.boxShadow = dragging? '0 5px 10px red' : '0 5px 10px gray';
      btn.style.color = dragging? '#009C94' : 'white';
    
    };

    btn.addEventListener('pointerdown', (e) => {
      isDragging = true;
      offsetX = e.clientX - btn.offsetLeft;
      offsetY = e.clientY - btn.offsetTop;
      btn.setPointerCapture(e.pointerId);
      setBackground(true);
    });

    btn.addEventListener('pointermove', (e) => {
      if (isDragging) {
        let x = e.clientX - offsetX;
        let y = e.clientY - offsetY;

        // Keep within screen
        x = Math.max(0, Math.min(x, window.innerWidth - btn.offsetWidth));
        y = Math.max(0, Math.min(y, window.innerHeight - btn.offsetHeight));

        btn.style.left = x + 'px';
        btn.style.top = y + 'px';
      }
    });

    btn.addEventListener('pointerup', (e) => {
      isDragging = false;
      btn.releasePointerCapture(e.pointerId);
      setBackground(false);
    });

    // Tap to reset position
    btn.addEventListener('click', () => {
      btn.style.left = originalPos.x + 'px';
      btn.style.top = originalPos.y + 'px';
    });

    // Recalculate on resize
    window.addEventListener('resize', () => {
      originalPos = { x: window.innerWidth - 100, y: window.innerHeight - 100 };
    });
    
function closeUserModal(){
  document.getElementById('userModal').style.display = 'none';
}

function renderFriendsPage() {  
  let addedUsers = JSON.parse(localStorage.getItem(`friends_${currentUser.id}`)) || [];  
  const friendsContainer = document.getElementById('friendsContainer');  
  const friendPostsContainer = document.getElementById('friendPostsContainer');  
  friendsContainer.innerHTML = '<h2>Friends</h2>';  
  friendPostsContainer.innerHTML = '';  

  const lastOpenedFriend = localStorage.getItem(`lastFriend_${currentUser.id}`);  

  if (addedUsers.length === 0) {  
    friendsContainer.innerHTML += '<p>No friends added yet.</p>';  
    return;  
  }  

  // Move last opened friend to top  
  if (lastOpenedFriend) {  
    addedUsers = [lastOpenedFriend, ...addedUsers.filter(id => id !== lastOpenedFriend)];  
  }  

  // ✅ Search bar  
  const searchInput = document.createElement('input');  
  searchInput.type = 'text';  
  searchInput.placeholder = 'Search friends...';  
  searchInput.style.width = '100%';  
  searchInput.style.padding = '8px';  
  searchInput.style.margin = '10px 0';  
  searchInput.style.border = '1px solid #ccc';  
  searchInput.style.borderRadius = '4px';  
  friendsContainer.appendChild(searchInput);  

  const listWrapper = document.createElement('div');  
  friendsContainer.appendChild(listWrapper);  

  function renderFriendList(filter = '') {  
    listWrapper.innerHTML = '';  

    addedUsers.forEach((userId) => {  
      const friend = users.find(u => u.id === userId);  
      if (!friend) return;  

      // Apply search filter (case-insensitive)  
      if (filter && !friend.email.toLowerCase().includes(filter.toLowerCase())) {  
        return;  
      }  

      const friendDiv = document.createElement('div');  
      friendDiv.className = 'friend-item';  
      friendDiv.style.cursor = 'pointer';  
      friendDiv.style.display = 'flex';  
      friendDiv.style.justifyContent = 'space-between';  
      friendDiv.style.alignItems = 'center';  
      friendDiv.style.marginTop = '10px';  
      friendDiv.style.padding = '8px';  
      friendDiv.style.border = '2px solid gray';  
      friendDiv.style.borderRadius = '6px';  

      // ✅ Highlight active friend  
      if (lastOpenedFriend && lastOpenedFriend === String(friend.id)) {  
        friendDiv.style.background = '#ddd';  
        friendDiv.style.fontWeight = 'bold';  
      }  

      // Left section (name + post count)  
      const leftSection = document.createElement('div');  
      leftSection.style.display = 'flex';  
      leftSection.style.flexDirection = 'column';  

      const friendName = document.createElement('div');  
      friendName.textContent = friend.email;  
      leftSection.appendChild(friendName);  

      const postCount = posts.filter(p => p.userId === friend.id).length;  
      const friendPostCount = document.createElement('small');  
      friendPostCount.textContent = `Posts: ${postCount}`;  
      friendPostCount.style.color = '#555';  
      leftSection.appendChild(friendPostCount);  

      friendDiv.appendChild(leftSection);  

      // Remove button on the right  
      const removeBtn = document.createElement('button');  
      removeBtn.textContent = 'Remove';  
      removeBtn.onclick = (e) => {  
        e.stopPropagation();  
        if (confirm(`Remove ${friend.email} from friends?`)) {  
          let updatedAddedUsers = JSON.parse(localStorage.getItem(`friends_${currentUser.id}`)) || [];  
          const idx = updatedAddedUsers.indexOf(userId);  
          if (idx !== -1) {  
            updatedAddedUsers.splice(idx, 1);  
            localStorage.setItem(`friends_${currentUser.id}`, JSON.stringify(updatedAddedUsers));  
            if (lastOpenedFriend === String(userId)) {  
              localStorage.removeItem(`lastFriend_${currentUser.id}`);  
            }  
            renderFriendsPage();  
            friendPostsContainer.innerHTML = '';  
          }  
        }  
      };  
      friendDiv.appendChild(removeBtn);  

      // Clicking opens friend's posts  
      friendDiv.onclick = () => {  
        localStorage.setItem(`lastFriend_${currentUser.id}`, friend.id);  
        friendsContainer.style.display = 'none';  
        friendPostsContainer.innerHTML = '';  

        const backBtn = document.createElement('button');  
        backBtn.textContent = '← Back';  
        backBtn.style.marginBottom = '10px';  
        backBtn.onclick = () => {  
          friendsContainer.style.display = 'block';  
          friendPostsContainer.innerHTML = '';  
          renderFriendsPage();  
        };  
        friendPostsContainer.appendChild(backBtn);  

        const title = document.createElement('h3');  
        title.textContent = `${friend.email}’s Posts`;  
        friendPostsContainer.appendChild(title);  

        const friendPosts = posts.filter(p => p.userId === friend.id);  
        if (friendPosts.length === 0) {  
          const noPostsMsg = document.createElement('p');  
          noPostsMsg.textContent = 'No posts by this user.';  
          friendPostsContainer.appendChild(noPostsMsg);  
          return;  
        }  

        friendPosts.forEach(post => {  
          const postEl = createPostElement(post);  
          friendPostsContainer.appendChild(postEl);  
        });  
        friendPostsContainer.scrollIntoView({ behavior: 'smooth' });  
      };  

      listWrapper.appendChild(friendDiv);  
    });  
  }  

  // Initial render  
  renderFriendList();  

  // ✅ Real-time search  
  searchInput.addEventListener('input', (e) => {  
    renderFriendList(e.target.value);  
  });  

  friendsContainer.style.display = 'block';  
}

postsContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('user-email')) {
    const email = e.target.textContent.trim();
    const user = users.find(u => u.email === email);
    if (!user) {
      alert('User not found');
      return;
    }

    const userPosts = posts.filter(p => p.userId === user.id);

    modalUserEmail.textContent = email;
    modalPostCount.textContent = userPosts.length;

    // Remove any old addFriendBtn first
    const oldBtn = userModal.querySelector('#addFriendBtn');
    if (oldBtn) oldBtn.remove();

    // Create Add Friend button dynamically
    const addFriendBtn = document.createElement('button');
    addFriendBtn.id = 'addFriendBtn';
    addFriendBtn.textContent = 'Add Friend';
    addFriendBtn.style.color = 'white';
    addFriendBtn.style.background = 'gray';
    addFriendBtn.style.padding = '10px';
    addFriendBtn.style.borderRadius = '10px';
    addFriendBtn.onclick = () => {
      if (!currentUser) {
        alert('Please sign in to add friends.');
        return;
      }

      // ✅ Use per-user storage instead of global "addedUsers"
      let addedUsers = JSON.parse(localStorage.getItem(`friends_${currentUser.id}`)) || [];
      if (!addedUsers.includes(user.id)) {
        addedUsers.push(user.id);
        localStorage.setItem(`friends_${currentUser.id}`, JSON.stringify(addedUsers));
        alert(`Added ${user.email} as a friend!`);
        document.getElementById('userModal').style.display = 'none';
      } else {
        alert('User already added.');
        document.getElementById('userModal').style.display = 'none';
      }
    };

    userModal.appendChild(addFriendBtn);
    userModal.style.display = 'block';  // show modal
  }
});

    
function updateUsername() {
  const usernameEl = document.getElementById('username');
  if (usernameEl) {
    usernameEl.textContent = currentUser? currentUser.email: '';
    
    if (currentUser && currentUser.isOfficial) {
      const officialIcon = `
        <svg width="16" height="16" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-left: 4px;">
          <polygon points="32,4 56,16 56,48 32,60 8,48 8,16" 
                   fill="#0f0f1a" 
                   stroke="#00fff7" 
                   stroke-width="2"
                   filter="url(#glow)"></polygon>
          <path d="M22 33 L29 40 L44 24" 
                stroke="#00fff7" 
                stroke-width="4" 
                fill="none" 
                stroke-linecap="round" 
                stroke-linejoin="round"></path>
        </svg>`;
      usernameEl.innerHTML = `${currentUser.email} ${officialIcon}`;
    }
  }
}

// Auto-login if there’s a saved use
 // { postId, commentId (optional) }

// Utility functions
function generateId() {
  return Math.random().toString(36).slice(2);
}

const buttons = document.querySelectorAll('.filter-bar button');
buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    // remove active from all
    buttons.forEach(b => b.classList.remove('button-active'));
    // add to clicked
    btn.classList.add('button-active');

    // existing filter logic here, e.g.:
    const filter = btn.getAttribute('data-filter');
    
  });
});


document.addEventListener('DOMContentLoaded', () => {
  const defaultBtn = document.querySelector('.filter-bar button[data-filter="all"]');
  if (defaultBtn) defaultBtn.classList.add('button-active');
});

const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
const modalText = document.getElementById('modal-text');
const modalOk = document.getElementById('modal-ok');


function extractHashtags(text) {
  return [...new Set((text.match(/#w+/g) || []).map(h => h.toLowerCase()))];
}


  const passwordInput = document.getElementById('signUpPassword');
  const toggleBtn = document.getElementById('togglePasswordBtn');
  const eyeOpen = document.getElementById('eyeOpen');
  const eyeClosed = document.getElementById('eyeClosed');

  toggleBtn.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      eyeOpen.style.display = 'inline';
      eyeClosed.style.display = 'none';
    } else {
      passwordInput.type = 'password';
      eyeOpen.style.display = 'none';
      eyeClosed.style.display = 'inline';
    }
  });

const pages = {
  feedPage: document.getElementById('feedPage'),
  uploadPage: document.getElementById('uploadPage'),
  profilePage: document.getElementById('profilePage'),
  signInPage: document.getElementById('signInPage'),
  signUpPage: document.getElementById('signUpPage'),
  welkom: document.getElementById('welkom'),
  settings: document.getElementById('settings'),
  renderFriends : document.getElementById('renderFriends'),
  privacy: document.getElementById('privacy'),
  mentions : document.getElementById('mentionsPage'),
  terms: document.getElementById('terms'),
  reminderPage: document.getElementById('reminderPage'),
};



function likePost(post) {
  if (!currentUser) return;
  if (!post.likes.includes(currentUser.id)) post.likes.push(currentUser.id);
}


  function showConfirm(message) {
    return new Promise((resolve) => {
      const overlay = document.getElementById('confirmOverlay');
      const msg = document.getElementById('confirmMessage');
      const yesBtn = document.getElementById('confirmYes');
      const noBtn = document.getElementById('confirmNo');

      msg.textContent = message;
      overlay.style.display = 'flex';

      yesBtn.onclick = () => { overlay.style.display = 'none'; resolve(true); };
      noBtn.onclick = () => { overlay.style.display = 'none'; resolve(false); };
    });
  }

function addCommentToPost(post, text) {
  if (!currentUser) return;
  const newComment = {
    id: generateId(),
    userId: currentUser.id,
    userEmail: currentUser.email,
    text,
    timestamp: new Date().toISOString(),
    likes: [],
    replies: [],
  };
  post.comments.push(newComment);
  updateUserStats()
}

function likeComment(comment) {
  if (!currentUser) return;
  if (!comment.likes.includes(currentUser.id)) comment.likes.push(currentUser.id);
}

function updateUserStats() {
  if (!currentUser) return;
  
  const postsByUser = posts.filter(p => p.userId === currentUser.id);
  const postCount = postsByUser.length;
  
  let likeCount = 0;
  let commentCount = 0;
  
  postsByUser.forEach(post => {
    likeCount += post.likes.length;
    commentCount += post.comments.length;
  });
  

document.getElementById('postCount').innerHTML = `
  <div style="text-align: center; background: transparent; border-radius: 5px; border: 1px solid gray; padding: 10px">
    <div style="font-weight: bold; font-size: 40px;">${postCount}</div>
    <div style="text-align: center; font-size: 15px; font-weight: bold;">Posts</div>
  </div><br>`;

document.getElementById('likeCount').innerHTML = `
  <div style="text-align: center; background: transparent; border-radius: 5px; border: 1px solid gray; padding: 10px">
    <div style="font-weight: bold; font-size: 40px;">${likeCount}</div>
    <div style="font-size: 15px; font-weight: bold;">Likes</div>
  </div><br>`;

document.getElementById('commentCount').innerHTML = `
  <div style="text-align: center; background: transparent; border-radius: 5px; border: 1px solid gray; padding: 10px;">
    <div style="font-weight: bold; font-size: 40px;">${commentCount}</div>
    <div style="font-size: 15px; font-weight: bold;">Comments</div>
  </div><br>`;

}

function addReplyToComment(comment, text) {
  if (!currentUser) return;
  const newReply = {
    id: generateId(),
    userId: currentUser.id,
    userEmail: currentUser.email,
    text,
    timestamp: new Date().toISOString(),
    likes: [],
    replies: [],
  };
  comment.replies.push(newReply);
}


function showLoadingBar(duration = 5500) {
  return new Promise(resolve => {
    const loader = document.createElement('div');
    loader.id = 'loaderBar';
    loader.style.position = 'fixed';
    loader.style.top = '0';
    loader.style.left = '0';
    loader.style.height = '4px';
    loader.style.background = '#00fff7';
    loader.style.width = '0%';
    loader.style.zIndex = '10000';
    loader.style.transition = `width ${duration}ms ease`;
    document.body.appendChild(loader);

    requestAnimationFrame(() => {
      loader.style.width = '100%';
    });

    setTimeout(() => {
      loader.remove();
      resolve();
    }, duration);
  });
}


async function showPage(pageId) {
  if (pageId === 'terms' || pageId === 'privacy') {
    await showLoadingBar(); // show loading bar before page loads
  }
  Object.values(pages).forEach(p => p.classList.add('hidden'));
  pages[pageId].classList.remove('hidden');

  clearFiltersIfNeeded(pageId);
  updateNavButtons(pageId);
  if (pageId === 'feed')
    renderPosts();
  if (pageId === 'profilePage')
    renderProfilePosts();
    removeInappropriatePosts();
    renderPosts();
  if (pageId === 'settings')
  removeInappropriatePosts();
    renderPosts();
  if (pageId === 'renderFriends')
    renderFriendsPage();
    
  if (pageId === 'signInPage')
    renderRecentAccounts();
  if (pageId === 'mentions')
     renderMentionsPage();
  if (pageId === 'reminderPage');
  if (pageId === 'welkom');
  if (pageId === 'uploadPage')
  removeInappropriatePosts();
    renderPosts();
    updateUsername();
    resetUploadForm();
};


// In-memory set for unviewed mentions during session

const unviewedMentions = new Set();
const allMentionIds = new Set(); // track all mention IDs seen so far to avoid re-adding viewed

function detectNewMention(post, email) {
  if (!email) return;
  const mentionRegex = new RegExp(
    `[~]${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
    'i'
  );
  return post.text && mentionRegex.test(post.text);
}

function getMentionsForUser(email) {
  const regex = new RegExp(`[~]${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
  const found = posts.filter(p => regex.test(p.text || '')).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  found.forEach(post => {
    if (!allMentionIds.has(post.id)) {   // only add truly new mentions
      allMentionIds.add(post.id);
      unviewedMentions.add(post.id);
    }
  });

  updateMentionsDot();
  return found;
}

function updateMentionsDot() {
  const btn = document.getElementById('navMentionsBtn');
  if (unviewedMentions.size > 0) {
    btn.classList.add('has-unviewed');
  } else {
    btn.classList.remove('has-unviewed');
  }
}

function renderMentionsPage() {
  if (!currentUser ||!currentUser.email) {
    mentionsPage.innerHTML = '<p>Please sign in to see mentions.</p>';
    return;
  }
  const mentions = getMentionsForUser(currentUser.email);
  mentionsPage.innerHTML = `<h2>Mentions for ${currentUser.email}</h2>`;
  if (mentions.length === 0) {
    mentionsPage.innerHTML += '<p>No mentions yet.</p>';
    return;
  }
  mentions.forEach(post => {
    const isNew = unviewedMentions.has(post.id);
    const mentionEl = document.createElement('div');
    mentionEl.className = 'mention-card';
    mentionEl.style.background = 'grey';
    mentionEl.style.borderRadius = '10px';
    mentionEl.style.marginTop = '10px';
    mentionEl.style.padding = '10px';
    mentionEl.style.boxShadow = '0 5px 20px gray';
    const escapedEmail = currentUser.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    mentionEl.innerHTML = `
      <strong>${post.userEmail || 'Unknown'}</strong> mentioned you ${isNew? '<span class="new-badge">NEW</span>': ''}
      <br />
      <small style="font-size: 9px; text-decoration: underline;">${new Date(post.timestamp).toLocaleString()}</small>
      <br>
      <p>${post.text?post.text.replace(new RegExp(`[~@]${escapedEmail}`, 'gi'), `<b>~${currentUser.email}</b>`): ''}</p>
    `;

    mentionEl.onclick = () => {
      showPage('feedPage');
      const postEl = document.getElementById(`post-${post.id}`);
      if (postEl) {
        postEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        postEl.style.backgroundColor = '#ffff99';
        setTimeout(() => (postEl.style.backgroundColor = ''), 2000);
      }
      unviewedMentions.delete(post.id); // mark as viewed
      updateMentionsDot();
      renderMentionsPage();
    };

    mentionsPage.appendChild(mentionEl);
  });
}

function setActiveNavButton(activeBtnId){
  document.querySelectorAll('nav button').forEach(btn => 
    btn.classList.toggle('active', btn.id  === activeBtnId)
  );
}
 // Add your words here

function containsBannedWords(text) {
  const lowerText = text.toLowerCase();
  return bannedWords.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lowerText);
  });
}

// Call this after loading posts or before rendering
function removeInappropriatePosts() {
  posts = posts.filter(post => {
    if (post.text && containsBannedWords(post.text)) {
      return false; // remove post with banned words
    }
    return true;
  });
}


document.getElementById('deleteAccountBtn').addEventListener('click', () => {
  if (!currentUser ||!currentUser.id) {
    showModal('You must be signed in to delete your account.');
    return;
  }

showConfirm('Are you sure you want to delete your account? This action cannot be undone.')
  .then(result => {
    if (result) {
      // Remove user from users array
      const index = users.findIndex(u => u.id === currentUser.id);
      if (index !== -1) {
        users.splice(index, 1);
        localStorage.setItem('users', JSON.stringify(users));
      }

      // Clear current user session
      currentUser = null;
      localStorage.removeItem('currentUser');

      showModal('Your account has been deleted!');
      setTimeout(() => {
        showPage('signInPage');
      }, 1000);
      showPage('signInPage');
      updateUsername();
      renderBlockedUsers();
      renderPosts();
      updateNavButtons('signInPage');
    }
  });
});

function showModal(message) {
  return new Promise(resolve => {
    modalText.textContent = message;
    modal.style.display = 'flex';

    function close() {
      modal.style.display = 'none';
      modalOk.removeEventListener('click', close);
      document.removeEventListener('click', handleDocClick);
      resolve();
    }

    function handleDocClick(e) {
      close();
    }

    modalOk.addEventListener('click', close);
    // Add listener after a tick to avoid immediate close:
    setTimeout(() => {
      document.addEventListener('click', handleDocClick);
    }, 0);
  });
}
  
function showUserProfile(userId) {  
  showPage('profilePage');  
  const user = users.find(u => u.id === userId);  
  document.getElementById('profileUserHeader').innerText = user? `${user.email}'s Posts`: 'User Posts';  
  const userPosts = posts.filter(p => p.userId === userId);  
  const profilePosts = document.getElementById('profilePosts');  
  profilePosts.innerHTML = '';  
  if(userPosts.length === 0) {  
    profilePosts.innerHTML = '<p>No posts by this user.</p>';  
  } else {  
    userPosts.forEach(post => {  
      const postEl = createPostElement(post); 
      profilePosts.appendChild(postEl);  
    });  
  }  
  
  // Handle Edit Account button:  
  const editBtn = document.getElementById('editAccountBtn');  
  if(currentUser && currentUser.id === userId) {  
    editBtn.style.display = 'inline-block';  
    editBtn.onclick = () => showPage('editAccountPage');  
  } else {  
    editBtn.style.display = 'none';  
    editBtn.onclick = null;  
  }  
}  


function updateCommentSector(postId, showAll = false) {  
  const post = posts.find(p => p.id === postId);  
  const commentSection = document.getElementById(`comment-section-${postId}`);  
  if (!commentSection) return;  

  commentSection.innerHTML = ''; // clear

  if (post.comments.length === 0) {  
    commentSection.textContent = 'No comments yet';  
    return;  
  }  

  const commentsToShow = showAll? post.comments: post.comments.slice(0, 0);

  commentsToShow.forEach(c => {  
    commentSection.appendChild(createCommentElement(post, c));  
  });  

  if (post.comments.length > 0) {  
    const toggle = document.createElement('div');  
    toggle.style.color = 'var(--primary)';  
    toggle.style.position = 'absolute';
    toggle.style.cursor = 'pointer';  
  

    if (!showAll) {  
      toggle.textContent = `View all ${post.comments.length} comments...`;  
      toggle.onclick = () => updateCommentSector(postId, true);  
    } else {  
      toggle.textContent = 'Ckose comments';  
      toggle.onclick = () => updateCommentSector(postId, false);  
    }  
    commentSection.appendChild(toggle);  
  }  
}


function updateNavButtons(current) {
  // Show/hide buttons depending on auth state
  document.getElementById('navSignInBtn').style.display = currentUser ? 'none' : 'inline-block';
  document.getElementById('navSignUpBtn').style.display = currentUser ? 'none' : 'inline-block';
  document.getElementById('navProfileBtn').style.display = currentUser ? 'inline-block' : 'none';
  document.getElementById('navfriends').style.display = currentUser ? 'inline-block' : 'none';
  document.getElementById('navMentionsBtn').style.display = currentUser ? 'inline-block': 'none';
  document.getElementById('navUploadBtn').style.display = currentUser ? 'inline-block' : 'none';
}
function clearFiltersIfNeeded(pageId) {
  if(pageId !== 'feedPage') {
    currentFilter = 'all';
    currentHashtagFilter = null;
    document.getElementById('hashtagFilter').textContent = 'None';
  }
}

document.getElementById('signInForm').addEventListener('submit', e => {  
  e.preventDefault();  
  let email = document.getElementById('signInEmail').value.trim();  
  let password = document.getElementById('signInPassword').value;  
  signIn(email, password);  
});  



function unblockUser(userId) {
  blockedUsers = blockedUsers.filter(id => id!== userId);
  localStorage.setItem('blockedUsers_' + currentUser.id, JSON.stringify(blockedUsers));
}



// Load current user's blocked list


function renderBlockedUsers() {
  const blockedListEl = document.getElementById('blockedUsersList');
  blockedListEl.innerHTML = '';
  if (blockedUsers.length === 0) {
    blockedListEl.textContent = 'No blocked users';
    return;
  }
  blockedUsers.forEach(userId => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const div = document.createElement('div');
    div.textContent = user.email;
    const unblockBtn = document.createElement('button');
    unblockBtn.textContent = 'Unblock';
    unblockBtn.style.background = '#ee0979';
    unblockBtn.style.color = 'white';
    unblockBtn.style.borderRadius = '10px';
    unblockBtn.style.marginLeft = '5px';
    unblockBtn.onclick = () => {
      blockedUsers = blockedUsers.filter(id => id!== userId);
      localStorage.setItem('blockedUsers_' + currentUser.id, JSON.stringify(blockedUsers));
      renderBlockedUsers();
      renderPosts();
    };
    div.appendChild(unblockBtn);
    blockedListEl.appendChild(div);
  });
}




// Event Listeners for Nav Buttons
document.getElementById('navFeedBtn').addEventListener('click', () => showPage('feedPage'));
document.getElementById('navUploadBtn').addEventListener('click', () => {
  if(!currentUser) {
    showModal('You must be signed in to upload');
    showPage('signInPage');
    return;
  }
  showPage('uploadPage');
});
document.getElementById('navProfileBtn').addEventListener('click', () => {
  if(!currentUser) {
    showModal('You must be signed in to view profile');
    showPage('signInPage');
    return;
  }
  showPage('profilePage');
});
document.getElementById('seter').addEventListener('click', () => {
  showPage('settings');
});
document.getElementById('navMentionsBtn').addEventListener('click', () => {
  showPage('mentions');
});
document.getElementById('termsBtn2').onclick = async () => {
  showPage('terms');
}
document.getElementById('forgotPasswordLink').addEventListener('click', () => {
  showPage('reminderPage');
});

function showReminder(){
  showPage('reminderPage');
}

document.getElementById('privacyBtn').addEventListener('click', () => {
  showPage('privacy');
});

document.getElementById('termsBtn').addEventListener('click', () => {
  showPage('terms');
})

document.getElementById('nextToIt').addEventListener('click', () => {
  showPage('feedPage');
})

document.getElementById('navfriends').addEventListener('click', () => {
  showPage('renderFriends');
})

document.getElementById('navSignInBtn').addEventListener('click', () => showPage('signInPage'));
document.getElementById('navSignUpBtn').addEventListener('click', () => showPage('signUpPage'));

// Theme toggl
const themeToggle = document.getElementById('themeToggle');

// On page load, apply saved theme
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    themeToggle.checked = true;
  } else {
    document.body.classList.remove('dark');
    themeToggle.checked = false;
  }
});

themeToggle.addEventListener('change', e => {
  if(e.target.checked) {
    document.body.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
});


// Sign Up form

document.getElementById('reminderForm').addEventListener('submit', e => {
  e.preventDefault();

  const email = document.getElementById('reminderEmail').value.trim().toLowerCase();
  const code = document.getElementById('reminderPasscode').value.trim();
  const newPassword = document.getElementById('reminderNewPassword').value;

  const usersArr = JSON.parse(localStorage.getItem('users')) || [];
  const userIndex = usersArr.findIndex(u => u.email.toLowerCase() === email && u.passcode === code);

  if (userIndex === -1) {
    showModal('Email and passcode do not match');
    return;
  }

  usersArr[userIndex].password = newPassword;

  const inMemoryIndex = users.findIndex(u => u.email.toLowerCase() === email);
  if (inMemoryIndex!== -1) {
    users[inMemoryIndex].password = newPassword;
  }

  localStorage.setItem('users', JSON.stringify(usersArr));
  showModal('Password updated successfully! You can now sign in.');

  // Reset form inputs here:
  document.getElementById('reminderForm').reset();

  showPage('signInPage');
});


// Upload Page Logic
const uploadTypeSelect = document.getElementById('uploadType');  
const mediaInputWrapper = document.getElementById('mediaInputWrapper');  
const uploadPreview = document.getElementById('uploadPreview');

// create visible cover

uploadTypeSelect.addEventListener('change', () => {  
  mediaInputWrapper.innerHTML = '';  
  uploadPreview.innerHTML = '';  
  const type = uploadTypeSelect.value;  
  if(type === 'text' || !type) return;  
  
  const fileInput = document.createElement('input');  
  fileInput.type = 'file';  
  fileInput.style.position = 'relative';
  fileInput.style.width = '100%';
  fileInput.style.height = '40px';
  fileInput.style.opacity = '0';
  fileInput.style.cursor = 'pointer';
  fileInput.style.zIndex = '1';
  fileInput.accept = type + '/*';  
  fileInput.required = true;  
  mediaInputWrapper.appendChild(fileInput);  
  
  // create fake visible button placed over the native input
  const fakeBtn = document.createElement('button');
  fakeBtn.type = 'button';
  fakeBtn.className = 'fake-file-btn';
  fakeBtn.textContent = 'Choose media';
  fakeBtn.style.position = 'absolute';
  fakeBtn.style.left = '12px';
  fakeBtn.style.top = '50%';
  fakeBtn.style.transform = 'translateY(-50%)';
  fakeBtn.style.height = '36px';
  fakeBtn.style.padding = '0 12px';
  fakeBtn.style.borderRadius = '8px';
  fakeBtn.style.border = '0';
  fakeBtn.style.background = 'linear-gradient(180deg,#4f46e5,#4338ca)';
  fakeBtn.style.color = '#fff';
  fakeBtn.style.fontWeight = '600';
  fakeBtn.style.zIndex = '2';
  fakeBtn.style.pointerEvents = 'none'; // IMPORTANT: let clicks pass to native input
  
  // wrapper must be positioned so absolute children align over it
  mediaInputWrapper.style.position = mediaInputWrapper.style.position || 'relative';
  mediaInputWrapper.appendChild(fakeBtn);
  mediaInputWrapper.appendChild(fileInput);

  
  fileInput.addEventListener('change', () => {  
    if(fileInput.files.length === 0) {  
      uploadPreview.innerHTML = '';  
      return;  
    }  
    const file = fileInput.files[0];  
    
  if (fileInput.files.length === 0) return;
  const type = uploadTypeSelect.value.toLowerCase();
  const name = file.name.toLowerCase();

  if ((type === 'video' &&!name.endsWith('.mp4') &&!name.endsWith('.mov')) ||
      (type === 'image' &&!name.match(/.(jpg|jpeg|png|webp|gif)$/)) ||
      (type === 'audio' &&!name.match(/.(mp3|wav|ogg)$/))) {
    showModal(`Please select a valid ${type} file with correct extension.`);
    fileInput.value = '';
    uploadPreview.innerHTML = '';
    return;
  }

    const url = URL.createObjectURL(file);  
    uploadPreview.innerHTML = '';  
  
    let mediaElem;  
    if(type === 'image') {  
      mediaElem = document.createElement('img');  
      mediaElem.src = url;  
      mediaElem.className = 'media-preview';  
    } else if(type === 'video') {  
      mediaElem = document.createElement('video');  
      mediaElem.src = url;  
      mediaElem.controls = true;  
      mediaElem.className = 'media-preview';  
      mediaElem.setAttribute('controlsList', 'nodownload');  
    } else if(type === 'audio') {  
      mediaElem = document.createElement('audio');  
      mediaElem.src = url;  
      mediaElem.controls = true;  
      mediaElem.className = 'media-preview';  
    }  
    if(mediaElem) uploadPreview.appendChild(mediaElem);  
  });  
});  

function resetUploadForm() {
  document.getElementById('uploadForm').reset();
  mediaInputWrapper.innerHTML = '';
  uploadPreview.innerHTML = '';
}

// Upload form submit
document.getElementById('uploadForm').addEventListener('submit', e => {
  e.preventDefault();
  if(!currentUser) {
    showModal('You must be signed in to post');
    showPage('signInPage');
    return;
  }
  const type = uploadTypeSelect.value;
  if(!type) {
    showModal('Select a media type');
    return;
  }
  let mediaData = null;
  if(type !== 'text') {
    const fileInput = mediaInputWrapper.querySelector('input[type=file]');
    if(!fileInput || fileInput.files.length === 0) {
      showModal('Select a file to upload');
      return;
    }
    const file = fileInput.files[0];
    // For demo: store file as object URL (in real app, upload to server)
    mediaData = URL.createObjectURL(file);
  }
  const texting = document.getElementById('postText').value.trim();
  const text = escapeHtml(texting);
  const hashtags = extractHashtags(text);

  const newPost = {
    id: generateId(),
    userId: currentUser.id,
    userEmail: currentUser.email,
    type,
    mediaData,
    text,
    hashtags,
    timestamp: new Date(),
    likes: [],
    comments: [],
    reports: 0,
  };
  async function upload(){
  posts.unshift(newPost);
  console.log('upload openes');
  await showModal('Post uploaded');
  console.log('upload closed');
  resetUploadForm();
  showPage('feedPage');
  };
  upload();
});



const hashtagFilterEl = document.getElementById('hashtagFilter');
document.querySelectorAll('.filter-bar button[data-filter]').forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.getAttribute('data-filter');
    currentHashtagFilter = null;
    hashtagFilterEl.textContent = 'None';
    removeInappropriatePosts();
    updateOfficialStatus();
    syncCurrentUserOfficialFlag();
    updateUserStats();
    renderPosts();
  });
});
hashtagFilterEl.addEventListener('click', () => {
  currentHashtagFilter = null;
  hashtagFilterEl.textContent = 'None';
  removeInappropriatePosts();
  updateOfficialStatus();
  syncCurrentUserOfficialFlag();
  updateUserStats()
  renderPosts();
});

function loadBlockedUsers() {
  if (currentUser && currentUser.id) {
    blockedUsers = JSON.parse(localStorage.getItem('blockedUsers_' + currentUser.id)) || [];
  } else {
    blockedUsers = [];
  }
}

function blockUser(userId) {
  if (!blockedUsers.includes(userId)) {
    blockedUsers.push(userId);
    localStorage.setItem('blockedUsers_' + currentUser.id, JSON.stringify(blockedUsers));
  }
}

function unblockUser(userId) {
  blockedUsers = blockedUsers.filter(id => id!== userId);
  localStorage.setItem('blockedUsers_' + currentUser.id, JSON.stringify(blockedUsers));
}

// Call this after login or on page load:

function renderPosts() {
  postsContainer.innerHTML = '';
  let filtered = posts;

  if(currentFilter!== 'all') {
    filtered = filtered.filter(p => p.type === currentFilter);
  }
  if(currentHashtagFilter) {
    filtered = filtered.filter(p => p.hashtags.includes(currentHashtagFilter));
  }
  // Only filter blocked users if currentUser logged in
  if (currentUser && blockedUsers.length > 0) {
    filtered = filtered.filter(p =>!blockedUsers.includes(p.userId));
  }

  if(filtered.length === 0) {
    postsContainer.innerHTML = `<svg class="noPosts" width="300" height="300" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" fill="none">
      <rect x="20" y="40" width="160" height="120" rx="12" ry="12" stroke-width="2"></rect>
      <rect x="50" y="70" width="100" height="60" rx="8" ry="8" fill="#ddd"></rect>
      <circle cx="80" cy="90" r="10" fill="#bbb"></circle>
      <path d="M65 110l15-20 15 10 15-15 20 25" stroke="#aaa" stroke-width="2" fill="#aaa"></path>
      <text x="100" y="150" text-anchor="middle" font-size="14" fill="white">No Posts Found</text>
    </svg>`;
    return;
  }

  filtered.forEach(post => {
    const postEl = createPostElement(post);
    postsContainer.appendChild(postEl);
  });

  // User email/profile features
  document.querySelectorAll('.user-email').forEach(el => {
    el.onclick = function() {
      const userId = this.getAttribute('data-userid');
      showUserProfile(userId);
    };
  });

  // Search functionality
  const search = () => {
    const email = document.getElementById('emailSearchInput').value.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === email);

    const profileUserHeader = document.getElementById('profileUserHeader');
    const profilePosts = document.getElementById('profilePosts');
    profilePosts.innerHTML = '';

    if (!user) {
      profileUserHeader.innerText = 'User not found';
      return;
    }

    profileUserHeader.innerText = `${user.email}'s Posts`;
    const userPosts = posts.filter(p => p.userId === user.id);
    if (userPosts.length === 0) {
      profilePosts.innerHTML = '<p>No posts by this user.</p>';
      return;
    }
    userPosts.forEach(post => {
      profilePosts.appendChild(createPostElement(post));
    });
  };

  document.getElementById('emailSearchInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      search();
    }
  });

  setupMediaPause();
  
}


function setupMediaPause() {
  const mediaElements = document.querySelectorAll('audio, video');
  mediaElements.forEach(media => {
    media.addEventListener('play', () => {
      mediaElements.forEach(other => {
        if (other!== media) other.pause();
      });
    });
  });
}

function addPostToDOM(post) {
  const postEl = createPostElement(post);
  postsContainer.prepend(postEl);
}


function truncateEmail(email, maxLen = 7) {  
  if (!email || typeof email !== 'string') return 'Unknown';  // ✅ prevents crash  
  return email.length > maxLen ? email.slice(0, maxLen) + '...' : email;  
}

function createPostElement(post) {
  const el = document.createElement('article');
  el.className = 'post';

  const commentSection = document.createElement('div');
  commentSection.className = 'comment-section';
  el.id = `post-${post.id}`;
  commentSection.id = `comment-section-${post.id}`;
  el.dataset.timestamp = post.timestamp;
  
  const user = users.find(u => u.id === post.userId);
  const isOfficial = user && user.isOfficial; // make sure you set this property elsewhere

const officialIcon = `

<svg width="16" height="16" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-left: 4px;">
  <polygon points="32,4 56,16 56,48 32,60 8,48 8,16" 
           fill="#0f0f1a" 
           stroke="#00fff7" 
           stroke-width="2"
           filter="url(#glow)"></polygon>
  <path d="M22 33 L29 40 L44 24" 
        stroke="#00fff7" 
        stroke-width="4" 
        fill="none" 
        stroke-linecap="round" 
        stroke-linejoin="round"></path>
</svg>`;

const header = document.createElement('div');
header.className = 'post-header';
header.innerHTML = `
  <strong class="user-email" data-userId="${post.userId}" style="cursor: pointer;">
    ${truncateEmail(post.userEmail)}${user && user.isOfficial? officialIcon: ''}
  </strong>
  <p style="font-weight: bold;" class="head">Nuvlo</p>
  <span class="post-meta">${timeAgo(new Date(post.timestamp))}</span>
`;

  el.appendChild(header);

  // Report button
  const reportBtn = document.createElement('button');
  reportBtn.className = 'report-btn';
  reportBtn.title = 'Report Post';
  reportBtn.innerHTML = svgReport;

// Report button click handler inside createPostElement()

reportBtn.addEventListener('click', () => {
  if(!currentUser) {
    showModal('Sign in to report posts');
    showPage('signInPage');
    return;
  }
  showConfirm('Are you sure you want to report this post?').then(confirmed => {
    if (!confirmed) return;

    if (!post.reports) post.reports = [];
    if (!post.reports.includes(currentUser.id)) {
      post.reports.push(currentUser.id);
      if (post.reports.length >= 3) {
        posts = posts.filter(p => p.id!== post.id);
        showModal('Post has been hidden due to multiple reports.');
      } else {
        showModal('Post reported. Thank you!');
      }
      localStorage.setItem('posts', JSON.stringify(posts));
      renderPosts();
    } else {
      showModal('You already reported this post.');
    }
  });
});


  el.appendChild(reportBtn);
  
  // Block button for other users (only if logged in and not your own post)
if (currentUser && post.userId!== currentUser.id) {
  const blockBtn = document.createElement('button');
  blockBtn.innerHTML = blockedUsers.includes(post.userId)? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10" color="var(--secondary)" ></circle>
  <circle cx="12" cy="8" r="3" color="var(--primary)"></circle>
  <path d="M8 16c1-2 7-2 8 0" color="var(--primary)"></path></svg>`: `<svg class="Blck" svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10" color="red"></circle>
  <circle cx="12" cy="8" r="3" color="var(--primary)" ></circle>
  <path d="M8 16c1-2 7-2 8 0" color="var(--primary)" ></path>
  <line x1="6" y1="6" x2="18" y2="18" color="red" ></line></svg>`;
  blockBtn.className = 'block-btn';
  blockBtn.style.marginLeft = '6px';
blockBtn.onclick = () => {
  if (!currentUser ||!currentUser.id) return;
  if (blockedUsers.includes(post.userId)) {
    unblockUser(post.userId);
  } else {
    blockUser(post.userId);
  }
  renderBlockedUsers();
  renderPosts();
  showUserProfile(userId);
  updateOfficialStatus();
  syncCurrentUserOfficialFlag();
}

  el.appendChild(blockBtn);
} 


const bannedWords = ['badword1', 'badword2', 'offensive']; // add your list here



if (post.type === 'text' && post.text) {
  if (containsBannedWords(post.text)) {
    return el.innerHTML = escapeHtml(post.text); // or handle as needed
  }

  if (!post.text || post.text.trim() === '') {
  showModal('Post text cannot be empty');
  return null;
  }
  const tePSection = document.createElement('div');
  tePSection.className = 'teP-section';
  const textDiv = document.createElement('div');
  textDiv.className = 'text-content';
  textDiv.innerHTML = linkifyMentions(linkifyHashtags(post.text));
  tePSection.appendChild(textDiv);
  el.appendChild(tePSection);
}


else if(post.mediaData) {
    let container;
    let mediaElem;
    
    // Create common overlay for images and videos
    let textOverlay = document.createElement('div');
    textOverlay.textContent = 'Nuvlo';
    textOverlay.style.position = 'absolute';
    textOverlay.style.fontWeight = 'bold';
    textOverlay.style.bottom = '5px';
    textOverlay.style.left = '5px';
    textOverlay.style.width = '100%';
    textOverlay.style.color = 'white';
    textOverlay.style.background = 'transparent';
    textOverlay.style.zIndex = '1000';
    textOverlay.style.textAlign = 'left';
    textOverlay.style.padding = '2px 0';
    textOverlay.style.pointerEvents = 'none'; // so overlay text doesn't block controls
    if(post.type === 'image') {
      container = document.createElement('div');
      container.style.position = 'relative';
      container.style.display = 'inline-block';
      
      mediaElem = document.createElement('img');
      mediaElem.src = post.mediaData;
      mediaElem.className = 'media-preview';
      mediaElem.style.display = 'block';
      mediaElem.style.borderRadius = '10px';
      
      container.appendChild(mediaElem);
      container.appendChild(textOverlay);
      el.appendChild(container);

} 
else if (post.type === 'audio'){
  
  // Map to track audio elements and their play buttons
const audioMap = new Map();
let radius = 10;


// Create audio element without controls
const audio = document.createElement('audio');
audio.style.color = 'white';
audio.src = post.mediaData;
audio.style.width = '100%';

audio.controls = false;
el.appendChild(audio);

// Create and style canvas for visualizer

// Resume AudioContext on play and start visualize

// Create custom controls container
const controls = document.createElement('div');
controls.className = 'custom-audio-controls';


controls.style.background = 'white';
controls.style.padding = '10px';
controls.style.borderRadius = '10px';
controls.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';

// Create canvas for visualizer


// Play/Pause button
const playPauseBtn = document.createElement('button');
playPauseBtn.innerHTML = `
<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path 
    d="M7 5.5C7 4.8 7.8 4.3 8.4 4.6L18.7 10.4C19.4 10.8 19.4 11.8 18.7 12.2L8.4 18C7.8 18.4 7 17.9 7 17.2V5.5Z" 
    fill="currentColor"></path>
</svg>
`;
controls.appendChild(playPauseBtn);
playPauseBtn.style.position = 'absolute';
playPauseBtn.style.left = '42%';
playPauseBtn.style.fontSize='17px';
playPauseBtn.style.background = 'transparent';
playPauseBtn.style.borderRadius = '10px';
playPauseBtn.style.marginTop = '10px';

// Mute button
const muteBtn = document.createElement('button');
muteBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
  <path d="M5 9V15H9L14 20V4L9 9H5Z" fill="black"></path>
  <line x1="18" y1="6" x2="22" y2="10" stroke="black" stroke-width="2" stroke-linecap="round"></line>
  <line x1="22" y1="6" x2="18" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
</svg>`;
muteBtn.style.position = 'absolute';
muteBtn.style.left = '80%';
muteBtn.style.marginTop = '20px';
controls.appendChild(muteBtn);

// Time display
const timeDisplay = document.createElement('span');
timeDisplay.style.marginLeft = '10px';
timeDisplay.style.fontSize = '14px';
timeDisplay.style.fontWeight = 'bold';
timeDisplay.textContent = '0:00 ~ 0:00';
controls.appendChild(timeDisplay);

// Progress bar container
const progressContainer = document.createElement('div');
progressContainer.style.position = 'relative';
progressContainer.style.width = '100%';
progressContainer.style.height = '10px';
progressContainer.style.background = '#eee';
progressContainer.style.borderRadius = '10px';
progressContainer.style.marginTop = '50px';
progressContainer.style.cursor = 'pointer';

// Progress filled bar
const progressBar = document.createElement('div');
progressBar.style.background = 'black';
progressBar.style.height = '100%';
progressBar.style.borderRadius = '10px';
progressBar.style.width = '0%';
progressContainer.appendChild(progressBar);

controls.appendChild(progressContainer);
el.appendChild(controls);

// Store this audio and its play button
audioMap.set(audio, playPauseBtn);


// Format time helper
function formatTime(sec) {
  if (isNaN(sec) || sec === Infinity) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10? '0' + s: s}`;
}

// Play/Pause toggle
playPauseBtn.onclick = () => {
  
  if (audio.paused) {
  

    audioMap.forEach((btn, otherAudio) => {
      if (otherAudio!== audio &&!otherAudio.paused) {
        otherAudio.pause();
        btn.innerHTML = `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path 
    d="M7 5.5C7 4.8 7.8 4.3 8.4 4.6L18.7 10.4C19.4 10.8 19.4 11.8 18.7 12.2L8.4 18C7.8 18.4 7 17.9 7 17.2V5.5Z" 
    fill="currentColor"></path>
</svg>`;
      }
      
    });
    audio.play();
    
    playPauseBtn.innerHTML = `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="6" y="4" width="4" height="16" fill="currentColor"></rect>
  <rect x="14" y="4" width="4" height="16" fill="currentColor"></rect>
</svg>`;
  } else {
    audio.pause();
    playPauseBtn.innerHTML = `
<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path 
    d="M7 5.5C7 4.8 7.8 4.3 8.4 4.6L18.7 10.4C19.4 10.8 19.4 11.8 18.7 12.2L8.4 18C7.8 18.4 7 17.9 7 17.2V5.5Z" 
    fill="currentColor"></path>
</svg>`;
  }
};

audio.onpause = () => playPauseBtn.innerHTML =  `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path 
    d="M7 5.5C7 4.8 7.8 4.3 8.4 4.6L18.7 10.4C19.4 10.8 19.4 11.8 18.7 12.2L8.4 18C7.8 18.4 7 17.9 7 17.2V5.5Z" 
    fill="currentColor"></path>
</svg>`;
audio.onended = () => playPauseBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="6" y="4" width="4" height="16" fill="currentColor"></rect>
  <rect x="14" y="4" width="4" height="16" fill="currentColor"></rect>
</svg>`;

// Mute toggle
muteBtn.onclick = () => {
  audio.muted =!audio.muted;
  muteBtn.innerHTML = audio.muted? `<svg width="24" height="24" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
  <path d="M5 9V15H9L14 20V4L9 9H5Z" fill="black"></path>
  <path d="M16.5 9C17.88 10.36 18.5 12 18.5 12C18.5 12 18.5 13.64 17.12 15" stroke="black" stroke-width="2" stroke-linecap="round"></path>
  <path d="M19 6.5C20.5 8 21.5 10 21.5 12C21.5 14 20.5 16 19 17.5" stroke="black" stroke-width="2" stroke-linecap="round"></path>
</svg>`: `<svg width="24" height="24" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
  <path d="M5 9V15H9L14 20V4L9 9H5Z" fill="black"></path>
  <line x1="18" y1="6" x2="22" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
  <line x1="22" y1="6" x2="18" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
</svg>`;
};

const progressDot = document.createElement('div');
progressDot.style.position = 'absolute';
progressDot.style.top = '-5px';  // slightly above the bar center
progressDot.style.left = '0%';
progressDot.style.width = '16px';
progressDot.style.height = '16px';
progressDot.style.borderRadius = '50%';
progressDot.style.backgroundColor = 'black';
progressDot.style.border = '2px solid white';
progressDot.style.transition = 'left 0.1s linear';
progressContainer.appendChild(progressDot);

audio.ontimeupdate = () => {
  const percent = (audio.currentTime / audio.duration) * 100 || 0;
  progressBar.style.width = percent + '%';
  progressDot.style.left = `calc(${percent}% - 8px)`; // center dot, minus half width
  const current = formatTime(audio.currentTime);
  const duration = formatTime(audio.duration || 0);
  timeDisplay.textContent = `${current} ~ ${duration}`;
};


// Seek functionality
progressContainer.onclick = (e) => {
  const rect = progressContainer.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const width = rect.width;
  const newTime = (clickX / width) * audio.duration;
  audio.currentTime = newTime;
};
}

else if (post.type === 'video') {
  container = document.createElement('div');
  container.style.position = 'relative';
  container.style.display = 'inline-block';

  const mediaElem = document.createElement('video');
  mediaElem.src = post.mediaData;
  mediaElem.controls = true;
  mediaElem.className = 'media-preview';
  mediaElem.setAttribute('controlsList', 'nodownload noplaybackrate nofullscreen');
  mediaElem.style.borderRadius = '10px';
  mediaElem.style.display = 'block';

  // Jump to 1 second frame once metadata is loaded
  mediaElem.addEventListener('loadedmetadata', () => {
    mediaElem.currentTime = 0;
  });
  
  
mediaElem.addEventListener('ended', () => {
  mediaElem.currentTime = 0;
  mediaElem.play();
});

  mediaElem.addEventListener('dblclick', e => {
    e.preventDefault();
    e.stopPropagation();
  });

  container.appendChild(mediaElem);
  container.appendChild(textOverlay);
  el.appendChild(container);

}



if(post.mediaData) {
  const collapsedMaxChars = 10;

  // Only show toggle if text longer than 10 chars
  if(post.text.length > 10) {
    const previewText = post.text.length > collapsedMaxChars? post.text.slice(0, collapsedMaxChars) + '...': post.text;
  

    const previewDiv = document.createElement('div');
    previewDiv.className = 'preview-text';
    previewDiv.textContent = previewText;

    const fullDiv = document.createElement('div');
    fullDiv.className = 'full-text';
    fullDiv.textContent = escapeHtml(post.text);
    fullDiv.style.display = 'none';

    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'See more';
    toggleBtn.style.cursor = 'pointer';
    toggleBtn.style.border = 'none';
    toggleBtn.style.background = 'none';
    toggleBtn.style.color = 'var(--primary)';
    toggleBtn.style.padding = '0';
    toggleBtn.style.marginTop = '4px';

    toggleBtn.onclick = () => {
      const showingFull = fullDiv.style.display === 'block';
      fullDiv.style.display = showingFull? 'none': 'block';
      previewDiv.style.display = showingFull? 'block': 'none';
      toggleBtn.textContent = showingFull? 'See more': 'See less';
    };

    const textContainer = document.createElement('div');
    textContainer.appendChild(previewDiv);
    textContainer.className = 'textC';
    textContainer.appendChild(fullDiv);
    textContainer.appendChild(toggleBtn);

    el.appendChild(textContainer);
  } else {
  const textDiv = document.createElement('div');
textDiv.className = 'text-content';
textDiv.style.fontWeight = 'bold';
textDiv.innerHTML = escapeHtml(post.text).replace(/\n/g, '<br>'); // show full text, no toggle needed
el.appendChild(textDiv);
    
  }
} else if(post.text) {
  // For pure text posts less than or equal to 10 chars — just show them
  const tePSection = document.createElement('div');
  tePSection.className = 'teP-section';
  const shortTextDiv = document.createElement('div')
  shortTextDiv.className = 'text-content';
  shortTextDiv.style.marginTop = '5px';
  shortTextDiv.textContent = post.text;
  tePSection.appendChild(shortTextDiv);
  el.appendChild(tePSection);
}``
    }
  // Like button & like count
  const likeBtn = document.createElement('button');
  likeBtn.className = 'like-btn';
  likeBtn.innerHTML = svgLike(post.likes.includes(currentUser?.id));
  likeBtn.title = 'Like/Unlike';
  const likeCount = document.createElement('span');
  likeCount.textContent = ` ${post.likes.length}`;
  likeCount.className = 'like-count';
  likeCount.style.fontSize = '13px';
  likeCount.style.fontWeight = 'bold';
  likeCount.style.marginLeft = '4px';
  
  
  // Toggle without full refresh
  likeBtn.addEventListener('click', () => {
    if(!currentUser) {
      showModal('Sign in to like posts');
      showPage('signInPage');
      return;
    }
    const idx = post.likes.indexOf(currentUser.id);
    if(idx >= 0) post.likes.splice(idx, 1);
    else post.likes.push(currentUser.id);
    
    
    // Update just UI bits:
    likeBtn.innerHTML = svgLike(post.likes.includes(currentUser?.id));
    likeBtn.classList.toggle('liked');
    likeCount.textContent = ` ${post.likes.length}`;
    updateUserStats();
    updateOfficialStatus();
    syncCurrentUserOfficialFlag();
  });
  
  el.appendChild(likeBtn);
  el.appendChild(likeCount);

  // Comment toggle button
  const commentToggleBtn = document.createElement('button');
  commentToggleBtn.title = 'Comments';
  commentToggleBtn.innerHTML = svgComment;
  commentToggleBtn.addEventListener('click', () => {
    if(!currentUser) {
      showModal('Sign in to comment');
      showPage('signInPage');
      return;
    }
    commentTarget = { postId: post.id };
    openCommentModal();
  });
  el.appendChild(commentToggleBtn);
  
    if (currentUser && post.userId!== currentUser.id) {
  const shareBtn = document.createElement('button');
  shareBtn.className = 'share-btn';
  shareBtn.innerHTML = `
<svg width="100" height="26" viewBox="0 -5 100 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 9V5L57 12L50 19V15C43 15 40 18 39 21C40 16 43 9 50 9Z" fill="transparent"></path>
</svg>`;
  shareBtn.style.marginLeft = '167px';
shareBtn.onclick = () => {
  const originalPost = findOriginalPost(post);
  originalPost.shareCount = (originalPost.shareCount || 0) + 1;
  // Create repost referencing original post
  const repost = {...post,
    id: generateId(),
    userId: currentUser.id,
    userEmail: currentUser.email,
    timestamp: new Date().toISOString(),
    originalPostId: originalPost.id,
    likes: [],
    reports: 0,
    comments: [],
  };
  const postId = generateId;
  const mentionerEmail = currentUser;

  const currentUserEmail = currentUser;

  posts.unshift(repost);
  removeInappropriatePosts();
  updateOfficialStatus();
  syncCurrentUserOfficialFlag();
  updateUserStats();
  renderPosts();
  showModal('Reposted');
};

  el.appendChild(shareBtn);
}

  // Comments section (only top-level comments preview)

  // Comments section (only top-level comments preview)

  if(post.comments.length === 0) {
    commentSection.textContent = 'Be the first to comment';
  } else {
    // Only show first 3 by default
    post.comments.slice(0,0).forEach(c => {
      const commentEl = createCommentElement(post, c);
      commentSection.appendChild(commentEl);
    });

    // Show "View all" if there are more than 3 comments
    // In your createPostElement or equivalent:
    if (post.comments.length === 0) {
      commentSection.textContent = 'Be the first to comment';
    } else {
      // Store expanded/collapsed state on the post object
      if (typeof post.commentsExpanded!== "boolean") {
        post.commentsExpanded = false;
      }
      function renderComments() {
        commentSection.innerHTML = '';
        const expanded = post.commentsExpanded;
        const commentsToShow = expanded? post.comments: post.comments.slice(0, 0);
        commentsToShow.forEach(c => {
          commentSection.appendChild(createCommentElement(post, c));
        });
        if (post.comments.length > 0) {
          const toggleBtn = document.createElement('div');
          toggleBtn.textContent = expanded? 'Close comments': `View all ${post.comments.length} comments...`;
          toggleBtn.style.color = 'var(--primary)';
          toggleBtn.style.position = 'absolute';
          toggleBtn.style.cursor = 'pointer';
          toggleBtn.onclick = () => {
            post.commentsExpanded =!post.commentsExpanded;
            renderComments();
            syncCurrentUserOfficialFlag()
          };
          commentSection.appendChild(toggleBtn);
        }
      }
      renderComments();
      syncCurrentUserOfficialFlag()
    }
  }
  el.appendChild(commentSection);
  
// Helper to find ultimate original post (follow chain)
function findOriginalPost(post) {
  let orig = post;
  while (orig.originalPostId) {
    orig = posts.find(p => p.id === orig.originalPostId) || orig;
  }
  return orig;
}




// Show repost label if repost
if (post.originalPostId) {
  const original = findOriginalPost(post);
  const repostLabel = document.createElement('div');
  const count = original.shareCount || 0;
  repostLabel.className= 'repost';
  repostLabel.textContent = `Reposted (${count} share${count!== 1? 's': ''})`;
  repostLabel.style.color = 'var(--primary)';
  repostLabel.style.fontWeight = 'bold';
  repostLabel.style.marginTop = '4px';
  repostLabel.style.cursor = 'pointer';
  repostLabel.title = 'Click to see original post';

  repostLabel.addEventListener('click', () => {
    const origEl = document.getElementById(`post-${original.id}`);
    if (origEl) {
      origEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Optionally highlight the original post briefly
      origEl.style.transition = 'background-color 0.5s ease';
      origEl.style.backgroundColor = '#ffff99'; // highlight color
      setTimeout(() => {
        origEl.style.backgroundColor = '';
      }, 2000);
    }
  });

  el.appendChild(repostLabel);
}
updateUserStats();

  return el;
}

setInterval(function() {
  document.querySelectorAll('.comment-meta').forEach(span => {
    const ts = span.getAttribute('data-timestamp');
    if (ts) {
      span.textContent = timeAgo(new Date(ts));
    }
  });

document.querySelectorAll('.post-meta').forEach(span => {
  const parent = span.closest('article');
  if (parent && parent.dataset.timestamp) {
    span.textContent = timeAgo(new Date(parent.dataset.timestamp));
  }
});
}, 100); // update every minute


function escapeHtml(text) {
  return text.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, '"');
}

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
  
}



function createCommentElement(post, comment, isReply = false, parentArray = null) {
  const div = document.createElement('div');
  div.className = 'comment';
  if(isReply) div.style.marginLeft = '1rem';
  dataset = comment.timestamp;

  // Find user and official status
  const user = users.find(u => u.id === comment.userId);
  const officialIcon = user && user.isOfficial? `
    <svg width="12" height="12" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-left: 4px;">
      <polygon points="32,4 56,16 56,48 32,60 8,48 8,16"
        fill="#0f0f1a"
        stroke="#00fff7"
        stroke-width="2"
        filter="url(#glow)" ></polygon>
      <path d="M22 33 L29 40 L44 24"
        stroke="#00fff7"
        stroke-width="4"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round" ></path>
    </svg>`: '';

  div.innerHTML = `<strong>${comment.userEmail}${officialIcon}</strong> | <div style="border: 1px solid; border-radius: 10px; display: inline-block; margin-left: 10px; padding: 5px;"> ${escapeHtml(comment.text)}
    <span style="font-size: 0.5rem; color: #666;" class="comment-meta" data-timestamp="${comment.timestamp}">${timeAgo(new Date(comment.timestamp))}</span></div><br>`;

  // Like button
  const likeReplyBtn = document.createElement('button');
  likeReplyBtn.className = 'like-btn';
  if(comment.likes.includes(currentUser?.id)) likeReplyBtn.classList.add('liked');
  likeReplyBtn.innerHTML = svgLike(likeReplyBtn.classList.contains('liked'));
  likeReplyBtn.title = 'Like/Unlike reply';
  likeReplyBtn.style.marginLeft = '0.5rem';

  // Like counter
  const likeReplyCount = document.createElement('span');
  likeReplyCount.textContent = ` ${comment.likes.length}`;
  likeReplyCount.style.marginLeft = '2px';
  likeReplyCount.style.fontWeight = 'bold';

  likeReplyBtn.addEventListener('click', () => {
    if(!currentUser) {
      showModal('Sign in to like it');
      showPage('signInPage');
      return;
    }
    const liked = comment.likes.includes(currentUser.id);
    if (liked) {
      comment.likes = comment.likes.filter(id => id!== currentUser.id);
    } else {
      comment.likes.push(currentUser.id);
    }
    likeReplyBtn.classList.toggle('liked',!liked);
    likeReplyBtn.innerHTML = svgLike(!liked);
    likeReplyCount.textContent = ` ${comment.likes.length}`;
  });
  div.appendChild(likeReplyBtn);
  div.appendChild(likeReplyCount);

  // Delete button for your own comments/replies
  if (comment.userId === currentUser?.id) {
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'deleteIt'
    deleteBtn.style.marginLeft = '0.3rem';
    deleteBtn.onclick = () => {

showConfirm('Delete this comment?').then(result => {
    if (result) {
      let arr = parentArray || post.comments;
      const idx = arr.findIndex(c => c.id === comment.id);
      if (idx!== -1) arr.splice(idx, 1);
      updateCommentSector(post.id); // Refresh component
    }
  }).catch(() => {
    // User canceled, do nothing
  });

    };
    div.appendChild(deleteBtn);
  }

  // Only show reply button for top-level comments (not replies)
  if (!isReply) {
    const replyBtn = document.createElement('button');
    replyBtn.title = 'Reply';
    replyBtn.innerHTML = svgReply;
    replyBtn.style.marginLeft = '0.3rem';
    replyBtn.addEventListener('click', () => {
      if(!currentUser) {
        showModal('Sign in to reply');
        showPage('signInPage');
        return;
      }
      commentTarget = { postId: post.id, commentId: comment.id };
      openCommentModal(true);
    });
    div.appendChild(replyBtn);
  }

  // Replies container
  if (comment.replies && comment.replies.length > 0) {
    const repliesContainer = document.createElement('div');
    repliesContainer.className = 'comment-replies';
    let expanded = false;

    function renderReplies() {
      repliesContainer.innerHTML = '';
      const repliesToShow = expanded? comment.replies: comment.replies.slice(0, 0);
      repliesToShow.forEach(r => {
        repliesContainer.appendChild(createCommentElement(post, r, true, comment.replies));
      });
      if (comment.replies.length > 0) {
        const toggleBtn = document.createElement('div');
        toggleBtn.textContent = expanded? 'Show less replies': `Show all replies (${comment.replies.length})`;
        toggleBtn.style.color = 'var(--primary)';
        toggleBtn.style.cursor = 'pointer';
        toggleBtn.style.margin = '0px';
        toggleBtn.addEventListener('click', () => {
          expanded =!expanded;
          renderReplies();
        });
        repliesContainer.appendChild(toggleBtn);
      }
    }
    renderReplies();
    div.appendChild(repliesContainer);
  }

  return div;
}

function linkifyHashtags(text) {
  return text.replace(/#(w+)/g, (match, tag) => {
    return innerHTML=`<span class="hashtags" style="color:blue; cursor:pointer;" data-tag="${tag}">#${tag}</span>`;
  });
}


let scrll = false;

window.addEventListener('scroll', ()=> {
  const filtered = document.getElementById('filtered');
  if (window.scrollY > 0 && !scrll){
    filtered.style.top = '7%';
    scrll = true;
  } else if (window.scrollY > 10 && scrll){
    filtered.style.top = '0%';
  } else {
    filtered.style.top = '10%';
  }
});

// Linkify hashtags to clickable spans
function linkifyMentions(text) {
  return text.replace(/~(S+)/g, (match, username) => {
    return `<span class="mention" style="color: #ee0979; cursor:pointer;" data-username="${username}">~${username}</span>`;
  });
}



postsContainer.addEventListener('click', e => {
  if(e.target.classList.contains('mention')) {
    const username = e.target.getAttribute('data-username');
    const user = users.find(u => u.email.startsWith(username)); // or adapt to your username logic
    if(user) {
      showUserProfile(user.id);
    } else {
      showModal('User not found');
    }
  }
});


// Comment Modal Logic
const commentModal = document.getElementById('commentModal');
const commentForm = document.getElementById('commentForm');
const commentText = document.getElementById('commentText');
const commentCancelBtn = document.getElementById('commentCancelBtn');

function openCommentModal(isReply = false) {
  commentText.value = '';
  commentModal.classList.remove('hidden');
  commentText.focus();
  document.getElementById('commentModalTitle').textContent = isReply ? 'Reply' : 'Comment';
  document.getElementById('commentModal').style.display = 'block';
  document.getElementById('commentText').placeholder = isReply? 'Add reply...': 'Add comment...';
}

commentCancelBtn.addEventListener('click', () => {
  commentModal.classList.add('hidden');
  document.getElementById('commentModal').style.display = 'none';
});

commentModal.addEventListener('click', (e) => {
  if (e.target === commentModal)
  document.getElementById('commentModal').style.display = 'none';
})

commentForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = commentText.value.trim();
  if(!text) {
    showModal('Comment cannot be empty');
    return;
  }
  if(!commentTarget) {
    showModal('No comment target selected');
    return;
  }
  const post = posts.find(p => p.id === commentTarget.postId);
  if(!post) {
    showModal('Post not found');
    commentModal.classList.add('hidden');
    return;
  }
  const newComment = {
    id: generateId(),
    userId: currentUser.id,
    userEmail: currentUser.email,
    text,
    timestamp: new Date(),
    likes: [],
    replies: [],
  };
  if(commentTarget.commentId) {
    // Reply to a comment
    const parentComment = findComment(post.comments, commentTarget.commentId);
    if(parentComment) {
      parentComment.replies.push(newComment);
      document.getElementById('commentModal').style.display = 'none';
    } else {
      showModal('Parent comment not found');
      commentModal.classList.add('hidden');
      return;
    }
  } else {
    // Top-level comment
    post.comments.push(newComment);
  }
  commentModal.classList.add('hidden');
  updateCommentSector(post.id)
  document.getElementById('commentModal').style.display = 'none';
});

function findComment(comments, id) {
  for(let c of comments) {
    if(c.id === id) return c;
    if(c.replies.length > 0) {
      const found = findComment(c.replies, id);
      if(found) return found;
    }
  }
  return null;
}

// Profile Page - Show user's posts
const profilePosts = document.getElementById('profilePosts');
function renderProfilePosts() {
  profilePosts.innerHTML = '';
  if(!currentUser) {
    profilePosts.innerHTML = '<p>Please sign in to view your posts.</p>';
    return;
  }
  const myPosts = posts.filter(p => p.userId === currentUser.id);
  if(myPosts.length === 0) {
    profilePosts.style.marginTop = '-7%';
    profilePosts.innerHTML = '<p style="font-weight: bold">No posts yet.</p>';
    return;
  }
  myPosts.forEach(post => {
    const postEl = createPostElement(post);
  
    // Add delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'delBtn';
    delBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="3 6 5 6 21 6" ></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" ></path>
    <line x1="10" y1="11" x2="10" y2="17" ></line>
    <line x1="14" y1="11" x2="14" y2="17" ></line>
    </svg>`;
    delBtn.style.marginTop = '0.5rem';
    delBtn.addEventListener('click', () => {

showConfirm('Delete this post?').then(result => {
    if (result) {
      const idx = posts.findIndex(p => p.id === post.id);
      if (idx >= 0) {
        posts.splice(idx, 1);
        renderProfilePosts();
        removeInappropriatePosts();
        updateOfficialStatus();
        syncCurrentUserOfficialFlag();
        updateUserStats();
        renderPosts();
      }
    }
  }).catch(() => {
    // User cancelled, do nothing
  });
      
    });
    postEl.appendChild(delBtn);
    profilePosts.appendChild(postEl);
  });
}

const storedUser = JSON.parse(localStorage.getItem('currentUser'));
if (storedUser && users.find(u => u.id === storedUser.id)) {
  currentUser = storedUser;
  updateUsername();
  loadBlockedUsers();
  showPage('feedPage');
} else {
  showPage('signInPage');
}

function generatePasscode() {
  return Math.floor(1000 + Math.random() * 9000).toString(); // e.g. "4837"
}

function signUp(email, password, birthDate, gender, TsCsChecked) {  
  if (!birthDate) {  
    showModal('Please enter your date of birth.');  
    return false;  
  }

  // ✅ Calculate exact age
  const today = new Date();
  const dob = new Date(birthDate);
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--; // not had birthday yet this year
  }

  // 🚫 Block if invalid DOB (future date or unrealistic)
  if (dob > today) {
    showMod('Invalid date of birth.');
    return false;
  }

  // ✅ Enforce age rule
  if (age < 13 || age > 100) {  
    showModal('You must be between 13 and 100 years old to sign up.');  
    return false;  

  }  

  if (!TsCsChecked) {  
    showModal('You must accept the Terms and Conditions.');  
    return false;  
  }  

  if (!gender) {  
    showModal('Please select a gender.');  
    return false;  
  }  

  if (!/(?=.*[A-Z])(?=.*\d)/.test(password)) {  
    showModal('Password must contain at least one uppercase letter and one digit.');  
    return false;  
  }  

  if (users.find(u => u.email === email)) {    
    showModal('Email already registered');    
    return false;    
  }    

  let id = generateId();  
  const passcode = generatePasscode();  
  users.push({ id, email, password, passcode, age });  
  localStorage.setItem('users', JSON.stringify(users));    

  currentUser = { email, id };    
  localStorage.setItem('currentUser', JSON.stringify(currentUser));    

  showModal(`Account created and signed in. Your 4-digit passcode is: ${passcode}`);    
  showPage('welkom');  

  // Clear form fields  
  document.getElementById('signUpEmail').value = '';  
  document.getElementById('signUpPassword').value = '';  
  document.getElementById('age').value = '';  
  document.getElementById('gender').value = '';  
  document.getElementById('TsCs').checked = false;  
  document.getElementById('passcodeConfirmed').checked = false;  
  document.getElementById('generatedPasscode').textContent = '----';  
  document.getElementById('signUpBtn').disabled = true;  

  return true;    
}

let currentPasscode = '';

const redeemBtn = document.getElementById('redeemBtn');
const generatedPasscodeEl = document.getElementById('generatedPasscode');
const passcodeConfirmed = document.getElementById('passcodeConfirmed');
const signUpBtn = document.getElementById('signUpBtn');

redeemBtn.addEventListener('click', () => {
  // Validate email & password entered before redeeming
  const email = document.getElementById('signUpEmail').value.trim();
  const password = document.getElementById('signUpPassword').value;
  if (!email ||!password) {
    showModal('Please enter email and password before redeeming the passcode');
    return;
  }
  
  currentPasscode = Math.floor(1000 + Math.random() * 9000).toString();
  generatedPasscodeEl.textContent = currentPasscode;
  showModal('Passcode generated! Please confirm to enable sign up.');
  passcodeConfirmed.disabled = false;
  passcodeConfirmed.checked = false;
  signUpBtn.disabled = true;
});

passcodeConfirmed.addEventListener('change', () => {
  signUpBtn.disabled =!passcodeConfirmed.checked;
});

document.getElementById('signUpForm').addEventListener('submit', e => {
  e.preventDefault();
  
  const email = document.getElementById('signUpEmail').value.trim();
  const password = document.getElementById('signUpPassword').value;
  const birthDate = document.getElementById('age').value;
  const gender = document.getElementById('gender').value;
  const TsCsChecked = document.getElementById('TsCs').checked;

  if (!birthDate) {
    showModal('Please enter your date of birth.');
    return;
  }

  // ✅ Calculate age
  const today = new Date();
  const dob = new Date(birthDate);
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  // 🚫 Block if invalid DOB
  if (dob > today) {
    showModal('Invalid date of birth.');
    return;
  }
  
  if (!/^(?=.*[A-Z])(?=.*d)[A-Za-zd]{6,8}$/.test(password)) {
    showModal('Password must be 6-8 characters, contain at least one uppercase letter and one digit, and no special characters.');
    return;
  }
  
  if (age < 13 || age > 100) {
    showModal('You must be between 13 and 100 years old to sign up.');
    return;
  }

  if (!TsCsChecked) {
    showModal('You must accept the Terms and Conditions.');
    return;
  }

  if (!gender) {
    showModal('Please select a gender.');
    return;
  }


  if (!currentPasscode) {
    showModal('Please redeem your passcode first!');
    return;
  }

  if (users.find(u => u.email === email)) {
    showModal('Email already registered');
    return;
  }

  const id = generateId();
  users.push({ id, email, password, passcode: currentPasscode, age, gender });
  localStorage.setItem('users', JSON.stringify(users));

  currentUser = { email, id };
  localStorage.setItem('currentUser', JSON.stringify(currentUser));

  showModal(`Account created! Your 4-digit passcode is: ${currentPasscode}`);
  showPage('welkom');

  // Clear inputs after successful signup
  document.getElementById('signUpEmail').value = '';
  document.getElementById('signUpPassword').value = '';
  document.getElementById('age').value = '';
  document.getElementById('gender').value = '';
  document.getElementById('TsCs').checked = false;
  document.getElementById('generatedPasscode').textContent = '----';
  currentPasscode = null;
});


function signIn(email, password) {
  showConfirm(`Log in with ${email}?`).then(result => {
    if (!result) return;
    let user = users.find(u => u.email === email && u.password === password);
    if (user) {
      currentUser = { email: user.email, id: user.id };
      localStorage.setItem('currentUser', JSON.stringify(currentUser)); // Save for auto login
      showModal('Signed in successfully');
      showPage('feedPage');
      renderBlockedUsers();
      loadBlockedUsers();
      saveRecentAccount(email, password);
    } else {
      showModal('Invalid email or password');
    }
  });
}

const emailSearchInput = document.getElementById('emailSearchInput');

// Save a recent account after successful sign-in
function saveRecentAccount(email, password) {
  let recents = JSON.parse(localStorage.getItem('recentAccounts')) || [];
  // Avoid duplicates (by email)
  recents = recents.filter(acc => acc.email!== email);
  recents.unshift({ email, password }); // add newest at the front
  // Keep max 5 recent accounts
  recents = recents.slice(0, 5);
  localStorage.setItem('recentAccounts', JSON.stringify(recents));
}

// Call this inside signIn() after successful login:


// Render recent accounts list on sign-in page
function renderRecentAccounts() {
  const recentDiv = document.createElement('recentAccountsList'); // create this div in your HTML
  recentDiv.innerHTML = '';
  const recents = JSON.parse(localStorage.getItem('recentAccounts')) || [];
  recents.forEach((acc, i) => {
    const accEl = document.createElement('div');
    accEl.textContent = acc.email;
    accEl.style.cursor = 'pointer';
    accEl.style.display = 'flex';
    accEl.style.justifyContent = 'space-between';
    accEl.style.alignItems = 'center';
    accEl.style.padding = '4px 8px';
    accEl.style.borderBottom = '1px solid #ddd';

    // Click to autofill & auto sign in

accEl.addEventListener('click', () => {
  showConfirm(`Do you really want to sign in with ${acc.email}?`).then(result => {
      if (result) {
        document.getElementById('signInEmail').value = acc.email;
        document.getElementById('signInPassword').value = acc.password;
        signIn(acc.email, acc.password);
      }
    }).catch(() => {
      // User cancelled – just ignore or handle if needed
    });
});

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '×';
    removeBtn.style.marginLeft = '8px';
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      const recents = JSON.parse(localStorage.getItem('recentAccounts')) || [];
      recents.splice(i, 1);
      localStorage.setItem('recentAccounts', JSON.stringify(recents));
      renderRecentAccounts();
    };

    accEl.appendChild(removeBtn);
    recentDiv.appendChild(accEl);
  });
}

// Call renderRecentAccounts() on your sign-in page load:
document.addEventListener('DOMContentLoaded', () => {
  renderRecentAccounts();
});


let recentAccountsModal = null;

function createRecentAccountsModal() {
  recentAccountsModal = document.createElement('div');
  recentAccountsModal.id = 'recentAccountsModal';
  Object.assign(recentAccountsModal.style, {
  position: 'fixed', top: '0', left: '0%', width: '100vw', height: '100vh',
  background: 'rgba(0,0,0,0.5)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', zIndex: '10000',
  overflow: 'hidden',
});

  const modalContent = document.createElement('div');
  modalContent.id = 'recentAccountsModalContent';
  Object.assign(modalContent.style, {
    minWidth: '300px', maxHeight: '800vh', overflowY: 'auto', left: '50%'
  });

  recentAccountsModal.appendChild(modalContent);
  document.body.appendChild(recentAccountsModal);

  recentAccountsModal.addEventListener('click', e => {
    if (e.target === recentAccountsModal) closeRecentAccountsModal();
  });
}

function openRecentAccountsModal() {
  if (!recentAccountsModal) createRecentAccountsModal();
  const modalContent = document.getElementById('recentAccountsModalContent');


modalContent.innerHTML = `
  <h3 style="display:flex; align-items:center;">
    <svg style="margin-right: -5px;" width="50" height="50" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: left;">
      <defs>
        <linearGradient id="grad1-unique" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#EC0C3E"></stop>
          <stop offset="100%" stop-color="#0CBDEC"></stop>
        </linearGradient>
      </defs>
      <path d="M20 80 C20 40, 25 20, 35 90 C40 65, 55 40, 15 10"
        stroke="url(#grad1-unique)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" ></path>
    </svg>
    Recent Accounts
  </h3>

`;

  let recents = JSON.parse(localStorage.getItem('recentAccounts')) || [];
  if (recents.length === 0) {
    modalContent.innerHTML += '<p>No recent accounts found.</p>';
  } else {
    recents.forEach((acc, i) => {
      const accDiv = document.createElement('div');
      accDiv.style.display = 'flex';
      accDiv.style.justifyContent = 'space-between';
      accDiv.style.height = '40px';
      accDiv.style.textAlign = 'left';
      accDiv.style.alignItems = 'left';
      accDiv.style.width = '100%';
      accDiv.style.margin = '15px 0';
      accDiv.style.background= 'grey';
      accDiv.style.borderRadius = '10px';


      const emailBtn = document.createElement('button');
      emailBtn.textContent = acc.email;
      emailBtn.className = 'emailBtn';
      emailBtn.style.flex = '1';
      emailBtn.style.marginRight = '0';
      emailBtn.style.textAlign= 'left';
      emailBtn.style.marginLeft = '10px';
      emailBtn.style.fontWeight = 'bold';
      emailBtn.style.cursor = 'pointer';
      emailBtn.onclick = () => {
        signIn(acc.email, acc.password);
        closeRecentAccountsModal();
      };

      const removeBtn = document.createElement('button');
      removeBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"></circle>
<path d="M8 8L16 16M16 8L8 16" stroke="currentColor" stroke-width="2"></path>
</svg>`;
      Object.assign(removeBtn.style, {
        background: 'transparent', color: '#fff', border: 'none',
        borderRadius: '4px', cursor: 'pointer',
      });
      removeBtn.onclick = () => {

showConfirm(`Really remove ${acc.email} from recent accounts?`).then(result => {
    if (result) {
      recents.splice(i, 1);
      localStorage.setItem('recentAccounts', JSON.stringify(recents));
      openRecentAccountsModal();
    }
  }).catch(() => {
    // User cancelled or closed - do nothing
  });
      };

      accDiv.appendChild(emailBtn);
      accDiv.appendChild(removeBtn);
      modalContent.appendChild(accDiv);
    });
  }

  recentAccountsModal.style.display = 'flex';
}

function showUploadPage(){
  showPage('uploadPage');
}

function closeRecentAccountsModal() {
  if (recentAccountsModal) recentAccountsModal.style.display = 'none';
}

document.getElementById('showRecentBtn').addEventListener('click', openRecentAccountsModal);


function search() {
  const email = emailSearchInput.value.trim().toLowerCase();
  const user = users.find(u => u.email.toLowerCase().includes(email));
  
  const profileUserHeader = document.getElementById('profileUserHeader');
  const profilePosts = document.getElementById('profilePosts');
  profilePosts.innerHTML = '';

  if (!user) {
    profileUserHeader.innerText = 'User not found';
    return;
  }
  
  profileUserHeader.innerText = `${user.email}'s Posts`;
  const userPosts = posts.filter(p => p.userId === user.id);
  if (userPosts.length === 0) {
    profilePosts.innerHTML = '<p>No posts by this user.</p>';
    return;
  }
  userPosts.forEach(post => {
    profilePosts.appendChild(createPostElement(post));
  });
}

// Remove the Enter key listener and add this instead:
emailSearchInput.addEventListener('input', () => {
  search();
});


function signOut() {
  showConfirm('Are you sure you want to sign out?').then(result => {
      if (result && currentUser) {
        currentUser = null;
        localStorage.removeItem('currentUser');
        showModal('Signed out successfully');
        setTimeout(() => {
          showPage('feedPage');
        }, 100);
      }
    });
}


}
