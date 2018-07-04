import { Component, Injector, OnInit } from '@angular/core';

import { OutputPort } from '../../../base-classes/port/PortModule';
import { FlowchartService } from '../../../global-services/flowchart.service';

import * as gs from 'gs-json';

@Component({
  selector: 'app-geometry-viewer',
  templateUrl: './geometry-viewer.component.html',
  styleUrls: ['./geometry-viewer.component.scss']
})
export class GeometryViewerComponent implements OnInit{

	_port: OutputPort;
	gs_dummy_data: any;

  private subscriptions = [];

  constructor(private _fs: FlowchartService){}

  ngOnInit(){
    this.subscriptions.push(this._fs.node$.subscribe( (node) => {
          this._port = node.outputs[0];
    }));
  }

  ngOnDestroy(){
    this.subscriptions.map(function(s){
      s.unsubscribe();
    })
  }

	reset(){ 
    this.gs_dummy_data = undefined;
	}

}

