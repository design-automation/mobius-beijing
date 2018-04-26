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

	constructor(injector: Injector){ 
		super(injector, "Text Viewer", "Displayed geometry with each node.");  
	}

	ngOnInit() {
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

	getType(output: IPort): string{

		let val = output.getValue();
		if(val){

			let result = val;

			try{
				if(typeof(val) == "object"){

					let strRep: string = val.toString();
					if(strRep !== "[object Object]"){
						return strRep.replace(/\n/g, '<br>');
					}
					else if(val["type"] == "FeatureCollection"){

						let str = "<b>GeoJSON file</b><br>";
						str += "Number of features: " + val["features"].length + "<br>";
						str += "First few features:<br>";

						let sliced = val["features"].slice(0, Math.min(3, val["features"].length));
						let features: string = "";
						sliced = sliced.map(function(feature){
							let f: string = "";
							f += "<small><b>Geometry Type:" + feature["geometry"]["type"] + "</b><br>";
							f += "<code>" + js_beautify.js_beautify(JSON.stringify(feature)) +  "</code></small>";
							return f;
						})

						str += sliced.join("<br><br>");

						return str;
					}
					else{
						let str = CircularJSON.stringify(output.getValue());
						if(str.length > 1000){
							return str.substr(0, 1000) + "... <br><br>File too long!";
						}
					}

				}

				let result =  CircularJSON.stringify(output.getValue());
				if(result.length > 1000){
					result = result.substr(0, 1000) + "... <br><br>File too long!";
				}
				
				return result;
			}
			catch(ex){
				console.log("Error in Text Viewer:", ex);
				return "error-generating-value";
			}
		}
		else{
			return "no-value-available";
		}	

	}

	update() :void{
		try{
			this._selectedNode = this.flowchartService.getSelectedNode();	
			this._selectedPort = this.flowchartService.getSelectedPort();
		}
		catch(ex){

		}
	}
}
