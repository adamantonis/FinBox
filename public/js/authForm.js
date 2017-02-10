$(document).ready(function(){
	$("#registerForm").submit(function(event){

		event.preventDefault();
		
		var ret=endpoint.Register(this);
		
		return false;
	});
	$("#loginForm").submit(function(event){

		event.preventDefault();
		
		var ret=endpoint.Login(this);
		
		return false;
	});
});
