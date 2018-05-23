function checkBrowser(): string { 
	let brw: string = "";
 	if((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1 ) 
    {
        brw = 'Opera';
    }
    else if(navigator.userAgent.indexOf("Chrome") != -1 )
    {
        brw = 'Chrome';
    }
    else if(navigator.userAgent.indexOf("Safari") != -1)
    {
        brw = 'Safari';
    }
    else if(navigator.userAgent.indexOf("Firefox") != -1 ) 
    {
         brw = 'Firefox';
    }
    else if((navigator.userAgent.indexOf("MSIE") != -1 ) || (!!document["documentMode"] == true )) //IF IE > 10
    {
      brw = 'IE'; 
    } 
    else if(window.navigator.userAgent.indexOf("Edge") > -1) //IF IE > 10
    {
      brw = 'Edge'; 
    } 
    else 
    {
       brw = 'unknown';
    }

    return brw;
}

function enableLeavePageAlert(){
	window.onbeforeunload = function(e) {
	  var dialogText = 'Dialog text here';
	  e.returnValue = dialogText;
	  return dialogText;
	};
}

function disableLeavePageAlert(){
	window.onbeforeunload = undefined;
}

export {checkBrowser, enableLeavePageAlert, disableLeavePageAlert};