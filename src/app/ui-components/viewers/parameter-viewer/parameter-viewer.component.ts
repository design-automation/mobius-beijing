import { Component, Injector, ElementRef, ViewChild, Input } from '@angular/core';
import { HttpClient  } from '@angular/common/http';

import { Viewer } from '../../../base-classes/viz/Viewer';
import { IGraphNode } from '../../../base-classes/node/NodeModule';
import { InputPort, InputPortTypes } from '../../../base-classes/port/PortModule';

import 'rxjs/add/operator/map'

@Component({
  selector: 'app-parameter-viewer',
  templateUrl: './parameter-viewer.component.html',
  styleUrls: ['./parameter-viewer.component.scss']
})
export class ParameterViewerComponent extends Viewer {
    
    @Input() globals:boolean;


	  _node: IGraphNode;
	  _inputs: InputPort[]|any;
    isVisible: boolean = false;

    InputPortTypes = InputPortTypes;

    @ViewChild('cesium_param_container') el:ElementRef;

  	constructor(injector: Injector, private http: HttpClient){  
        super(injector, "parameter-viewer"); 
     }

  	ngOnInit() {
      this.update();
  	}

    reset(): void{
      this._node = undefined; 
      this._inputs = [];

      if(this.globals){
        this._inputs = this.flowchartService.getFlowchart().globals;
      }
    }

  	// addInput(): void{
   //    	this._node.addInput();
  	// 	  this.flowchartService.update();
	  // }

    // updateInputName($event, input): void{
    //   let name: string = $event.srcElement.innerText;
    //   input.setName(name);
    //   // put a timeout on this update or something similar to solve jumpiness
    //   this.flowchartService.update();
    // }

    // updateInputType( type:string ){
    //   alert(type);
    // }

    updateComputedValue($event, input, value?: any): void{

      // for input
      if($event.srcElement){
        value = $event.srcElement.value;
        value = value.trim();
        if(value.length == 0){
          input.setComputedValue(undefined);
          return;
        }
      }

      input.setComputedValue(value);
      this.flowchartService.update();
    }

    getValue(port :InputPort): any{

        if(port.getType() == InputPortTypes.Checkbox){
          return port.getValue() || false;
        }
        else{
          return (port.getValue() || " ");
        }

    }
  	//
  	//	this update runs when there is a message from other viewers that something changed; 
  	//  beware of updating flowchart here - it will go into an unending loop :/
  	//
  	update(): void{

      if(this.globals){
        this._inputs = this.flowchartService.getFlowchart().globals;
        return;
      }

  		this._node = this.flowchartService.getSelectedNode();
      if(this._node != undefined){
         this._inputs = this._node.getInputs().filter(function(inp: InputPort){
           return !inp.isConnected();
         });
         this.isVisible = true;
      }
      else{
        this.isVisible = false;
      }
  	}
    

    //
    //
    //
    executeFlowchart($event): void{
        $event.stopPropagation();
        this.flowchartService.execute();
    }

    handleFileInput(fileList, input){
      let file: File = fileList[0];
      var reader = new FileReader();
      let fs = this.flowchartService;
      reader.onload = (function(reader)
      {
          return function()
          {
              var contents = reader.result;
              /*var lines = contents.split('\n');
              contents = lines.join("\\\n");*/
              input.setComputedValue(contents);
              fs.update();
          }
      })(reader);

      reader.readAsText(file);
    
    }


    //
    // Web URL
    // 
    getDataFromURL($event, input){

      let urlString: any = input.getOpts().url;

      this.http.get(urlString)
        .subscribe(data => {
             console.log(data);
             input.setDefaultValue(JSON.stringify(data))
        }
      );

    }

}
