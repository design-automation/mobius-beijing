import { Component, OnInit, Input } from '@angular/core';
import { LayoutService } from '../../../global-services/layout.service';
import { FlowchartService } from '../../../global-services/flowchart.service';

@Component({
  selector: 'app-mobius-editor',
  templateUrl: './mobius-editor.component.html',
  styleUrls: ['./mobius-editor.component.scss']
})
export class MobiusEditorComponent implements OnInit {


	// mode: 0 ==> Viewer
	// mode: 1 ==> Editor
	@Input() mode: string;
	@Input() filepath: string;

	layout;
	toggle;
    supported: boolean = false;

    constructor(private layoutService: LayoutService, private flowchartService: FlowchartService){ 

    	let browser: string = this.checkBrowser();
    	if(browser == "Chrome"){
    		this.layout = layoutService.getAssets(); 
    		this.toggle = layoutService.toggleMode;
    		this.supported = true;
    	}
    	else{
    		alert("Oops... You seem to be using a browser not supported by Mobius. Please use Chrome.");
    		this.supported = false;
    	}

    }

    ngOnInit(){

    	if(this.mode == "Editor" ){
    		this.layoutService.setEditor();
    	}
    	else if(this.mode == "Viewer"){
    		this.layoutService.setViewer();
    	}

    	if(this.layout.mode == 'Editor'){
	    	window.onbeforeunload = function(e) {
			  var dialogText = 'Dialog text here';
			  e.returnValue = dialogText;
			  return dialogText;
			};
    	}
    	else{
    		window.onbeforeunload = undefined;
    	}

    	this.flowchartService.loadFile(this.filepath);
    }

    checkBrowser(): string { 
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

}
