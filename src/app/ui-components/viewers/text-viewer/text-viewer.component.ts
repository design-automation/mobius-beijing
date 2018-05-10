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
		try{
			let val = output.getValue();

			if(val){
				let result = val;

				if(Array.isArray(val)){
					result = "<em>Array(" + val.length + " items)</em>"
				}
				else if(typeof(val) == "object"){
					let strRep: string = val.toString();
					if(strRep !== "[object Object]"){
						result = strRep.replace(/\n/g, '<br>');
					}
					else{
						let keys = Object.keys(val);
						result = "<b>JSON Object</b><br>"
						result += output.getName();
						result += "<ul>" + keys.map(function(k){
							let type: string = typeof(val[k]);
							if (Array.isArray(val[k])){
								type = "<em>array(" + val[k].length + " items)</em>"
							}
							else if(type == "string"){
								type = "\"" + val[k] + "\"";
							}
							else if(type == "number"){
								type = val[k];
							}
							else if(type == "object"){
								type = "<em>" + type + "</em>";
							}

							return "<li>" + k + " :: "+  type + "</li>";
						}).join("") + "</ul>";
					}
				}

				return result;
			}
			else{
				return "no-value-available";
			}
		}
		catch(ex){
			return "error-generating-input";
		}
	}

	isJSON(output: IPort): boolean{
		let val = output.getValue();
		return (typeof(val) == "object" && val.toString() == "[object Object]");
	}

	update() :void{
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
				return outObj;
			})
		}
		catch(ex){

		}
	}
}
