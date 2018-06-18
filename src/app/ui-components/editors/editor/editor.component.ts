import { Component, OnInit, OnDestroy} from '@angular/core';
import { FlowchartService } from '../../../global-services/flowchart.service';
import { Viewer } from '../../../base-classes/viz/Viewer';
import { IGraphNode } from '../../../base-classes/node/NodeModule';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, OnDestroy{
  
  private _nodeX;

  _moduleList = [];
  _freeze: boolean;

  isVisible: boolean = false;

  constructor(private _fs: FlowchartService){}

  ngOnInit(){ 
  	this._nodeX = this._fs.node$.subscribe( (node:IGraphNode) => this.update_view(node)  );
    this._freeze = this._fs.freeze;
  }

  ngOnDestroy(){
    this._nodeX.unsubscribe() 
  }

  update_view(node:IGraphNode){
    this._freeze = this._fs.freeze;
    this.isVisible = node == undefined ? false : true; 
  }

}
