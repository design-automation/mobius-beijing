import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs/Rx";

import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

import { LayoutService } from '../../../global-services/layout.service';
import { FlowchartService } from '../../../global-services/flowchart.service';


import { Constants } from "../../../constants";


@Component({
  selector: 'app-mobius-viewer',
  templateUrl: './mobius-viewer.component.html',
  styleUrls: ['./mobius-viewer.component.scss'],
  animations: [
    trigger('slide_in_out', [
      state('slide_in', style({
        //background: 'red',
         opacity: 1
      })),
      state('slide_out', style({
        //background: 'blue',
         opacity: 0
      })),
      //transition('slide_in <=> slide_out', animate('300ms')),
      transition("slide_in <=> slide_out", animate("3s")),
    ]),
  ]
})
export class MobiusViewerComponent implements OnInit, AfterViewInit {

	visible: boolean = false; 
	layout;
	toggle;
    supported: boolean = false;
    slider_state:string;
    editable: boolean;

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

		this.slider_state = 'slide_in';
	}

	ngAfterViewInit(){
		this.visible = true;
		//this.editable = this.flowchartService.getFlowchart().editable;
	}

	getFlowchart(filename: string){
		let filepath: string = Constants.FILE_URL + filename;
		return filepath;
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

    toggleMenu(){
    	this.slider_state = this.slider_state == 'slide_in' ? 'slide_out' : 'slide_in';
    }
}
