import { Component, Injector, OnInit } from '@angular/core';

import { Viewer } from '../../../base-classes/viz/Viewer';
import { IGraphNode } from '../../../base-classes/node/NodeModule';
import { IPort } from '../../../base-classes/port/PortModule';

import CircularJSON from 'circular-json';
import * as js_beautify from 'js-beautify';

@Component({
  selector: 'app-text-viewer',
  templateUrl: './text-viewer.component.html',
  styleUrls: ['./text-viewer.component.scss']
})
export class TextViewerComponent extends Viewer implements OnInit {

	_selectedNode: IGraphNode;
	_selectedPort: IPort;

	_outResults;

	constructor(injector: Injector){ 
		super(injector, "Text Viewer", "Displayed geometry with each node.");  
	}

	ngOnInit() {
		this._outResults = [];
		this.update();
	}

	reset(): void{
		this.update();
	}

	getPortContent(): string{

		if(this._selectedPort == undefined){
			return "";
		}

		let value = this._selectedPort.getValue();
		if(typeof(value) == "object"){
			value = JSON.stringify(value);
			if(value.length > 397){
				value = value.substr(0,397) + "...";
			}
		}

		return value;
	}

	getText(output: IPort): string{
		console.log("getting text");
		let val = output.getValue();

		if(val){
			let result = val;

			if(typeof(val) == "object"){
				let strRep: string = val.toString();
				if(strRep !== "[object Object]"){
					result = strRep.replace(/\n/g, '<br>');
				}
			}

			return result;
		}
		else{
			return "no-value-available";
		}
	}

	isJSON(output: IPort): boolean{
		let val = output.getValue();
		return (typeof(val) == "object" && val.toString() == "[object Object]");
	}

	update() :void{
		console.log("update text viewer")

		try{
			this._selectedNode = this.flowchartService.getSelectedNode();	
			this._selectedPort = this.flowchartService.getSelectedPort();

			let self = this;
			this._outResults = this._selectedNode.getOutputs().map(function(output){
				let name = output.getName();
				let isJSON = self.isJSON(output);
				let text = self.getText(output);
				let value = output.getValue();
				let outObj = {name: name, isJSON: isJSON, text: text, value: value}
				console.log(outObj);
				return outObj;
			})
		}
		catch(ex){

		}
	}
}
