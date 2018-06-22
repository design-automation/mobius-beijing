import { Injectable, Input, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import {IFlowchart, Flowchart, FlowchartReader} from '../base-classes/flowchart/FlowchartModule';
import {FlowchartUtils, FlowchartConnectionUtils} from '../base-classes/flowchart/Flowchart';
import {IGraphNode, GraphNode} from '../base-classes/node/NodeModule';
import {ICodeGenerator, CodeFactory, IModule, ModuleUtils} from "../base-classes/code/CodeModule";
import {IPort} from "../base-classes/port/PortModule";
import {IProcedure} from "../base-classes/procedure/IProcedure";

import {ConsoleService, EConsoleMessageType} from "./console.service";
import {MobiusService} from "./mobius.service";
import {ModuleService} from "./module.service";

//import {LayoutService} from "./layout.service";

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';


@Injectable()
export class FlowchartService {

	private _user: string = "AKM";
	private _origData: any;
  private code_generator: ICodeGenerator = CodeFactory.getCodeGenerator("js");


  // Observable Data sources
  // fcX.next() <-- to update
  private _flowchart: IFlowchart;
  private _active_node: IGraphNode;
  private fcX = new BehaviorSubject<IFlowchart>(this._flowchart);
	private nX = new BehaviorSubject<IGraphNode>(this._active_node);

	// Observable data streams
	// flowchart$.subscribe() <-- to update
	public flowchart$ = this.fcX.asObservable();
	public node$ = this.nX.asObservable();


	constructor(private consoleService: ConsoleService, 
	          private mobiusService: MobiusService, 
	          public dialog: MatDialog, private http: HttpClient) { 
	};

  push_flowchart(fc: IFlowchart){
    this.fcX.next(fc);
  }

  push_node(node: IGraphNode){
    this.nX.next(node);
  }

  getCodeGenerator(): ICodeGenerator{
    return this.code_generator;
  }

  addEdge(outputAddress: number[], inputAddress: number[]):  void{

      if(outputAddress[0] == inputAddress[0]){
        return;
      }

      try{
        this._flowchart.addEdge(outputAddress, inputAddress);
        this.consoleService.addMessage("New Edge was added");
      }
      catch(ex){
        this.consoleService.addMessage(ex, EConsoleMessageType.Error);
      }

      this.update();
  }

  disconnectPort(type: string, portIndex: number, nodeIndex: number): void{
    this._flowchart.disconnectPort(type, portIndex, nodeIndex)
  }

  disconnectNode(nodeIndex: number): void{
    this.fcX.next(FlowchartConnectionUtils.disconnect_node(this._flowchart, nodeIndex));
  }

  deletePort(type: string, portIndex: number): void{
    this._flowchart.deletePort(type, portIndex, this._selectedNode);
  }

  deleteEdge(edgeIndex: number): void{
    FlowchartUtils.delete_edge(this._flowchart, edgeIndex);
    
    // print message to console
    this.consoleService.addMessage("Edge was deleted");
  }

}



