import { Component, Injector, ElementRef, ViewChild, Input } from '@angular/core';
import { HttpClient  } from '@angular/common/http';

import { IGraphNode } from '../../../base-classes/node/NodeModule';
import { InputPort, InputPortTypes } from '../../../base-classes/port/PortModule';

import { MobiusService } from '../../../global-services/mobius.service';
import { FlowchartService } from '../../../global-services/flowchart.service';
import { ExecuteService } from '../../../global-services/execute.service';

@Component({
  selector: 'app-parameter-viewer',
  templateUrl: './parameter-viewer.component.html',
  styleUrls: ['./parameter-viewer.component.scss']
})
export class ParameterViewerComponent{
    
    @Input() globals: boolean;
    @ViewChild('cesium_param_container') el:ElementRef;

    private subscriptions = [];
    private active_node: IGraphNode;
    _editable;
    InputPortTypes = InputPortTypes;

    constructor(private _fs: FlowchartService, 
                private _ms: MobiusService, 
                private _ex: ExecuteService,
                private http: HttpClient){}

    ngOnInit(){
      this.subscriptions.push(this._fs.node$.subscribe( (node) => {
        this.active_node = node;
      }));
    }

    ngOnDestroy(){
      this.subscriptions.map(function(s){
        s.unsubscribe();
      })
    }


    // todo: refactor and remove
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
        let fs = this._fs;
        let ms = this._ms;
        ms.processing = true;
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
                input.setComputedValue(contents);
                ms.processing = false;
            }
        })(reader);

        //fs.freeze = true;
        reader.readAsText(file);
      }
      else{
        // reset
        //$event.target.files = [];
        $event.target.value = '';
      }
    
    }


    executeFlowchart($event): void{

        $event.stopPropagation();

        this._ms.processing = true;

        let ex = this._ex;
        setTimeout(function(){
          ex.execute();
        }, 400)

    }

}
