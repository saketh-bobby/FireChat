function FireChat() {
	this.toastNotifier = new ToastNotifier();
	this.loginNav      = document.getElementById('login-nav');
	this.registerNav   = document.getElementById('register-nav');
	this.logoutNav     = document.getElementById('logout-nav');
	this.chatNav       = document.getElementById('chat-nav');
	this.settingsNav   = document.querySelector('.settings-nav');
}


FireChat.prototype.initFirebase = function () {
	// initialize firebase
	this.firebase = firebase;
	this.auth     = firebase.auth();
	this.storage  = firebase.storage();
	this.database = firebase.database();
	this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

FireChat.prototype.createUser = function (username, email,password, profilePic) {
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
	if (this.toastNotifier.exists()) {
		document.body.removeChild(this.toastNotifier.notifier);
	}
	this.toastNotifier.initNotifier();
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
			this.addFriend('saketh', 'bob@bob.com');

		})
		.catch((error) => {
			//	handle error with messages
			this.toastNotifier.display('alert-danger', error.message);
		});
};

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

FireChat.prototype._addMessageToChat = function (leftOrRight, sentOrRcvd, snapshot) {
	let chatRoom      = document.getElementById('chat-room');
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


FireChat.prototype.loadMessages = function (recvUid) {
	let userId      = this.auth.currentUser.uid;
	let sentRef     = this.database.ref(`messageHistory/${userId}/sent`);
	let receivedRef = this.database.ref(`messageHistory/${userId}/received`);

	sentRef.child(recvUid).on('child_added', this._addMessageToChat.bind(this, 'right', 'sent'));

	receivedRef.child(recvUid).on('child_added', this._addMessageToChat.bind(this, 'left', 'received'));
};

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

FireChat.prototype.addFriend = function (username, email) {
	let currentUser = this.auth.currentUser.uid;
	let friendsRef = this.database.ref('friends').child(currentUser);
	// search for email and add uid of that guy
	let usersRef = this.database.ref('users');
	usersRef.on('value',function(snapshot){
		let users = snapshot.val();
		for(let user in users){
			console.log(user);
			if(users[user].email == email && currentUser != user){
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

FireChat.prototype.getAllFriends = function (DOMElm) {
	let friendsRef  = this.database.ref('friends').child(this.auth.currentUser.uid);
	let friendsList = document.querySelector(DOMElm);

	// since we need complex key oriented manippulation used value instead of child_added
	return friendsRef.once('value').then(
		function (snapshot) {
			let friends = snapshot.val();
			for (let friend in friends) {
				let listItem = document.createElement("li");
				listItem.setAttribute('role', 'presentation');
				listItem.innerHTML = `
					<a class="friends-list-li" data-id="${friend}" style="cursor:pointer;">${friends[friend].username}</a>
				`;
				friendsList.appendChild(listItem);
			}
			return Promise.resolve(true);
		}
	);

};