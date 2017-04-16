
function ToastNotifier(){
	this.notifier = null;
}

ToastNotifier.prototype.initNotifier = function(){
	this.notifier = document.createElement('div');
	this.notifier.classList.add('alert','toaster-alert');
};

ToastNotifier.prototype.display = function(className,message){
	this.notifier.innerText = message;
	this.notifier.classList.add(className);
	document.body.appendChild(this.notifier);
	setTimeout(() => {
		document.body.removeChild(this.notifier);
		this.notifier = null;
	}, 2000);
};

ToastNotifier.prototype.exists = function(){
	return this.notifier;
};

// export default ToastNotifier;

