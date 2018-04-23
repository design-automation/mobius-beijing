import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs/Rx";

import { LayoutService } from '../../../global-services/layout.service';
import { FlowchartService } from '../../../global-services/flowchart.service';

@Component({
  selector: 'app-mobius-viewer',
  templateUrl: './mobius-viewer.component.html',
  styleUrls: ['./mobius-viewer.component.scss']
})
export class MobiusViewerComponent implements OnInit {

	layout;
	toggle;
    supported: boolean = false;

	router; sub;
	filepath: string;
	constructor(private _router: ActivatedRoute, private http: HttpClient,
		private layoutService: LayoutService, private flowchartService: FlowchartService) {
		this.router = _router;

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

	ngOnInit() {
		this.sub = this.router.params.subscribe(params => {
		   this.filepath = this.getFlowchart(params.id);
		   this.flowchartService.loadFile(this.filepath);
		});
	}

	getFlowchart(filename: string){
		let filepath: string = 
			"https://raw.githubusercontent.com/akshatamohanty/mobius-cesium/\
			master/src/assets/json-files/" + filename;
		return filepath;
		//return this.http.get(filepath).subscribe(val => console.log(val));
		//return .map((res: Response) => { res.json(); console.log(res)} );
	}

	ngOnDestroy() {
		this.sub.unsubscribe();
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
