import { Component, OnInit, Injector, Input, 
		 ViewChild, ViewContainerRef, 
		 ComponentFactoryResolver } from '@angular/core';

import { Viewer } from '../../../base-classes/viz/Viewer';

import {GeometryViewerComponent} from '../geometry-viewer/geometry-viewer.component';
import {CesiumViewerComponent} from '../cesium-viewer/cesium-viewer.component';
import {TextViewerComponent} from '../text-viewer/text-viewer.component';
import {CodeViewerComponent} from '../code-viewer/code-viewer.component';
import {ConsoleComponent} from '../../console/console.component';
import {HelpViewerComponent} from '../../help/help-viewer/help-viewer.component';
import {InfoViewerComponent} from '../../help/info-viewer/info-viewer.component';

import { IGraphNode } from '../../../base-classes/node/NodeModule';
import { FlowchartService } from '../../../global-services/flowchart.service';

@Component({
  selector: 'app-viewer-container',
  templateUrl: './viewer-container.component.html',
  styleUrls: ['./viewer-container.component.scss']
})
export class ViewerContainerComponent implements OnInit {

	static ComponentMap = {
		"three-viewer" : GeometryViewerComponent,
		"cesium-viewer" : CesiumViewerComponent,
		"text-viewer": TextViewerComponent, 
		"code-viewer": CodeViewerComponent, 
		"console-viewer": ConsoleComponent, 
		"help-viewer": HelpViewerComponent, 
		"info-viewer": InfoViewerComponent 
	}

	@ViewChild('vc', {read: ViewContainerRef}) vc: ViewContainerRef;
	@Input() viewer_mode: boolean = false;


    private subscriptions = [];
    private active_node: IGraphNode;

    views = [];
	active_viewer: string = "info-viewer";

    constructor(private _fs: FlowchartService, 
    			private injector: Injector, 
    			private r: ComponentFactoryResolver){}

    ngOnInit(){
      this.subscriptions.push(this._fs.node$.subscribe( (node) => this.set_view(node) ));
    }

    ngOnDestroy(){
      this.subscriptions.map(function(s){
        s.unsubscribe();
      })
    }

    set_view(node: IGraphNode){
    	
    	let portType;
    	if(node){
			this.active_node = node;
			portType = parseInt((this.active_node.outputs[0].type).toString());
		}
		else{
			this.active_node = undefined;
			portType = 3;
		}

		let viewer_name: string;
		switch(portType){
			// case 0: 
			// 	this.active_viewer = "three-viewer"
			// 	break;
			case 1: 
				viewer_name = "code-viewer";
				break;
			case 2: 
				viewer_name = "text-viewer";
				break;
			case 3:
				viewer_name = "console-viewer";
				break;
			case 4: 
				viewer_name = "cesium-viewer";
				break;
			default:
				viewer_name = "console-viewer";
				break;
		}

		// if same as before, don't update
		if(this.active_viewer == viewer_name){
			return;
		}
		else{
			this.active_viewer = viewer_name;
			this.update_viewer();
		}

    }

    update_viewer(){
		// update the view
		if( !this.views[this.active_viewer] ){
			this.views[this.active_viewer] = this.createView(this.active_viewer);
		}

		this.vc.detach();
		this.vc.insert(this.views[ this.active_viewer ]);
    }

	showConsole(){
		this.active_viewer = "console-viewer";
	}

	showHelp(){
		this.active_viewer = "help-viewer";
	}

	private createView(component_name: string){

		let component = ViewerContainerComponent.ComponentMap[component_name];
		let factory = this.r.resolveComponentFactory(component);
   		let componentRef = factory.create(this.injector);
   		if(component_name == "cesium-viewer"){
   			componentRef.instance["mode"] = this.viewer_mode ? "viewer" : "editor";
   		}
    	let view = componentRef.hostView;
    	return view;
	}

}
