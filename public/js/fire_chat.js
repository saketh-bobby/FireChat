function FireChat() {
	this.toastNotifier = new ToastNotifier();
	this.loginNav      = document.getElementById('login-nav');
	this.registerNav   = document.getElementById('register-nav');
	this.logoutNav     = document.getElementById('logout-nav');
	this.chatNav       = document.getElementById('chat-nav');
	this.settingsNav   = document.querySelector('.settings-nav');
}

/**
 *       Init the awesomeness
 */
FireChat.prototype.initFirebase = function () {
	// initialize firebase
	this.firebase = firebase;
	this.auth     = firebase.auth();
	this.storage  = firebase.storage();
	this.database = firebase.database();
	this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};
/**
 *
 * @param username
 * @param email
 * @param password
 * @param profilePic
 *
 *          upload profile pic, once you create user add entry into db users
 *
 */
FireChat.prototype.createUser = function (username, email, password, profilePic) {
	if (this.toastNotifier.exists()) {
		document.body.removeChild(this.toastNotifier.notifier);
	}
	this.toastNotifier.initNotifier();
	let saveUser = (user) => {
		// push user details into db too
		let usersRef = this.database.ref(`users/${user.uid}`);
		usersRef
			.set({
				username,
				email,
				photoUrl: `${config.storageBucket}/profilePics/${profilePic.name}`
			});
		this.toastNotifier.display('alert-success', `Welcome ${user.email}`);
		// goto the amazing part
		handleStateChange(this, 'chat', true);
	};
	// upload profile pic then save user
	this.auth
		.createUserWithEmailAndPassword(email, password)
		.then((user) => {
			//get file data and upload to firebase
			let profilePicRef = this.storage.ref('profilePics/' + profilePic.name);
			profilePicRef.put(profilePic)
				.then(saveUser.bind(this, user));
		})
		.catch((error) => {
			//	handle error with messages
			this.toastNotifier.display('alert-danger', error.message);
		});

};
/**
 *
 * @param email
 * @param password
 *
 *      Just sign in user
 *
 */
FireChat.prototype.signInUser = function (email, password) {
	if (this.toastNotifier.exists()) {
		document.body.removeChild(this.toastNotifier.notifier);
	}
	this.toastNotifier.initNotifier();
	this.auth
		.signInWithEmailAndPassword(email, password)
		.then((user) => {
			//  redirect to other url
			this.toastNotifier.display('alert-success', `Welcome ${user.email}`);
			// goto the amazing part
			handleStateChange(this, 'chat', true);
		})
		.catch((error) => {
			//	handle error with messages
			this.toastNotifier.display('alert-danger', error.message);
		});
};
/**
 *
 * @param user
 *          for dynamic nav sweetness :P
 */
FireChat.prototype.onAuthStateChanged = function (user) {
	if (user) {
		this.loginNav.style.display    = 'none';
		this.registerNav.style.display = 'none';
		this.logoutNav.style.display   = 'inline-block';
		this.chatNav.style.display     = 'inline-block';
		this.settingsNav.style.display = 'inline-block';
	} else {
		this.loginNav.style.display    = 'inline-block';
		this.registerNav.style.display = 'inline-block';
		this.logoutNav.style.display   = 'none';
		this.chatNav.style.display     = 'none';
		this.settingsNav.style.display = 'none';
	}
};

FireChat.prototype.signout = function () {
	this.toastNotifier.initNotifier();
	this.auth.signOut()
		.then(() => {
			this.toastNotifier.display('alert-success', 'GoodBye, you have successfully logged out!');
			handleStateChange(this, 'home', true);
		})
		.catch((error) => {
			this.toastNotifier.display('alert-danger', error.message);
		});
};

FireChat.prototype.removeMessage = function (messageBubble) {
	let msgId             = messageBubble.dataset.id;
	let sentOrRcvd        = messageBubble.dataset.type;
	let userId            = this.auth.currentUser.uid;
	let messageHistoryRef = this.database.ref(`messageHistory/${userId}/${sentOrRcvd}`).child(msgId);
	messageHistoryRef.remove()
		.then(function () {
			messageBubble.parentNode.removeChild(messageBubble);
		});
};
/**
 *
 * @param leftOrRight
 * @param sentOrRcvd
 * @param snapshot
 *              add message bubble to the chat called by loadMessages method
 */
