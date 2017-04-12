SystemJS.import('js/fire_chat.js');
(function () {
	let firechat = new FireChat();
	// unlock the awesomeness of firebase
	firechat.initFirebase();
	// all DOM References
	let navbarBrand = document.querySelector('.navbar-brand'),
	    loginNav    = document.getElementById('login-nav'),
	    registerNav = document.getElementById('register-nav'),
		logoutNav = document.getElementById('logout-nav'),
		bodyContainer = document.getElementById('body-container'),
		navLinks      = [navbarBrand,loginNav,registerNav];
	// for loading default state home
	(function(){
		fetch('partials/home.html')
			.then(function (response) {
				return response.text();
			})
			.then(function (content) {
				// add content to dom
				bodyContainer.innerHTML = content;
				history.pushState(null,'','home');
			})
			.catch(function (err) {
				console.log(err);
			});
	})();

	// when nav items clicked insert cool stuff
	function handleStateChange(state) {
		state     = state.slice(state.lastIndexOf('/') + 1);
		fetch('partials/' + state + '.html')
			.then(function (response) {
				return response.text();
			})
			.then(function (content) {
				// add content to dom
				bodyContainer.innerHTML = content;
				history.pushState(null,'',state);
				if (state == 'register') {
					let registerButton = document.querySelector('.register-btn');
					let regEmail       = document.querySelector('#reg-email');
					let regPassword    = document.querySelector('#reg-password');
					function regCb(evt) {
						evt.preventDefault();
						firechat.createUser(regEmail.value, regPassword.value);
					}
					registerButton.removeEventListener('click',regCb);
					registerButton.addEventListener('click', regCb);
				} else if (state == 'login') {
					let loginButton   = document.querySelector('.login-btn');
					let loginEmail    = document.querySelector('#login-email');
					let loginPassword = document.querySelector('#login-password');
					function loginCb(evt) {
						evt.preventDefault();
						firechat.signInUser(loginEmail.value, loginPassword.value);
					}
					loginButton.addEventListener('click', loginCb);
				}
			})
			.catch(function (err) {
				console.log(err);
			});
	}

	navLinks.forEach(function (navElm) {
		navElm.addEventListener('click', function (evt) {
			evt.preventDefault();
			let state = evt.target.href;
			handleStateChange(state);
		});
	});
	// logout special no
	logoutNav.addEventListener('click',function(evt){
		evt.preventDefault();
		firechat.signout();
		history.replaceState(null,'','/home');
		handleStateChange('home');
	});

})();

