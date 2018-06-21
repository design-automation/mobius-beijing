import { Component, Injector, OnInit, Input } from '@angular/core';

import { IPort } from '../../../base-classes/port/PortModule';
import { IGraphNode } from '../../../base-classes/node/NodeModule';

import * as gs from 'gs-json';

import { FlowchartService } from '../../../global-services/flowchart.service';

@Component({
  selector: 'app-cesium-viewer',
  templateUrl: './cesium-viewer.component.html',
  styleUrls: ['./cesium-viewer.component.scss']
})
export class CesiumViewerComponent implements OnInit{

  @Input() mode: string;

	port: IPort;
  private subscriptions = [];

  constructor(private _fs: FlowchartService){}

  ngOnInit(){
    this.subscriptions.push(this._fs.node$.subscribe( (node) => this.port = node.outputs[0] ));
  }

  ngOnDestroy(){
    this.subscriptions.map(function(s){
      s.unsubscribe();
    })
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