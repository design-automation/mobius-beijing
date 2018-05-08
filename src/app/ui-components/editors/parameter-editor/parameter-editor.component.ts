import { Component, Injector, Inject } from '@angular/core';

import { IGraphNode } from '../../../base-classes/node/NodeModule';
import { InputPort, OutputPort, InputPortTypes, OutputPortTypes } from '../../../base-classes/port/PortModule';

import { Viewer } from '../../../base-classes/viz/Viewer';
import { FlowchartService } from '../../../global-services/flowchart.service';

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {ParameterSettingsDialogComponent} from './parameter-settings-dialog.component';
import {IProcedure, ProcedureFactory, ProcedureTypes} from '../../../base-classes/procedure/ProcedureModule';

@Component({
  selector: 'app-parameter-editor',
  templateUrl: './parameter-editor.component.html',
  styleUrls: ['./parameter-editor.component.scss']
})
export class ParameterEditorComponent extends Viewer{

    isVisible: boolean = false;

    _node: IGraphNode;
    _inputs: InputPort[];
    _outputs: OutputPort[];

    // shift to iport
    inputPortOpts: InputPortTypes[] = [
        InputPortTypes.Input,
        InputPortTypes.Slider, 
        // InputPortTypes.ColorPicker, 
        InputPortTypes.FilePicker,
        InputPortTypes.URL,
        InputPortTypes.Checkbox
        // InputPortTypes.Dropdown
    ]; 

    outputPortOpts: OutputPortTypes[] = [
        OutputPortTypes.Three, 
        OutputPortTypes.Text, 
        OutputPortTypes.Code, 
        OutputPortTypes.Console, 
        OutputPortTypes.Cesium
    ]; 

	  constructor(injector: Injector, public dialog: MatDialog){  
      super(injector, "parameter-editor"); 
    }

    reset(){ 
      this._node = undefined;
      this._inputs = undefined;
      this._outputs = undefined;
      this.isVisible = false;
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

    deletePort(event, type: string, portIndex: number): void{
      event.stopPropagation();
      this.flowchartService.deletePort(type, portIndex);
    } 

    updatePortName($event, port: InputPort|OutputPort): void{
      let name: string =  $event.srcElement.innerText; 

      // check for validity
      name = name.replace(/[^\w]/gi, '');

      if(name.trim().length > 0){
        // put a timeout on this update or something similar to solve jumpiness
        port.setName(name);
        this.flowchartService.update();
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
    
    getInputTypeName(type: InputPortTypes): string{
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

    getOutputTypeName(type: OutputPortTypes): string{
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

  	//
  	//	this update runs when there is a message from other viewers that something changed; 
  	//  beware of updating flowchart here - it will go into an unending loop :/
  	//
  	update(): void{
  		this._node = this.flowchartService.getSelectedNode();
      if( this._node !== undefined ){
         this.isVisible = true;
  		   this._inputs = this._node.getInputs();
         this._outputs = this._node.getOutputs();
         this.isVisible = true;
      }
      else{
        this.isVisible = false;
      }
  	}


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

    addFunctionToProcedure(inp: InputPort): void{

      // get functional graph node
      let value = inp.getValue().port;

      if(value){
          let fn_node: IGraphNode = this.flowchartService.getNodes()[value[0]];
          let prod: IProcedure = ProcedureFactory.getProcedure(ProcedureTypes.Function, {node: fn_node, port: inp});
          this.flowchartService.addProcedure(prod);

      }
    }

}


