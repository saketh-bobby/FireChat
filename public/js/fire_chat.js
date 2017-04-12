SystemJS.import('js/toast_notifier.js');

let toastNotifier = new ToastNotifier();
let loginNav    = document.getElementById('login-nav'),
	registerNav = document.getElementById('register-nav'),
	logoutNav = document.getElementById('logout-nav');


function FireChat() {

}

FireChat.prototype.initFirebase = function () {
	this.auth     = firebase.auth();
	this.storage  = firebase.storage();
	this.database = firebase.database();
	this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

FireChat.prototype.createUser = function (email, password) {
	toastNotifier.initNotifier();
	this.auth
		.createUserWithEmailAndPassword(email, password)
		.then(function (user) {
			//  redirect to other url
			toastNotifier.display('alert-success',`Welcome ${user.email}`);
			history.replaceState(null,'','/home');
		})
		.catch(function (error) {
			//	handle error with messages
			toastNotifier.display('alert-danger',error.message);
		});
};

FireChat.prototype.signInUser = function (email, password) {
	toastNotifier.initNotifier();
	this.auth
		.signInWithEmailAndPassword(email, password)
		.then(function (user) {
			//  redirect to other url
			toastNotifier.display('alert-success',`Welcome ${user.email}`);
			history.replaceState(null,'','/home');
		})
		.catch(function (error) {
			//	handle error with messages
			toastNotifier.display('alert-danger',error.message);
		});
};

FireChat.prototype.onAuthStateChanged = function(user){
	if(user){
		loginNav.style.display = 'none';
		registerNav.style.display = 'none';
		logoutNav.style.display = 'inline-block';
	} else {
		loginNav.style.display = 'inline-block';
		registerNav.style.display = 'inline-block';
		logoutNav.style.display = 'none';
	}
};

FireChat.prototype.signout = function(){
	toastNotifier.initNotifier();
	this.auth.signOut()
		.then(function(){
			toastNotifier.display('alert-success','GoodBye, you have successfully logged out!');
		})
		.catch(function(error){
			toastNotifier.display('alert-danger',error.message);
		});
};

// export default FireChat;