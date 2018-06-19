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

}

