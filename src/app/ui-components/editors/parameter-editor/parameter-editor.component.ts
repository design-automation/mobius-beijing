import { Component, Injector, Inject } from '@angular/core';

import { IGraphNode } from '../../../base-classes/node/NodeModule';
import { NodeUtils } from '../../../base-classes/node/NodeUtils';

import { InputPort, OutputPort, InputPortTypes, OutputPortTypes } from '../../../base-classes/port/PortModule';

import { FlowchartService } from '../../../global-services/flowchart.service';

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {ParameterSettingsDialogComponent} from './parameter-settings-dialog.component';
import {IProcedure, ProcedureFactory, ProcedureTypes} from '../../../base-classes/procedure/ProcedureModule';

@Component({
  selector: 'app-parameter-editor',
  templateUrl: './parameter-editor.component.html',
  styleUrls: ['./parameter-editor.component.scss']
})
export class ParameterEditorComponent{

    readonly inputPortOpts: InputPortTypes[] = [
      InputPortTypes.Input,
      InputPortTypes.Slider, 
      InputPortTypes.URL,
      InputPortTypes.Checkbox,
    ]; 

    readonly outputPortOpts: OutputPortTypes[] = [
      OutputPortTypes.Text, 
      OutputPortTypes.Code, 
      OutputPortTypes.Console, 
      OutputPortTypes.Cesium
      // OutputPortTypes.Three, 
    ]; 

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

    /// other functions
    delete_port(event, port: InputPort|OutputPort): void{
      event.stopPropagation();
      NodeUtils.delete_port(this.active_node, port);
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
          let prod: IProcedure = ProcedureFactory.getProcedure(ProcedureTypes.Function, {node: this.active_node, port: inp});
          NodeUtils.add_procedure(this.active_node, prod);
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


