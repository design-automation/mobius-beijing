import { Component, Injector, Inject } from '@angular/core';

import { IGraphNode } from '../../../base-classes/node/NodeModule';
import { InputPort, OutputPort, InputPortTypes, OutputPortTypes } from '../../../base-classes/port/PortModule';
import { ParameterSettingsDialogComponent } from '../../editors/parameter-editor/parameter-settings-dialog.component';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { IFlowchart, FlowchartWriter } from '../../../base-classes/flowchart/FlowchartModule';

@Component({
  selector: 'app-publish-settings',
  templateUrl: './publish-settings.component.html',
  styleUrls: ['./publish-settings.component.scss']
})
export class PublishSettingsComponent{

  fw;

  inputPortOpts: InputPortTypes[] = [
        InputPortTypes.Input,
        InputPortTypes.Slider, 
        InputPortTypes.FilePicker,
        InputPortTypes.URL,
        InputPortTypes.Checkbox
    ]; 

  constructor(public dialogRef: MatDialogRef<PublishSettingsComponent>, 
              @Inject(MAT_DIALOG_DATA) public flowchart: IFlowchart, 
              public dialog: MatDialog) { this.fw = flowchart }

  addGlobal(): void{
    //TODO: 
  	let inputPort = new InputPort("global"  + this.fw._globals.length);
    this.fw.globals.push(inputPort);
  }

  save(): void{
    FlowchartWriter.save_flowchart_as_json(this.fw);
    this.close();
  }

  close(): void{
    this.dialogRef.close();
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
        return "Hello";
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
        return "Not Identifiable";
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

  deleteGlobal(index: number): void{
    // TODO:
    /*this._globals.splice(index, 1);
    this.fw.globals = this._globals;*/
  }

}
