import { Component, OnInit, Input } from '@angular/core';
import { LayoutService } from '../../../global-services/layout.service';
import { FlowchartService } from '../../../global-services/flowchart.service';

import * as BrowserUtils from '../../../utils/Browser';

@Component({
  selector: 'app-mobius-editor',
  templateUrl: './mobius-editor.component.html',
  styleUrls: ['./mobius-editor.component.scss']
})
export class MobiusEditorComponent implements OnInit {

	layout;
    static supported: boolean = false;

    constructor(private layoutService: LayoutService, private flowchartService: FlowchartService){ 

    	let browser: string = BrowserUtils.checkBrowser();
    	if(browser == "Chrome"){
    		this.layout = layoutService.getAssets(); 
    		MobiusEditorComponent.supported = true;
    	}
    	else{
    		alert("Oops... You seem to be using a browser not supported by Mobius. Please use Chrome.");
    		MobiusEditorComponent.supported = false;
    	}

    }

    ngOnInit(){
    	BrowserUtils.enableLeavePageAlert();
    }

    ngOnDestroy(){
    	BrowserUtils.disableLeavePageAlert();
    }


}
