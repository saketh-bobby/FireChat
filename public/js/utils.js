// when nav items clicked insert cool stuff

let bodyContainer = document.getElementById('body-container');
let sendBtn       = document.getElementById('send-btn');

function handleStateChange(appInstance, state, push) {
	// try to remove all event listeners when changing state
	fetch('partials/' + state + '.html')
		.then(
			(response) => {
				return response.text();
			}
		)
		.then(function (response) {
			bodyContainer.innerHTML = response;
			if (push) {
				history.pushState(state, '', state);
			}
			handleStateListeners(appInstance, state);
		})
		.catch(function (err) {
			console.log(err);
		});
}

function handleStateListeners(appInstance, state) {
	if (state == 'register') {
		registerStateHandler(appInstance);

	} else if (state == 'login') {
		loginStateHandler(appInstance);
	} else if (state == 'chat') {
		chatStateHandler(appInstance);
	} else if (state == 'friends') {
		friendStateHandler(appInstance);
	}
}
//////////////////////////////////////
function registerStateHandler(appInstance){
	let registerButton = document.querySelector('.register-btn');
	let regEmail       = document.querySelector('#reg-email');
	let regPassword    = document.querySelector('#reg-password');
	let regFile        = document.querySelector('#reg-file');
	let regName        = document.querySelector('#reg-name');
	let profilePic;
	regFile.addEventListener('change', function (evt) {
		profilePic = evt.target.files[0];
	});
	registerButton.addEventListener('click', regCb);
	////////
	function regCb(evt) {
		evt.preventDefault();
		appInstance.createUser(regName.value, regEmail.value, regPassword.value, profilePic);
	}
}

function loginStateHandler(appInstance){
	let loginButton   = document.querySelector('.login-btn');
	let loginEmail    = document.querySelector('#login-email');
	let loginPassword = document.querySelector('#login-password');
	loginButton.addEventListener('click', loginCb);

	function loginCb(evt) {
		evt.preventDefault();
		appInstance.signInUser(loginEmail.value, loginPassword.value);
	}

}

function chatStateHandler(appInstance){
	appInstance.loadChat();
}

function friendStateHandler(appInstance){
	let addFriendForm = document.getElementById('add-friend-form');
	let friendEmail   = document.getElementById('friend-email');
	let friendName    = document.getElementById('friend-name');
	addFriendForm.addEventListener('submit', function (evt) {
		evt.preventDefault();
		appInstance.addFriend(friendName.value, friendEmail.value);
	});
	appInstance.getAllFriends('#friends-list');
}

