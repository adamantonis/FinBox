(function() {
	// Modern Browsers supporting addEventListener
	if(window.addEventListener) 
	{
		window.addEventListener("storage",endpoint.remSessionStorage,false);
	} 
	// Backwards compatibility for older IE versions
	else 
	{
		window.attachEvent("onstorage",endpoint.remSessionStorage);
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	if(window.addEventListener) 
	{
		window.addEventListener("storage",endpoint.keepSessionStorage,false);
	} 
	// Backwards compatibility for older IE versions
	else 
	{
		window.attachEvent("onstorage",endpoint.keepSessionStorage);
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Ask other tabs for session storage
	if (!sessionStorage.length) 
	{
		localStorage.setItem('getSessionStorage', new Date());
		localStorage.removeItem('getSessionStorage');
		endpoint.pageLoginView();
	}
	else
	{
		endpoint.setGlobalAjaxHeaders(); 
		endpoint.GetLoggedOnUserDetails();
	}
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	$("#logoutLink").click(function(){
		endpoint.Logout();
	})
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	$("#firstTimeLink").click(function(){
		endpoint.pageLoginView();
	})
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	$("#registerLink").click(function(){
		endpoint.pageRegisterView();
	})
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	$("#uploadNewFileLink").click(function(){
		$('#uploadFileModal').modal('show');
	});
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	$(".updateExistingFileLink").click(function(){
		$('#updateFileModal').modal('show');
	});
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	$('#uploadFileModal').on('show.bs.modal', function (event) {
		var $form = $("#uploadFileForm");
		var $inputs = $form.find("input, select, button, textarea");
		$inputs.val("");
		var modal = $(this);
	});
	$('#updateFileModal').on('show.bs.modal', function (event) {
		var modal = $(this);
	});
	$('#deleteFileModal').on('show.bs.modal', function (event) {
		var modal = $(this);
	});
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	$('#uploadFileModal').on('hide.bs.modal', function (event) {
		var $form = $("#uploadFileForm");
		var $inputs = $form.find("input, select, button, textarea");
		$inputs.val("");
		var modal = $(this);
	});
	$('#updateFileModal').on('hide.bs.modal', function (event) {
		var $form = $("#updateFileForm");
		var $inputs = $form.find("input, select, button, textarea");
		$inputs.val("");
		var modal = $(this);
	});
	$('#deleteFileModal').on('hide.bs.modal', function (event) {
		var $form = $("#deleteFileForm");
		var $inputs = $form.find("input, select, button, textarea");
		$inputs.val("");
		var modal = $(this);
	});
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
})();