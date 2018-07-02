import { Component, Injector, Inject } from '@angular/core';
import { FlowchartService } from '../../../global-services/flowchart.service';
import { MobiusService } from '../../../global-services/mobius.service';

import { IGraphNode } from '../../../base-classes/node/NodeModule';
import { InputPort, OutputPort, InputPortTypes, OutputPortTypes } from '../../../base-classes/port/PortModule';
import { ParameterSettingsDialogComponent } from '../../editors/parameter-editor/parameter-settings-dialog.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-publish-settings',
  templateUrl: './publish-settings.component.html',
  styleUrls: ['./publish-settings.component.scss']
})
export class PublishSettingsComponent{

  _flowchart;
  _globals;
  _nodes;
  private subscriptions = [];
  private active_node: IGraphNode;


  inputPortOpts: InputPortTypes[] = [
        InputPortTypes.Input,
        InputPortTypes.Slider, 
        InputPortTypes.FilePicker,
        InputPortTypes.URL,
        InputPortTypes.Checkbox
    ]; 

  constructor(private _fs: FlowchartService,
              private _mb: MobiusService,  
              public dialogRef: MatDialogRef<PublishSettingsComponent>, 
              @Inject(MAT_DIALOG_DATA) public data: any, 
              public dialog: MatDialog) { }


  ngOnInit(){
    this.subscriptions.push(this._fs.flowchart$.subscribe( (fw) => {
        this._flowchart = fw;
        this._globals = this._flowchart.globals;
        this._nodes = this._flowchart.node;
    }));
  }

  ngOnDestroy(){
    this.subscriptions.map(function(s){
      s.unsubscribe();
    })
  }

  addGlobal(): void{
  	let inputPort = new InputPort("global"  + this._globals.length);
    this._globals.push(inputPort);
  	this._flowchart.globals = this._globals;
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
        return "Not Identifiable"
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
    this._globals.splice(index, 1);
    this._flowchart.globals = this._globals;
  }

  updateGlobal($event, port: InputPort|OutputPort): void{
      let name: string =  $event.srcElement.innerText; 

      // check for validity
      name = name.replace(/[^\w]/gi, '');

      if(name.trim().length > 0){
        // put a timeout on this update or something similar to solve jumpiness
        port.name = name;
      }
  }

  updateType(type: InputPortTypes|OutputPortTypes, port: InputPort|OutputPort): void{
        
        port.type = (type);

        //defaults
        if(type == InputPortTypes.Slider){
          port.setOpts({min: 0, max: 100, step: 1});
          port.setDefaultValue(50);
        }

  }

  save(): void{
    this._mb.save_file(this._flowchart);
  }

}
