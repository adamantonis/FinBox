var request;

var endpoint={
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	Register: function(form) {
		
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
			dataType: 'json',
			data: JSON.stringify(user_details)
		});
		request.done(function (response, textStatus, jqXHR) {
			
			var done_msg=self.GetDoneMsg(response, textStatus, jqXHR);
			
			// Returns 201 if user created successfully
			if (jqXHR.status==201)
			{
				$("#firstTimeUsername").html("Welcome "+user_details.firstName+", "+user_details.lastName);
				$(".welcomeElements").show();
				$(".loggedOnElements").hide();
				$(".loggedOffElements").hide();
			}
			else
			{
				self.pageRegisterView();
				self.alertCustom(done_msg);
			}
			
			self.remStorage(); 
			self.setGlobalAjaxHeaders();
		});
		request.fail(function (jqXHR, textStatus, errorThrown) {
			self.pageRegisterView();
			self.remStorage(); 
			self.setGlobalAjaxHeaders();
			self.ProcessFail(jqXHR, textStatus, errorThrown);
		});
		request.always(function () {
			$inputs.prop("disabled", false);
		});
		
		return false;
	},
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	Login: function(form) {
		
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
			dataType: 'json',
			method: 'POST',
			data: JSON.stringify(user_details)
		});
		request.done(function (response, textStatus, jqXHR) {
			
			var done_msg=self.GetDoneMsg(response, textStatus, jqXHR);
			
			// Returns 204 if authorized
			if (jqXHR.status==204)
			{
				var validToken=self.tokenActions(jqXHR,done_msg);
				if (validToken)
				{
					self.GetLoggedOnUserDetails();
				}
			}
			else
			{
				self.FailActions();
				self.alertCustom(done_msg)
			}
		});
		request.fail(function (jqXHR, textStatus, errorThrown) {
			self.FailActions();
			self.ProcessFail(jqXHR, textStatus, errorThrown);
		});
		request.always(function () {
			$inputs.prop("disabled", false);
		});
		
		return false;
	},
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	Logout: function() {
		
		var self=this;
		
		if (request)
		{
			request.abort();
		}
		
		request = $.ajax({
			url: self.GetEndpointUrl("/logout"),
			dataType: 'json',
			method: 'POST'
		});
		request.done(function (response, textStatus, jqXHR) {
			
			var done_msg=self.GetDoneMsg(response, textStatus, jqXHR);
			
			// Returns 204 if logged out successfully
			if (jqXHR.status!=204)
			{
				self.alertCustom(done_msg);
			}
		});
		request.fail(function (jqXHR, textStatus, errorThrown) {
			self.ProcessFail(jqXHR, textStatus, errorThrown);
		});
		request.always(function () {
			self.FailActions();
		});
	},
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	GetLoggedOnUserDetails: function() {
		
		var self=this;
		
		if (request)
		{
			request.abort();
		}
		
		request = $.ajax({
			url: this.GetEndpointUrl("/me"),
			dataType: 'json',
			method: 'GET'
			
		});
		request.done(function (response, textStatus, jqXHR) {
		
			var done_msg=self.GetDoneDataMsg(response, textStatus, jqXHR);
			
			if (jqXHR.status==200)
			{
				var validToken=self.tokenActions(jqXHR,done_msg);
				if (validToken)
				{
					self.GetFileLists();
					
					$("#loggedAsFullName").html(response.firstName+" "+response.lastName);
					$("#loggedAsEmail").html(response.email);

					$(".welcomeElements").hide();
					$(".loggedOnElements").show();
					$("#loggedOffElements").hide();
					$("#loginContainer").hide();
					$("#loggedAsContainer").show();
					$("#logoutLinkContainer").show();
				}
			}
			else
			{
				self.FailActions();
				self.alertCustom(done_msg);
			}
		});
		request.fail(function (jqXHR, textStatus, errorThrown) {
			self.FailActions();
			self.ProcessFail(jqXHR, textStatus, errorThrown);
		});
		request.always(function () {
		});
	},
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	GetFileLists: function() {
		
		var self=this;
		
		if (request)
		{
			request.abort();
		}
		
		request = $.ajax({
			url: this.GetEndpointUrl("/files"),
			dataType: 'json',
			method: 'GET'
		});
		request.done(function (response, textStatus, jqXHR) {
		
			var done_msg=self.GetDoneDataMsg(response, textStatus, jqXHR);
			
			if (jqXHR.status==200)
			{
				var validToken=self.tokenActions(jqXHR,done_msg);
				if (validToken)
				{
					$("#filesTable tbody").html("");
					
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
			}
			else
			{
				self.alertCustom(done_msg);
			}
		});
		request.fail(function (jqXHR, textStatus, errorThrown) {
		    self.FailActions();
			self.ProcessFail(jqXHR, textStatus, errorThrown);
		});
		request.always(function () {
		});
	},
	GetFileDetails: function(file_id,call_back) {
		
		var self=this;
		
		if (request)
		{
			request.abort();
		}
		
		request = $.ajax({
			url: this.GetEndpointUrl("/files/"+file_id),
			dataType: 'json',
			method: 'GET'
		});
		request.done(function (response, textStatus, jqXHR) {
		
			var done_msg=self.GetDoneDataMsg(response, textStatus, jqXHR);
			
			if (jqXHR.status==200)
			{
				var validToken=self.tokenActions(jqXHR,done_msg);
				if (validToken)
				{
					var file_name		     =response.name;
					var file_creationDate    =response.creationDate;
					var file_modificationDate=response.modificationDate;
					var file_mimeType		 =response.mimeType;
					var file_fileSize		 =response.fileSize;
					
					call_back(file_name,file_creationDate,file_modificationDate,file_mimeType,file_fileSize);
				}
			}
			else
			{
				self.alertCustom(done_msg);
			}
		});
		request.fail(function (jqXHR, textStatus, errorThrown){
			self.FailActions();
			self.ProcessFail(jqXHR, textStatus, errorThrown);
		});
		request.always(function () {
		});
	},
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	UpdateFile: function(file_id) {
		
		var $form = $("#updateFileForm");
		var $inputs = $form.find("input, select, button, textarea");
		$inputs.val("");
		
		this.GetFileDetails(file_id,function(filename){
			$("#fileToUpdateTitle").html(filename);
		});

		$("#fileToUpdateId").val(file_id);
	
		$('#updateFileModal').modal('show');
		
		return false;
	},
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	DeleteFile: function(file_id) {
		
		var $form = $("#deleteFileForm");
		var $inputs = $form.find("input, select, button, textarea");
		$inputs.val("");
		
		this.GetFileDetails(file_id,function(filename){
			$("#fileToDeleteTitle").html(filename);
		});
		
		$("#fileToDeleteId").val(file_id);
		
		$('#deleteFileModal').modal('show');

		return false;
	},
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	DownloadFile: function(file_id) {
		
		var self=this;
		
		var url=this.GetEndpointUrl("/files/"+file_id+"/contents");
		
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open("GET", url, true);
		xmlhttp.responseType = "arraybuffer";
		xmlhttp.setRequestHeader('Authorization','Bearer '+this.getStorage('finbox_token'));
		
		xmlhttp.onload = function(oEvent) {
			
			var done_msg=self.GetDoneDataMsg(xmlhttp.response, xmlhttp.statusText, xmlhttp);
			
			var validToken=self.tokenActions(xmlhttp,done_msg);
			if (validToken)
			{
				var filename = "";
				var mimetype = xmlhttp.getResponseHeader('Content-type');
				var disposition = xmlhttp.getResponseHeader('Content-Disposition');
				if ((disposition) && (disposition.indexOf('attachment') !== -1)) {
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
			}
		};

		xmlhttp.send();
  
		return false;
	},
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	GetEndpointUrl: function(action) {
		var url = window.location.href;
		var arr = url.split("/");
		var result = arr[0] + "//" + arr[2];
		var api_url=result+action;
		return api_url;
	},
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	setGlobalAjaxHeaders: function () {
		$.ajaxSetup({
			headers: {
			  'Authorization': 'Bearer '+this.getStorage('finbox_token')
			}
		});
	},
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	tokenActions: function (jqXHR,done_msg) {

		var token=jqXHR.getResponseHeader('Authorization');
		if ((token===undefined) || (token===null) || ($.trim(token).length===0)) 
		{
			this.FailActions();
			this.alertCustom(done_msg);
		}
		else
		{
			if (token.indexOf(' ')!=-1)
			{
				token=token.split(' ')[1];
				if ($.trim(token).length!==0)
				{
					$(".welcomeElements").hide();
					$(".loggedOnElements").show();
					$(".loggedOffElements").hide();

					this.setStorage("finbox_token",token);
					this.setGlobalAjaxHeaders(); 
					
					return true;
				}
				else
				{
					this.FailActions();
					this.alertCustom(done_msg);
				}
			}
			else
			{
				this.FailActions();
				this.alertCustom(done_msg);
			}
		}
		
		return false;
	},
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	setStorage: function(name,value) {
		if (typeof(Storage)!=="undefined") 
		{
			sessionStorage.setItem(name,value);
		}
	},
	getStorage: function(name) {
		if (typeof(Storage)!=="undefined") 
		{
			if (sessionStorage.getItem(name))
			{
				return sessionStorage.getItem(name);
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
	remStorage: function() {
		if (typeof(Storage) !== "undefined") 
		{
			if (sessionStorage.getItem("finbox_token"))
			{
				// clear all session data
				sessionStorage.clear();
				
				// Ask other tabs to remove their session storage indirectly - this will fire an event on rest tabs
				localStorage.setItem('remSessionStorage', new Date());
				localStorage.removeItem('remSessionStorage');
				
				// remove any temporal localStorage used in this session just in case
				localStorage.removeItem("finbox_token");
			}
		}
	},
	keepSessionStorage: function(event) {
		// IE
		if(!event) 
		{ 
			event = window.event; 
		}
		
		if(event.newValue)
		{
			// Some tab asked for the sessionStorage so send it
			if (event.key == 'getSessionStorage') 
			{
				localStorage.setItem('sessionStorage', JSON.stringify(sessionStorage));
				localStorage.removeItem('sessionStorage');
			} 
			// sessionStorage is empty so fill it
			else if ((event.key == 'sessionStorage') && (!sessionStorage.length)) 
			{
				var data = JSON.parse(event.newValue);
				for (key in data) 
				{
					sessionStorage.setItem(key, data[key]);
				}
			}
		}
	},
	remSessionStorage: function(event) {
		// IE
		if(!event) 
		{ 
			event = window.event; 
		}

		// Some tab requested removal of sessionStorage so remove it
		if (event.key == 'remSessionStorage') 
		{
			endpoint.remStorage();
		} 
	},
	pageLoginView: function() {
		$(".welcomeElements").hide();
		$(".loggedOffElements").hide();
		$(".loggedOnElements").hide();
		$("#loginContainer").show();
		$("#loggedAsContainer").hide();
		$("#logoutLinkContainer").hide();
	},
	pageRegisterView: function() {
		$(".welcomeElements").hide();
		$(".loggedOffElements").hide();
		$(".loggedOnElements").hide();
		$("#registerContainer").show();
		$("#loggedAsContainer").hide();
		$("#logoutLinkContainer").hide();
	},
	FailActions:function() {
		this.pageLoginView();
		this.remStorage(); 
		this.setGlobalAjaxHeaders();
	},
	ProcessFail: function(jqXHR,textStatus,errorThrown) {
		var fail_msg=this.GetFailMsg(jqXHR,textStatus,errorThrown);
		this.alertCustom(fail_msg);
	},
	GetDoneMsg: function(response, textStatus, jqXHR) {
		var message=((response!==undefined)&&(response!==null))?response.message:"";
		var done_msg="Code: "+jqXHR.status+"\n\nDescription: "+jqXHR.statusText+((response!="")?("\n\nReason: "+message):"");
		return done_msg;
	},
	GetDoneDataMsg: function(response, textStatus, jqXHR) {
		var done_msg="Code: "+jqXHR.status+"\n\nDescription: "+jqXHR.statusText;
		return done_msg;
	},
	GetFailMsg: function(jqXHR, textStatus, errorThrown) {
		var response=((jqXHR!==undefined)&&(jqXHR!==null))?JSON.parse(jqXHR.responseText):"";
		var fail_msg="Code: "+jqXHR.status+"\n\nDescription: "+jqXHR.statusText+((response!="")?("\n\nReason: "+response.message):"");
		return fail_msg;
	},
	alertCustom: function(msg) {
		msg=msg.split('\n\n').map(function(x) {
			return ("<p>"+x+"</p>");
		}).join('');
		$("#alertCustomMessage").css('text-align','center');
		$("#alertCustomMessage").html(msg);
		$('#alertCustomModal').modal('show');
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////
};
