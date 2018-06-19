import { Component, Injector, OnInit, Input } from '@angular/core';

import { Viewer } from '../../../base-classes/viz/Viewer';
import { IPort } from '../../../base-classes/port/PortModule';

import * as gs from 'gs-json';

@Component({
  selector: 'app-cesium-viewer',
  templateUrl: './cesium-viewer.component.html',
  styleUrls: ['./cesium-viewer.component.scss']
})
export class CesiumViewerComponent extends Viewer implements OnInit{

  @Input() mode: string;

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
            console.log(portValue.features[0])
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


  // save the geojson
  save_geojson(): void{
    let fileString = JSON.stringify(this.gs_dummy_data);
    let blob = new Blob([fileString], {type: 'application/json'});
    FileUtils.downloadContent(blob, "output.geojson");
  }

}



abstract class FileUtils{
  public static downloadContent(blob, filename) {
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, filename);
    } else {
        const a = document.createElement('a');
        document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = filename;
        a.click();
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 0)
    }
  }
}