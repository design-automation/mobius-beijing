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

@Component({
  selector: 'app-viewer-container',
  templateUrl: './viewer-container.component.html',
  styleUrls: ['./viewer-container.component.scss']
})
export class ViewerContainerComponent extends Viewer implements OnInit {

	@ViewChild('vc', {read: ViewContainerRef}) vc: ViewContainerRef;
	@Input() viewer_mode: boolean = false;

  	views = [];
	active_viewer: string = "console-viewer";
	injector;

	static ComponentMap = {
		"three-viewer" : GeometryViewerComponent,
		"cesium-viewer" : CesiumViewerComponent,
		"text-viewer": TextViewerComponent, 
		"code-viewer": CodeViewerComponent, 
		"console-viewer": ConsoleComponent, 
		"help-viewer": HelpViewerComponent, 
		"info-viewer": InfoViewerComponent 
	}

	constructor(injector: Injector, private r: ComponentFactoryResolver){ 
		super(injector, "Viewer Container", "Contains all the viewers");  
		this.injector = injector;
	}

	createView(component_name: string){
		let component = ViewerContainerComponent.ComponentMap[component_name];
		let factory = this.r.resolveComponentFactory(component);
   		let componentRef = factory.create(this.injector);
    	let view = componentRef.hostView;
    	return view;
	}

  	ngOnInit() { }

  	ngAfterViewInit(){
  		this.showConsole();
  	}

	ngOnDestroy(){ }

	reset(): void{
		this.active_viewer = "console-viewer";
		this.updateView();
	}

	update(): void{

		let selectedNode = this.flowchartService.getSelectedNode();
		let selectedPort = this.flowchartService.getSelectedPort();	

		let portType = parseInt(selectedPort.getType());

		console.log(portType);

		// todo: refactor 
		switch(portType){
			case 0: 
				this.active_viewer = "three-viewer"
				break;
			case 1: 
				this.active_viewer = "code-viewer"
				alert("code active")
				break;
			case 2: 
				this.active_viewer = "text-viewer"
				break;
			case 3:
				this.active_viewer = "console-viewer"
				break;
			case 4: 
				this.active_viewer = "cesium-viewer"
				break;
			default:
				this.reset();
		}

		this.updateView();

	}	

	updateView(): void{
		if( !this.views[this.active_viewer] ){
			this.views[this.active_viewer] = this.createView(this.active_viewer);
		}

		this.vc.detach();
		this.vc.insert(this.views[ this.active_viewer ]);
	}

	showConsole(){
		this.active_viewer = "console-viewer";
		this.updateView();
	}

	showHelp(){
		this.active_viewer = "help-viewer";
		this.updateView();
	}

}