FireChat.prototype._addMessageToChat = function (leftOrRight, sentOrRcvd, snapshot) {
	let chatRoom      = document.getElementById('chat-room');
	// message append here
	let messageBubble = document.createElement('div');
	messageBubble.setAttribute('data-id', snapshot.key);
	messageBubble.setAttribute('data-type', sentOrRcvd);
	messageBubble.classList.add('msg', `msg-${leftOrRight}`, 'alert', 'alert-info');
	messageBubble.innerHTML = `<span>${snapshot.val().text}</span>`;
	chatRoom.appendChild(messageBubble);
	messageBubble.addEventListener('click', () => {
		const removeMsg = document.querySelector(`[data-id = ${messageBubble.dataset.id}] .glyphicon-remove`);
		messageBubble.classList.toggle('remove-msg');
		if (messageBubble.classList.contains('remove-msg')) {
			const removeMsg = document.createElement('span');
			removeMsg.classList.add('glyphicon', 'glyphicon-remove');
			removeMsg.addEventListener('click', () => {
				this.removeMessage(messageBubble);
			});
			messageBubble.appendChild(removeMsg);
		} else {
			messageBubble.removeChild(removeMsg);
		}
	});
};

/**
 *
 * @param recvUid
 *              render chat room
 *              1) render text box
 *              2)Add listeners for new messages
 */
FireChat.prototype.loadMessages = function (recvUid) {
	let userId      = this.auth.currentUser.uid;
	let sentRef     = this.database.ref(`messageHistory/${userId}/sent`);
	let receivedRef = this.database.ref(`messageHistory/${userId}/received`);

	let texter       = document.querySelector('.texter');
	//add messagebox to the dom
	texter.innerHTML = `<form>
					<div class="col-md-10">
						<input type="text" class="form-control" id="message-box"
						       placeholder="Enter your message here...">
					</div>
					<div class="col-md-2">
						<button class="btn btn-primary" id="send-btn">SEND</button>
					</div>
				</form>`;

	sentRef.child(recvUid).on('child_added', this._addMessageToChat.bind(this, 'right', 'sent'));

	receivedRef.child(recvUid).on('child_added', this._addMessageToChat.bind(this, 'left', 'received'));
};
/**
 *
 * @param recvUid
 * @param messageText
 *              1) add message to sent for sender
 *              2) add message to received for receiver
 */
FireChat.prototype.sendMessage = function (recvUid, messageText) {
	// path contains friends u ned to select one based on chat room
	let timestamp       = this.firebase.database.ServerValue.TIMESTAMP;
	let userId          = this.auth.currentUser.uid;
	let sentMessagesRef = this.database.ref(`messageHistory/${userId}/sent`);
	let recvMessagesRef = this.database.ref(`messageHistory/${recvUid}/received`);
	sentMessagesRef
		.child(recvUid)
		.push()
		.set({
				text: messageText,
				timestamp: timestamp
			}
		);
	recvMessagesRef
		.child(userId)
		.push()
		.set({
				text: messageText,
				timestamp: timestamp
			}
		);
};
/**
 *
 * @param username
 * @param email
 *
 *
 */
FireChat.prototype.addFriend = function (username, email) {
	let currentUser = this.auth.currentUser.uid;
	let friendsRef  = this.database.ref('friends').child(currentUser);
	// search for email and add uid of that guy
	let usersRef    = this.database.ref('users');
	usersRef.on('value', function (snapshot) {
		let users = snapshot.val();
		for (let user in users) {
			if (users[user].email == email && currentUser != user) {
				friendsRef
					.child(user)
					.set({
						username,
						email
					});
			}
		}


	});

//TODO:handle recvUid undefined case aftrwrds

};
/**
 *
 * @param DOMElm
 *          render friends list on friends page
 */
FireChat.prototype.getAllFriends = function (DOMElm) {
	let friendsRef  = this.database.ref('friends').child(this.auth.currentUser.uid);
	let friendsList = document.querySelector(DOMElm);

	// since we need complex key oriented manippulation used value instead of child_added
	friendsRef.once('value').then(
		function (snapshot) {
			let friends = snapshot.val();
			for (let friend in friends) {
				let listItem = document.createElement("li");
				listItem.setAttribute('role', 'presentation');
				listItem.innerHTML = `
					<a class="friends-list-li" data-id="${friend}" style="cursor:pointer;">${friends[friend].username}</a>
				`;
				friendsList.appendChild(listItem);
				//TODO: add when clicked go to friend chat room functionality
			}
		}
	);

};

