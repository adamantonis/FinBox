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
			type:  "POST",
            error: function(jqXHR, textStatus, errorThrown){
				endpoint.ProcessFail(jqXHR, textStatus, errorThrown);
            },
            success: function(response, textStatus, jqXHR){
				
				var done_msg=endpoint.GetDoneMsg(response, textStatus, jqXHR);
				
				var validToken=endpoint.tokenActions(jqXHR,done_msg);
				if (validToken)
				{
					if ((jqXHR.status==201) && (form_context=="upload"))
					{
						endpoint.GetFileLists();
						$('#uploadFileModal').modal('hide');
					}
					else if ((jqXHR.status==204) && (form_context=="update"))
					{
						endpoint.GetFileLists();
						$('#updateFileModal').modal('hide');
					}
					else if ((jqXHR.status==204) && (form_context=="delete"))
					{
						endpoint.GetFileLists();
						$('#deleteFileModal').modal('hide');
					}
					else
					{
						endpoint.alertCustom(done_msg);
					}
				}
            }
		});
		
		return false; 
	});
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////