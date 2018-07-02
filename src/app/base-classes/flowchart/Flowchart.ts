//
//	Flowchart class 
//  Implement IFlowchart
//	
//
//
import {IFlowchart} from './IFlowchart';
import {IGraphNode, IEdge, GraphNode} from '../node/NodeModule';
import {ICodeGenerator, IModule} from '../code/CodeModule';
import {InputPort} from '../port/PortModule';

import * as gs from 'gs-json';

export class Flowchart implements IFlowchart{

	public name: string;
	public description: string;
	public selectedNode: string;

	private _author: string; 

	private _nodes: IGraphNode[] = [];
	private _edges: IEdge[] = [];

	private _sortOrder: number[];
	private _selected: number;

	private _lastSaved: Date;

	private _globals = [];
	private _visibleNode;

	private _editable;

	//
	//	constructor needs 2 arguments  - username and icodegenerator
	//
	constructor(username: string, data?: any){ 
		this._author = username; 
		this.name = String((new Date()).getTime()) + ".mob";
		this.description = "Lorem ipsum proident nisi dolor ut minim in in non consectetur ut ut.";
		this.selectedNode = undefined;
		this._globals = [];
		this._editable = true;

		if(data){
			this.name = data["name"];
			this.description = data["description"];
			this.selectedNode = data["selectedNode"];

			this._globals = data["_globals"].map(function(in_data){
				let inputPort = new InputPort(in_data["_name"]);
				inputPort.update(in_data);
				return inputPort;
			});
			this._editable = data["_editable"] == undefined ? true : data["_editable"];
		}
	};

	setSavedTime(date: Date){
		this._lastSaved = date;
	}

	getSavedTime(): Date{
		return this._lastSaved;
	}

	//	gets author of the flowchart
	getAuthor(): string{
		return this._author;
	}

	//	Summary of flowchart
	getSummary(): string{
		return "This is a flowchart, with " + this._nodes.length + " nodes, written by " + this._author;
	}

	get globals(): any{
		return this._globals;
	}

	set globals(arr: any){
		this._globals = arr;
	}

	set visibleNode(id: number){
		this._visibleNode = this._nodes[id];
	}

	get visibleNode(){
		return this._visibleNode;
	}

	set editable(value){
		this._editable = value;
	}

	get editable(): any{
		return this._editable;
	}

	get nodes(): IGraphNode[]{
		return this._nodes;
	}

	get edges(): IEdge[]{
		return this._edges;
	}

	set edges(edges: IEdge[]){
		this._edges = edges;
	}


}