FireChat.prototype.renderFriendName = function(friend) {
	let friendsList = document.querySelector('#chat-sidebar #friends-list');
	let usersRef    = this.database.ref('users');

	//render list item
	let listItem = document.createElement("li");
	listItem.setAttribute('role', 'presentation');
	// if chatter already found by sent text waste to render again right ?
	let friendElm = document.querySelector(`[data-id="${friend}"]`);
	// if already rendered by send neglect recv
	if (friendElm == null) {
		//find user by id
		usersRef.orderByKey().equalTo(friend).on('child_added', (snapshot) => {
			let username       = snapshot.val().username;
			listItem.innerHTML = `
						<a class="friends-list-li" data-id="${friend}" style="cursor:pointer;">${username}</a>
					`;
			friendsList.appendChild(listItem);

			listItem.addEventListener('click', chatClickHandler.bind(this));
		});
	}

	// add click listeners to render
	function chatClickHandler(evt) {
		let recvUid = evt.target.dataset.id;
		evt.preventDefault();
		let friendsLi = document.querySelectorAll('#chat-sidebar #friends-list li');
		// for all others remove active class
		friendsLi.forEach(function (friendNode) {
			friendNode.classList.remove('active');
		});
		evt.target.parentNode.classList.add('active');

		// apply off() for previous rcvs
		this.unloadMessages(recvUid);
		// retrieve messages for friend
		this.loadMessages(recvUid);
		let messageBox = document.querySelector('#message-box');
		let sendButton = document.querySelector('.texter #send-btn');
		sendButton.removeEventListener('click', sendMsgHandler.bind(this));
		sendButton.addEventListener('click', sendMsgHandler.bind(this));
		///////// send message handler
		function sendMsgHandler(evt) {
			evt.preventDefault();
			//todo:filter user msg content by escaping chars
			if (messageBox.value != '') {
				this.sendMessage(recvUid, messageBox.value);
				messageBox.value = '';
			}
		}

	}
};


/**
 * @param snapshot
 *  render friend name to the dom
 */
FireChat.prototype.renderFriends = function(snapshot) {
	let friends = snapshot.val();
	for (let friend in friends) {
		this.renderFriendName(friend);
	}
};

/**
 *      1) add click listeners to all friends in the list
 *      2) when you click one friend first unload other friends data i.e
 *          remove all data listeners for other friend and clear chat
 *      3) load data for this friend i.e add data listeners for this friend.
 */
FireChat.prototype.loadChat = function () {
	let userId      = this.auth.currentUser.uid;
	let sentRef     = this.database.ref(`messageHistory/${userId}/sent`);
	let receivedRef = this.database.ref(`messageHistory/${userId}/received`);

	//render even when added friend manually and clicked it
	sentRef
		.once('value', this.renderFriends.bind(this))
		.then(() => {
			receivedRef.once('value', this.renderFriends.bind(this));
		});
};

/**
 *          1) sentRef listeners except for param are off()ed
 *          2) recvdRef listeners except for param are off()ed
 *          3) all msgs are removed from the DOM
 *
 */

FireChat.prototype.unloadMessages = function (recvUid) {
	let userId      = this.auth.currentUser.uid;
	let sentRef     = this.database.ref(`messageHistory/${userId}/sent`);
	let receivedRef = this.database.ref(`messageHistory/${userId}/received`);
	let chatRoomRef = document.querySelector('#chat-room');
	// aim is if other users listeners are there remove them
	sentRef.on('value', function (snapshot) {
		let users = snapshot.val();
		for (let user in users) {
			if (user != recvUid) {
				sentRef.child(user).off();
			}
		}
	});
	// aim is if other users listeners are there remove them
	receivedRef.on('value', function (snapshot) {
		let users = snapshot.val();
		for (let user in users) {
			if (user != recvUid) {
				receivedRef.child(user).off();
			}
		}
	});

	// also clear all messages for prev friend
	chatRoomRef.innerHTML = '';

};