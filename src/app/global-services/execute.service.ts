import { Injectable, Input, Output, EventEmitter } from '@angular/core';

import {ConsoleService, EConsoleMessageType} from "./console.service";
import {MobiusService} from "./mobius.service";
import {ModuleService} from "./module.service";
import {FlowchartService} from "./flowchart.service";

import {IFlowchart, FlowchartUtils} from '../base-classes/flowchart/FlowchartModule';
import {ICodeGenerator} from "../base-classes/code/CodeModule";


@Injectable()
export class ExecuteService {

    constructor(private _fs: FlowchartService, 
                private _cs: ConsoleService, 
                private _mb: MobiusService,
                private _ms: ModuleService){

    }

    private static consoleMessages = [];


    //
    //    Global print function supplied to the execution 
    //    to print values to console viewer
    //
    private static printFunction = function(varName: string, value: any){
        let consoleHTML: string = "";
        
        let variable_name: string = varName;
        let variable_value: string = value; 

        if(Array.isArray(value)){
           variable_value = "<em>Array(" + value.length + " items)</em>"; //"[" + variable_value + "]";
        }
        else if(typeof value == 'string'){
           variable_value = "\"" + value + "\"";
        }
        else if(typeof(value) == "object"){
          let strRep: string = value.toString();
          if(strRep !== "[object Object]"){
            variable_value = strRep.replace(/\n/g, '<br>');
          }
          else{
            let keys = Object.keys(value);
            variable_value = "<em>JSON Object with properties: (" + keys.toString() + ")</em>";;
          }
        }

        consoleHTML += "<div class='console-line'>" +  "<span class='var-name'>Value of "  + variable_name + ": </span>" + 
               "<span class='var-value'>"  + variable_value +  "</div>";

        ExecuteService.consoleMessages.push(consoleHTML);
    }
  

    public execute(): any{

        let flowchart: IFlowchart = this._fs.flowchart;
        let code_generator: ICodeGenerator = this._mb.code_generator;


        let consoleMessages: string[] = [ "<div class='console-heading'>Printed Values</div>" ];

        // get flowchart from _fs
        // get code_generator from _mb

        try{
            
            FlowchartUtils.execute(flowchart, code_generator, ModuleService.modules, ExecuteService.printFunction);
            
            if(consoleMessages.length > 1){
              this._cs.addMessage( consoleMessages.join(""), EConsoleMessageType.Print );
            }

            this._cs.addMessage("Flowchart was successfully executed.");
            
            ///console.log(this._fs);
            ///this.push_fs(this._fs);
        }
        catch(ex){

            this._cs.log(ex);
          
            if(consoleMessages.length > 1){
              this._cs.addMessage( consoleMessages.join(""), EConsoleMessageType.Print );
            }
            
            consoleMessages = null;

            let errorMessage: string = "<div class='error'>" + ex + "</div>";
            this._cs.addMessage( errorMessage, EConsoleMessageType.Error );

            // this.layoutService.showConsole();
            // this.switchViewer("console-viewer");
        }

        this._mb.processing = false;

        // this.update();
    }

}