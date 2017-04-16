// when nav items clicked insert cool stuff

let bodyContainer = document.getElementById('body-container');
let sendBtn = document.getElementById('send-btn');

function handleStateChange(appInstance,state,push) {
	// try to remove all event listeners when changing state
	fetch('partials/' + state + '.html')
		.then(
			(response) => {
				return response.text();
			}
		)
		.then(function(response){
			bodyContainer.innerHTML = response;
			if(push){
				history.pushState(state, '', state);
			}
			handleStateListeners(appInstance,state);
		})
		.catch(function (err) {
			console.log(err);
		});
}

function handleStateListeners(appInstance,state){
	if (state == 'register') {
		if(appInstance.auth.currentUser == null){
			let registerButton = document.querySelector('.register-btn');
			let regEmail       = document.querySelector('#reg-email');
			let regPassword    = document.querySelector('#reg-password');
			let regFile        = document.querySelector('#reg-file');
			let regName        = document.querySelector('#reg-name');
			let profilePic;
			regFile.addEventListener('change', function (evt) {
				profilePic = evt.target.files[0];
			});
			function regCb(evt) {
				evt.preventDefault();
				appInstance.createUser(regName.value, regEmail.value, regPassword.value, profilePic);
			}

			registerButton.addEventListener('click', regCb);
		}
		else { handleStateChange(appInstance,'chat')}
	} else if (state == 'login') {
		if(appInstance.auth.currentUser == null) {
			let loginButton   = document.querySelector('.login-btn');
			let loginEmail    = document.querySelector('#login-email');
			let loginPassword = document.querySelector('#login-password');

			function loginCb(evt) {
				evt.preventDefault();
				appInstance.signInUser(loginEmail.value, loginPassword.value);
			}

			loginButton.addEventListener('click', loginCb);
		}
		else { handleStateChange(appInstance,'chat')}
	} else if(state == 'chat') {
		if(appInstance.auth.currentUser != null) {
			// retrieve messages
			appInstance.loadMessages(appInstance.auth.currentUser.uid);
			let sendButton = document.querySelector('#send-btn');
			let messageBox = document.querySelector('#message-box');
			sendButton.addEventListener('click',function(evt){
				evt.preventDefault();
				if(messageBox.value != ''){
					appInstance.sendMessage(appInstance.auth.currentUser.uid,messageBox.value);
					messageBox.value = '';
				}
			});
		}
		else { handleStateChange(appInstance,'login')}
	}
}
