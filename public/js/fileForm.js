//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
$(document).ready(function(){
	$('.fileForm').submit(function(event){
		
		var self=this;
		
		var endpoint_url=endpoint.GetEndpointUrl($(this).attr("action"));
		var form_name=$(this).attr("name");
		
		var file_id;
		if (form_name=="uploadFileForm")
		{
			endpoint_url+="/?_method=PUT";
		}
		else if (form_name=="updateFileForm")
		{
			file_id=$("#fileToUpdateId").val();
			endpoint_url+="/"+file_id+"?_method=PATCH";
		}
		else if (form_name=="deleteFileForm")
		{
			file_id=$("#fileToDeleteId").val();
			endpoint_url+="/"+file_id+"?_method=DELETE";
		}
	
		var form_context="upload";
		if (form_name=="updateFileForm")
		{
			form_context="update";
		}
		else if (form_name=="deleteFileForm")
		{
			form_context="delete";
		}

		$(this).ajaxSubmit({
			url:   endpoint_url,
			//type:  "POST",
            error: function(jqXHR, textStatus, errorThrown){
				var error_msg="Code: "+jqXHR.status+"\n\nDescription: "+jqXHR.statusText+"\n\nReason: "+jqXHR.responseText;
				console.dir("fail: "+error_msg);
				var msg="! File "+form_context+" failed\n\n"+error_msg;
				endpoint.alertCustom(msg);
            },
            success: function(response, textStatus, jqXHR){
				
				var msg=form_context+": Code: "+jqXHR.status+"\n\nDescription: "+jqXHR.statusText+"\n\nReason: "+jqXHR.responseText
				
				var AuthEmail=endpoint.getStorage("AuthEmail");
				if ((jqXHR.status==201) && (form_context=="upload"))
				{
					console.dir("successful "+msg);
					endpoint.GetFileLists(AuthEmail);
					$('#uploadFileModal').modal('hide');
				}
				else if ((jqXHR.status==204) && (form_context=="update"))
				{
					console.dir("successful "+msg);
					endpoint.GetFileLists(AuthEmail);
					$('#updateFileModal').modal('hide');
				}
				else if ((jqXHR.status==204) && (form_context=="delete"))
				{
					console.dir("successful "+msg);
					endpoint.GetFileLists(AuthEmail);
					$('#deleteFileModal').modal('hide');
				}
				else
				{
					console.dir("fail: "+msg);
					alertCustom(msg);
				}
            }
		});
		
		return false; 
	});
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////