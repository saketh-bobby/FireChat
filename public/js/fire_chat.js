function FireChat() {
	this.toastNotifier = new ToastNotifier();
	this.loginNav = document.getElementById('login-nav'),
	this.registerNav = document.getElementById('register-nav'),
	this.logoutNav = document.getElementById('logout-nav'),
	this.chatNav = document.getElementById('chat-nav');
	this.settingsNav = document.querySelector('.settings-nav');
}

FireChat.prototype.initFirebase = function () {
	// initialize firebase
	this.firebase  = firebase;
	this.auth      = firebase.auth();
	this.storage   = firebase.storage();
	this.database  = firebase.database();
	this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

FireChat.prototype.createUser = function (name, email, password, profilePic) {
	let saveUser = (user) => {
		// push user details into db too
		let usersRef = this.database.ref(`users/${user.uid}`);
		usersRef
			.set({
				name,
				email,
				photoUrl: `${config.storageBucket}/profilePics/${profilePic.name}`
			});
		this.toastNotifier.display('alert-success', `Welcome ${user.email}`);
		// goto the amazing part
		handleStateChange(this, 'chat',true);
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
				.then(saveUser.bind(this,user));
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
			handleStateChange(this, 'chat',true);

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
			handleStateChange(this,'home',true);
		})
		.catch((error) => {
			this.toastNotifier.display('alert-danger', error.message);
		});
};

FireChat.prototype.loadMessages = function (userId) {
	let sentRef     = this.database.ref(`messageHistory/${userId}/sent`);
	let receivedRef = this.database.ref(`messageHistory/${userId}/received`);
	let chatRoom    = document.getElementById('chat-room');
	// let recRef = receivedMessagesRef.limitToLast(5);

	sentRef.on('child_added', function (snapshot) {
		let messageBubble = document.createElement('div');
		messageBubble.classList.add('msg','msg-right','alert','alert-info');
		messageBubble.innerHTML   = snapshot.val().text;
		chatRoom.appendChild(messageBubble);
	});
	receivedRef.on('child_added', function (snapshot) {
		let messageBubble = document.createElement('div');
		messageBubble.classList.add('msg','msg-left','alert','alert-info');
		messageBubble.innerHTML   = snapshot.val().text;
		chatRoom.appendChild(messageBubble);
	});
};

FireChat.prototype.sendMessage = function (userId, messageText) {
	let friendRef = this.database.ref(`friends/${userId}`);
	let recvUid;
	friendRef.once('value', (snapshot) => {
		recvUid             = snapshot.val();
		let timestamp       = this.firebase.database.ServerValue.TIMESTAMP;
		let userId          = this.auth.currentUser.uid;
		let sentMessagesRef = this.database.ref(`messageHistory/${userId}/sent`);
		let recvMessagesRef = this.database.ref(`messageHistory/${recvUid}/received`);
		sentMessagesRef
			.push()
			.set({
					text: messageText,
					receiver: recvUid,
					timestamp: timestamp
				}
			);
		recvMessagesRef
			.push()
			.set({
					text: messageText,
					sender: userId,
					timestamp: timestamp
				}
			);
	});

};


FireChat.prototype.requestPermission = function(){
	this.messaging.requestPermission()
		.then(function(){
			//update ui accordingly
			console.log('Notification access granted');
		})
		.catch(function(err){
			//update ui accordingly
			console.log('Failed access',err);
		});
};
