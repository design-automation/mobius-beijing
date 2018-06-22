import { Injectable, Input, Output, EventEmitter } from '@angular/core';

@Injectable()
export abstract class ExecuteService {

    private static consoleMessages = [];

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
  
    execute(): any{

        let consoleMessages: string[] = [ "<div class='console-heading'>Printed Values</div>" ];

        //
        //  generates an HTML version of the values
        //


        try{
            this._flowchart.execute(this.code_generator, this._moduleMap, printFunction);
            
            if(consoleMessages.length > 1){
              this.consoleService.addMessage( consoleMessages.join(""), EConsoleMessageType.Print );
            }
            consoleMessages = null;
            printFunction = null;
            
            this.consoleService.addMessage("Flowchart was successfully executed.");
            
            ///console.log(this._flowchart);
            ///this.push_flowchart(this._flowchart);
        }
        catch(ex){
          
            if(consoleMessages.length > 1){
              this.consoleService.addMessage( consoleMessages.join(""), EConsoleMessageType.Print );
            }
            consoleMessages = null;
            printFunction = null;

            let errorMessage: string = "<div class='error'>" + ex + "</div>";
            this.consoleService.addMessage( errorMessage, EConsoleMessageType.Error );

            // this.layoutService.showConsole();
            this.switchViewer("console-viewer");
        }

        this.mobiusService.processing = false;

        this.update();
    }

}