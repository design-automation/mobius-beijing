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
    
    @Input() globals: boolean;
    _editable;

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
      this._editable = this.flowchartService.getFlowchart().editable;;

      if(this.globals){
        this._inputs = this.flowchartService.getFlowchart().globals;
      }

    }

    updateURL($event, input){
      let value;
      if($event.srcElement){
        value = $event.srcElement.value;
        value = value.trim();
        if(value.length != 0){
          input.setOpts({url: value});
        }
      }
    }

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

      this._editable = this.flowchartService.getFlowchart().editable;

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

    //
    //
    //
    processing = {value: false};
    handleFileInput($event, input){

      let fileList = $event.target.files;
      let file: File = fileList[0];
      let size = Math.round(file.size/10**6);

      let run_file = true;
      if(size > 300){
        run_file = confirm(`The file you are trying to load is ${size}MB and might cause unexpected crashes. Do you want to continue?`);
      }

      if(run_file){
        var reader = new FileReader();
        let fs = this.flowchartService;
        let ps = this.processing;
        reader.onload = (function(reader)
        {
            return function()
            {
                let contents = reader.result;

                try{
                  contents = JSON.parse(contents);//Function('use strict; return ' + value);
                }
                catch(ex){
                  console.error("Not JSON");
                  // do nothing
                }

                //fs.freeze = false;
                ps.value = false;
                input.setComputedValue(contents);
                fs.update();
            }
        })(reader);

        //fs.freeze = true;
        ps.value = true;
        reader.readAsText(file);
      }
      else{
        // reset
        //$event.target.files = [];
        $event.target.value = '';
      }
    
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
