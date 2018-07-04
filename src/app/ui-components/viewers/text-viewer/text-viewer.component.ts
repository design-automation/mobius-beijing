import { Component, Injector, OnInit } from '@angular/core';

import { IGraphNode } from '../../../base-classes/node/NodeModule';
import { IPort, OutputPort } from '../../../base-classes/port/PortModule';

import CircularJSON from 'circular-json';
import * as js_beautify from 'js-beautify';

import { FlowchartService } from '../../../global-services/flowchart.service';

@Component({
  selector: 'app-text-viewer',
  templateUrl: './text-viewer.component.html',
  styleUrls: ['./text-viewer.component.scss']
})
export class TextViewerComponent implements OnInit {

	private subscriptions = [];
	private active_node: IGraphNode;
	private port: IPort;
	_outResults;

	constructor(private _fs: FlowchartService){}

	ngOnInit(){
		this.subscriptions.push(this._fs.node$.subscribe( (node) => { this.active_node = node; this.render_node(node) } ));
	}

	ngOnDestroy(){
		this.subscriptions.map(function(s){
	  	s.unsubscribe();
		})
	}


	render_node(node: IGraphNode) :void{

		try{
			let self = this;
			this._outResults = node.outputs.map(function(output){
				let name = output.name;
				let isJSON = self.isJSON(output);
				let text = self.getText(output);
				let value = output.value;
				let outObj = {name: name, isJSON: isJSON, text: text, value: value}
				return outObj;
			})
		}
		catch(ex){

		}
	}

	private getText(output: OutputPort): string{
		try{
			let val = output.value;

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
						result += output.name;
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

	isJSON(output: OutputPort): boolean{
		let val = output.value;
		return (typeof(val) == "object" && val.toString() == "[object Object]");
	}

}
