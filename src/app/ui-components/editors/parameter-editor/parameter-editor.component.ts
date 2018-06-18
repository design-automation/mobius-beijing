import { Component, Injector, Inject } from '@angular/core';

import { IGraphNode } from '../../../base-classes/node/NodeModule';
import { InputPort, OutputPort, InputPortTypes, OutputPortTypes } from '../../../base-classes/port/PortModule';

import { Viewer } from '../../../base-classes/viz/Viewer';
import { FlowchartService } from '../../../global-services/flowchart.service';

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {ParameterSettingsDialogComponent} from './parameter-settings-dialog.component';
import {IProcedure, ProcedureFactory, ProcedureTypes} from '../../../base-classes/procedure/ProcedureModule';


abstract class PortUtils{

  public static inputPortOpts: InputPortTypes[] = [
        InputPortTypes.Input,
        InputPortTypes.Slider, 
        // InputPortTypes.ColorPicker, 
        InputPortTypes.FilePicker,
        InputPortTypes.URL,
        InputPortTypes.Checkbox
        // InputPortTypes.Dropdown
  ]; 

  public static outputPortOpts: OutputPortTypes[] = [
     // OutputPortTypes.Three, 
      OutputPortTypes.Text, 
      OutputPortTypes.Code, 
      OutputPortTypes.Console, 
      OutputPortTypes.Cesium
  ]; 


  public static getInputTypeName(type: InputPortTypes): string{
      if(type == InputPortTypes.ColorPicker){
        return "Color";
      }
      else if(type == InputPortTypes.Input){
        return "Simple Input";
      }
      else if(type == InputPortTypes.Dropdown){
        return "Dropdown";
      }
      else if(type == InputPortTypes.FilePicker){
        return "File";
      }
      else if(type == InputPortTypes.Slider){
        return "Slider";
      }
      else if(type == InputPortTypes.URL){
        return "WebURL";
      }
      else if(type == InputPortTypes.Checkbox){
        return "Checkbox";
      }
      else{
        return "Not Identifiable"
      }
    }

  public static getOutputTypeName(type: OutputPortTypes): string{
      if(type == OutputPortTypes.Three){
        return "Geometry";
      }
      else if(type == OutputPortTypes.Text){
        return "Text Viewer";
      }
      else if(type == OutputPortTypes.Code){
        return "Code Viewer";
      }
      else if(type == OutputPortTypes.Console){
        return "Console";
      }
      else if(type == OutputPortTypes.Cesium){
        return "Cesium";
      }
      else{
        return "Not Identifiable"
      }
    }

}


@Component({
  selector: 'app-parameter-editor',
  templateUrl: './parameter-editor.component.html',
  styleUrls: ['./parameter-editor.component.scss']
})
export class ParameterEditorComponent{

    isVisible: boolean = false;

    _node: IGraphNode;

    private subscriptions = [];
    private active_node: IGraphNode;

    constructor(private _fs: FlowchartService, public dialog: MatDialog){}

    ngOnInit(){
      this.subscriptions.push(this._fs.node$.subscribe( (node) => this.active_node = node ));
    }

    ngOnDestroy(){
      this.subscriptions.map(function(s){
        s.unsubscribe();
      })
    }

    push_node(){
      this._fs.push_node(this.active_node)
    }

    /// other functions

    deletePort(event, type: string, portIndex: number): void{
      event.stopPropagation();
      this._fs.deletePort(type, portIndex);
    } 

    updatePortName($event, port: InputPort|OutputPort): void{
      let name: string =  $event.srcElement.innerText; 

      // check for validity
      name = name.replace(/[^\w]/gi, '');

      if(name.trim().length > 0){
        // put a timeout on this update or something similar to solve jumpiness
        port.setName(name);
        this._fs.update();
      }
    }

    updateType(type: InputPortTypes|OutputPortTypes, port: InputPort|OutputPort): void{
        
        port.setType(type);

        //defaults
        if(type == InputPortTypes.Slider){
          port.setOpts({min: 0, max: 100, step: 1});
          port.setDefaultValue(50);
        }

    }
    

    /// setting dialog
    openSettingsDialog(input: InputPort): void{
        let dialogRef = this.dialog.open(ParameterSettingsDialogComponent, {
            height: '400px',
            width: '600px',          
            data: { 
                    inputPortTypes: this.inputPortOpts,
                    input: input
                  }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
        });
    }


    // higher order functions

    addFunctionToProcedure(inp: InputPort): void{

      // get functional graph node
      let value = inp.getValue().port;

      if(value){
          let fn_node: IGraphNode = this._fs.getNodes()[value[0]];
          let prod: IProcedure = ProcedureFactory.getProcedure(ProcedureTypes.Function, {node: fn_node, port: inp});
          this._fs.addProcedure(prod);

      }
    }

    portHasFunction(port: InputPort): boolean{
      let value = port.getValue();
      if(value && value.port !== undefined && value.port.length == 2){
        return true;
      }
      else{
        return false;
      }
    }


}


