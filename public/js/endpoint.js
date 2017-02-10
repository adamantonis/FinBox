var request;

var endpoint={
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	Register: function(form){
		
		var self=this;
		
		if (request)
		{
			request.abort();
		}
		
		var $form = $(form);
		var $inputs = $form.find("input, select, button, textarea");
		
		var user_details={
			firstName:$("#registerFirstName").val(),
			lastName: $("#registerLastName").val(),
			email:    $("#registerEmail").val(),
			password: $("#registerPassword").val()
		};
		
		$inputs.prop("disabled",true);
		
		request = $.ajax({
			url: self.GetEndpointUrl($form.attr("action")),
			contentType: 'application/json',
			method: 'POST',
			data: JSON.stringify(user_details)
		});
		request.done(function (response, textStatus, jqXHR){
		
			// Returns 201 if user created successfully
			if (jqXHR.status==201)
			{
				$("#firstTimeUsername").html("Welcome "+user_details.firstName+", "+user_details.lastName);
				$(".welcomeElements").show();
				$(".loggedOnElements").hide();
				$(".loggedOffElements").hide();
				
				console.dir("success: Code: "+jqXHR.status+"\n\nDescription: "+jqXHR.statusText+"\n\nReason: "+jqXHR.responseText);
			}
			else
			{
				self.pageRegisterView();
				
				var msg="! Attention\n\nThere was a problem in the registration process:\n\n"+response.toString()+"\n\nCode: "+jqXHR.status+"\n\nDescription: "+jqXHR.statusText+"\n\nReason: "+jqXHR.responseText+"\n\nPlease refresh the page and try again\n\nIf the error persists please contact support at finbox@support.com";
				
				self.alertCustom(msg);
			}
			
			self.remStorage(); 
			self.setAjaxTokenHeader("");
		});
		request.fail(function (jqXHR, textStatus, errorThrown){
			
			self.pageRegisterView();
			self.remStorage(); 
			self.setAjaxTokenHeader("");

			var fail_msg="Code: "+jqXHR.status+"\n\nDescription: "+jqXHR.statusText+"\n\nReason: "+jqXHR.responseText;
			console.dir("fail: "+fail_msg);
			var msg="! Registration failed\n\n"+fail_msg;
			self.alertCustom(msg);
		});
		request.always(function (){
			$inputs.prop("disabled", false);
		});
		
		return false;
	},
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	Login: function(form){
		
		var self=this;
		
		if (request)
		{
			request.abort();
		}
		
		var $form = $(form);
		var $inputs = $form.find("input, select, button, textarea");
		
		var user_details={
			email:    $("#loginEmail").val(),
			password: $("#loginPassword").val()
		};
		
		$inputs.prop("disabled", true);
		
		request = $.ajax({
			url: self.GetEndpointUrl($form.attr("action")),
			contentType: 'application/json',
			method: 'POST',
			data: JSON.stringify(user_details)
		});
		request.done(function (response, textStatus, jqXHR){

			var done_msg="Code: "+jqXHR.status+"\n\nDescription: "+jqXHR.statusText+"\n\nReason: "+jqXHR.responseText;
			
			// Returns 204 if authorized
			if (jqXHR.status==204)
			{
				var new_token=jqXHR.getResponseHeader('x-access-token');
				if ((new_token!==undefined) && (new_token!==null) && (new_token!="")) 
				{
					$(".welcomeElements").hide();
					$(".loggedOnElements").show();
					$(".loggedOffElements").hide();
					
					self.setStorage("AuthJWT",new_token);
					self.setAjaxTokenHeader(new_token); 
					self.GetLoggedOnUserDetails('login',user_details.email);
					
					console.dir("success: "+done_msg);
				}
				else
				{
					self.pageLoginView();
					self.remStorage(); 
					self.setAjaxTokenHeader(""); 
					
					var msg="! Attention\n\nThe required authentication information was not retrieved from the server so we did not log you in for security purposes\n\nPlease refresh the page and try again\n\nIf the error persists please contact support at finbox@support.com\n\nDetails\n\n"+done_msg;
					self.alertCustom(msg)
				}
			}
			else
			{
				self.pageLoginView();
				self.remStorage(); 
				self.setAjaxTokenHeader("");
				
				var msg="! Attention\n\nAn unexpected status was retrieved from the server, so we did not log you in for security purposes\n\nPlease refresh the page and try again\n\nIf the error persists please contact support at finbox@support.com for further instructions\n\nDetails\n\n"+done_msg;
				self.alertCustom(msg)
			}
		});
		request.fail(function (jqXHR, textStatus, errorThrown){
		
			self.pageLoginView();
			self.remStorage(); 
			self.setAjaxTokenHeader("");
			
			var fail_msg="Code: "+jqXHR.status+"\n\nDescription: "+jqXHR.statusText+"\n\nReason: "+jqXHR.responseText;
			console.dir("fail: "+fail_msg);
			var msg="! Logging in failed\n\n"+fail_msg;
			self.alertCustom(msg);
		});
		request.always(function (){
			$inputs.prop("disabled", false);
		});
		
		return false;
	},
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	Logout: function(){
		
		var self=this;
		
		if (request)
		{
			request.abort();
		}
		
		request = $.ajax({
			url: self.GetEndpointUrl("/logout"),
			method: 'POST'
		});
		request.done(function (response, textStatus, jqXHR){
			// Returns 204 if logged out successfully
			if (jqXHR.status==204)
			{
				console.dir("success: "+jqXHR.status+", "+jqXHR.statusText+", "+jqXHR.responseText);
			}
			else
			{
				var msg="! Attention\n\nThere was a problem logging you out\n\n"+response.toString()+"\n\nCode: "+jqXHR.status+"\n\nDescription: "+jqXHR.statusText+"\n\nReason: "+jqXHR.responseText;
				self.alertCustom(msg);
			}
		});
		request.fail(function (jqXHR, textStatus, errorThrown){
			var fail_msg="Code: "+jqXHR.status+"\n\nDescription: "+jqXHR.statusText+"\n\nReason: "+jqXHR.responseText;
			console.dir("fail: "+fail_msg);
			var msg="! Logging out failed\n\n"+fail_msg;
			self.alertCustom(msg);
		});
		request.always(function (){
			self.pageLoginView();
			self.remStorage(); 
			self.setAjaxTokenHeader("");
		});
	},
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	GetLoggedOnUserDetails: function(when,AuthEmail){
		
		var self=this;
		
		if (request)
		{
			request.abort();
		}
		
		request = $.ajax({
			url: this.GetEndpointUrl("/me"),
			dataType: 'json',
			method: 'GET',
			data:{
				email: AuthEmail
			}
		});
		request.done(function (response, textStatus, jqXHR){
		
			var done_msg="Code: "+jqXHR.status+"\n\nDescription: "+jqXHR.statusText+"\n\nReason: "+jqXHR.responseText;
			
			if (response)
			{
				if (jqXHR.status==200)
				{
					self.setStorage("AuthFirstName",response.firstName);
					self.setStorage("AuthLastName",response.lastName);
					self.setStorage("AuthEmail",response.email);
					
					self.GetFileLists(response.email);
					
					$("#loggedAsFullName").html(response.firstName+" "+response.lastName);
				    $("#loggedAsEmail").html(response.email);
	
					$(".welcomeElements").hide();
					$(".loggedOnElements").show();
					$("#loggedOffElements").hide();
					$("#loginContainer").hide();
					$("#loggedAsContainer").show();
					$("#logoutLinkContainer").show();

					console.dir("success: "+done_msg);
				}
				else
				{
					self.pageLoginView();
					self.remStorage(); 
					self.setAjaxTokenHeader("");
					
					self.alertCustom("! Failed to get logged on user details\n\n"+response.toString()+"\n\n"+done_msg);
				}
			}
			else
			{
				self.alertCustom("! Failed to get logged on user details\n\n"+response.toString()+"\n\n"+done_msg);
			}
		});
		request.fail(function (jqXHR, textStatus, errorThrown){
			
			self.pageLoginView();
			self.remStorage(); 
			self.setAjaxTokenHeader("");
			
			var fail_msg="Code: "+jqXHR.status+"\n\nDescription: "+jqXHR.statusText+"\n\nReason: "+jqXHR.responseText;
			console.dir("fail: "+fail_msg);
			var msg="! Failed to get logged on user details\n\n"+fail_msg;
			self.alertCustom(msg);
		});
		request.always(function (){
		});
	},
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	GetFileLists: function(AuthEmail){
		
		var self=this;
		
		if (request)
		{
			request.abort();
		}
		
		request = $.ajax({
			url: this.GetEndpointUrl("/files"),
			dataType: 'json',
			method: 'GET',
			data:{
				email: AuthEmail
			}
		});
		request.done(function (response, textStatus, jqXHR){
		
			var done_msg="Code: "+jqXHR.status+"\n\nDescription: "+jqXHR.statusText+"\n\nReason: "+jqXHR.responseText;
			
			if (response)
			{
				if (jqXHR.status==200)
				{
					//console.dir("success: "+done_msg);
					
					console.dir("Code: "+jqXHR.status+"\n\nDescription: "+jqXHR.statusText);
					
					$("#filesTable tbody tr").html("");
					
					var actions="", tr="", tds="";
					for (var i=0; i<response.length; i++)
					{
						var file_id=response[i].id;
						var file_name=response[i].name;
						actions='<a href="#" class="actions" onclick="endpoint.DeleteFile('+file_id+');">delete</a> '+
								'<a href="#" class="actions" onclick="endpoint.UpdateFile('+file_id+');">update</a> '+
								'<a href="#" class="actions" onclick="endpoint.DownloadFile('+file_id+');">download</a>';							
						tds="";
						tr="<tr id=\"tr_file_id_"+file_id+"\">";
							tds=tds+"<td>"+response[i].name+"</td>"
							tds=tds+"<td>"+response[i].creationDate+"</td>"
							tds=tds+"<td>"+response[i].modificationDate+"</td>"
							tds=tds+"<td>"+response[i].mimeType+"</td>"
							tds=tds+"<td>"+response[i].fileSize+"KB</td>"
							tds=tds+"<td>"+actions+"</td>";
						tr=tr+tds+"<tr>";
						
						$("#filesTable tbody").append(tr);
					}
				}
				else
				{
					self.alertCustom("! Failed to get logged on user details\n\n"+response.toString()+"\n\n"+done_msg);
				}
			}
			else
			{
				self.alertCustom("! Failed to get logged on user details\n\n"+response.toString()+"\n\n"+done_msg);
			}
		});
		request.fail(function (jqXHR, textStatus, errorThrown){
			var fail_msg="Code: "+jqXHR.status+"\n\nDescription: "+jqXHR.statusText+"\n\nReason: "+jqXHR.responseText;
			console.dir("fail: "+fail_msg);
			var msg="! Failed to get logged on user details\n\n"+fail_msg;
			self.alertCustom(msg);
		});
		request.always(function (){
		});
	},
	GetFileDetails: function(file_id,call_back)
	{
		var self=this;
		
		if (request)
		{
			request.abort();
		}
		
		request = $.ajax({
			url: this.GetEndpointUrl("/files/"+file_id),
			dataType: 'json',
			method: 'GET',
			data:{
				email: this.getStorage("AuthEmail")
			}
		});
		request.done(function (response, textStatus, jqXHR){
		
			var done_msg="Code: "+jqXHR.status+"\n\nDescription: "+jqXHR.statusText+"\n\nReason: "+jqXHR.responseText;
			
			if (response)
			{
				if (jqXHR.status==200)
				{
					console.dir("success: "+done_msg);
					
					var file_name		     =response.name;
					var file_creationDate    =response.creationDate;
					var file_modificationDate=response.modificationDate;
					var file_mimeType		 =response.mimeType;
					var file_fileSize		 =response.fileSize;
					
					call_back(file_name,file_creationDate,file_modificationDate,file_mimeType,file_fileSize);
				}
				else
				{
					self.alertCustom("! Failed to get file details\n\n"+response.toString()+"\n\n"+done_msg);
				}
			}
			else
			{
				self.alertCustom("! Failed to get file details\n\n"+response.toString()+"\n\n"+done_msg);
			}
		});
		request.fail(function (jqXHR, textStatus, errorThrown){
			var fail_msg="Code: "+jqXHR.status+"\n\nDescription: "+jqXHR.statusText+"\n\nReason: "+jqXHR.responseText;
			console.dir("fail: "+fail_msg);
			var msg="! Failed to get file details\n\n"+fail_msg;
			self.alertCustom(msg);
		});
		request.always(function (){
		});
	},
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	UpdateFile: function(file_id){
		
		var $form = $("#updateFileForm");
		var $inputs = $form.find("input, select, button, textarea");
		$inputs.val("");
		
		this.GetFileDetails(file_id,function(filename){
			$("#fileToUpdateTitle").html(filename);
		});

		$("#fileToUpdateId").val(file_id);
		$("#fileToUpdateEmail").val(this.getStorage("AuthEmail"));
	
		$('#updateFileModal').modal('show');
		
		return false;
	},
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	DeleteFile: function(file_id){
		
		var $form = $("#deleteFileForm");
		var $inputs = $form.find("input, select, button, textarea");
		$inputs.val("");
		
		this.GetFileDetails(file_id,function(filename){
			$("#fileToDeleteTitle").html(filename);
		});
		
		$("#fileToDeleteId").val(file_id);
		$("#fileToDeleteEmail").val(this.getStorage("AuthEmail"));
		
		$('#deleteFileModal').modal('show');

		return false;
	},
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	DownloadFile: function(file_id){
		
		var token=this.getStorage("AuthJWT");
		var email=this.getStorage("AuthEmail");
		var url=this.GetEndpointUrl("/files/"+file_id+"/contents")+"?email="+email;
		
		var xmlhttp = new XMLHttpRequest();
		
		xmlhttp.open("GET", url, true);
		xmlhttp.responseType = "arraybuffer";
		xmlhttp.setRequestHeader("x-access-token", token);
		
		xmlhttp.onload = function(oEvent) {
			
			var filename = "";
			var mimetype = xmlhttp.getResponseHeader('Content-type');
			var disposition = xmlhttp.getResponseHeader('Content-Disposition');
			if (disposition && disposition.indexOf('attachment') !== -1) {
				var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
				var matches = filenameRegex.exec(disposition);
				if ((matches!=null) && (matches[1])) 
				{ 
					filename = matches[1].replace(/['"]/g,'');
					
					try 
					{
						var isFileSaverSupported = !!new Blob;
						if (isFileSaverSupported)
						{
							var blob = new Blob([xmlhttp.response], { type: mimetype });
							saveAs(blob, filename);
						}	
					} 
					catch(e) 
					{
						
					}
				}
			}
		};

		xmlhttp.send();
  
		return false;
	},
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	GetEndpointUrl: function(action){
		var url = window.location.href;
		var arr = url.split("/");
		var result = arr[0] + "//" + arr[2];
		var api_url=result+action;
		return api_url;
	},
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	setAjaxTokenHeader: function (token){
		$.ajaxSetup({
			headers: {
			  'x-access-token': token
			}
		});
	},
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	setStorage: function(name,value){
		if (typeof(Storage)!=="undefined") 
		{
			window.localStorage.setItem(name,value);
		}
	},
	getStorage: function(name){
		if (typeof(Storage)!=="undefined") 
		{
			if (window.localStorage.getItem(name))
			{
				return window.localStorage.getItem(name);
			}
			else
			{
				return "";
			}
		}
		else
		{
			return "";
		}
	},
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	remStorage: function(new_token){
		if (typeof(Storage) !== "undefined") 
		{
			if (window.localStorage.getItem("AuthJWT"))
			{
				window.localStorage.removeItem("AuthJWT");
				window.localStorage.removeItem("AuthFirstName");
				window.localStorage.removeItem("AuthLastName");
				window.localStorage.removeItem("AuthEmail");
			}
		}
	},
	pageLoginView: function()
	{
		$(".welcomeElements").hide();
		$(".loggedOffElements").hide();
		$(".loggedOnElements").hide();
		$("#loginContainer").show();
		$("#loggedAsContainer").hide();
		$("#logoutLinkContainer").hide();
	},
	pageRegisterView: function()
	{
		$(".welcomeElements").hide();
		$(".loggedOffElements").hide();
		$(".loggedOnElements").hide();
		$("#registerContainer").show();
		$("#loggedAsContainer").hide();
		$("#logoutLinkContainer").hide();
	},
	alertCustom: function(msg)
	{
		alert(msg);
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////
};
