import { Component, Injector, OnInit } from '@angular/core';

import { Viewer } from '../../../base-classes/viz/Viewer';
import { IPort } from '../../../base-classes/port/PortModule';

import * as gs from 'gs-json';

@Component({
  selector: 'app-cesium-viewer',
  templateUrl: './cesium-viewer.component.html',
  styleUrls: ['./cesium-viewer.component.scss']
})
export class CesiumViewerComponent extends Viewer implements OnInit{

	_port: IPort;
	gs_dummy_data: any = undefined; 

	constructor(injector: Injector){ 
		super(injector, "Cesium Viewer", "Displays geometry with each node in cesium viewer");  
	}

	reset(){ 
    this.gs_dummy_data = undefined;
	}

	ngOnInit(){
    this.update();
	}	

	update() :void{
      try{
        this._port = this.flowchartService.getSelectedPort();
        if(this._port){

          let portValue = this._port.getValue();
          if(portValue){
            this.gs_dummy_data = portValue;
          }
          else{
            this.gs_dummy_data = undefined;
          }
        }
      }
      catch(ex){
        this.gs_dummy_data = undefined;
      }

	}

}

