
function ToastNotifier(){

}

ToastNotifier.prototype.initNotifier = function(){
	this.notifier = document.createElement('div');
	this.notifier.classList.add('alert','toaster-alert');
};

ToastNotifier.prototype.display = function(className,message){
	this.notifier.innerText = message;
	this.notifier.classList.add(className);
	document.body.appendChild(this.notifier);
	setTimeout(function () {
		document.body.removeChild(this.notifier);
	}.bind(this), 10000);
};


// export default ToastNotifier;

