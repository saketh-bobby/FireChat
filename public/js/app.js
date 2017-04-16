(function () {
	let firechat = new FireChat();
	// unlock the awesomeness of firebase
	firechat.initFirebase();
	// all DOM References
	let navbarBrand   = document.querySelector('.navbar-brand'),
	    loginNav      = document.getElementById('login-nav'),
	    registerNav   = document.getElementById('register-nav'),
	    logoutNav     = document.getElementById('logout-nav'),
	    chatNav= document.getElementById('chat-nav'),
	    bodyContainer = document.getElementById('body-container'),
	    navLinks      = [navbarBrand, loginNav, registerNav,chatNav];
	// for loading default state home
	//nasty bug here
	handleStateChange(firechat,'home',true);

	navLinks.forEach(function (navElm) {
		navElm.addEventListener('click', function (evt) {
			evt.preventDefault();
			let state = evt.target.href;
			state = state.slice(state.lastIndexOf('/') + 1);
			handleStateChange(firechat,state,true);
		});
	});
	// logout special no
	logoutNav.addEventListener('click', function (evt) {
		evt.preventDefault();
		firechat.signout();
		handleStateChange(firechat,'home',true);
	});

	window.onpopstate = function(evt){
		console.log(evt);
		handleStateChange(firechat,evt.state);
	};
})();

