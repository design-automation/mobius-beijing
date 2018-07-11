import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { FlowchartUtils } from '../../../base-classes/flowchart/FlowchartUtils';
import { MobiusService } from '../../../global-services/mobius.service';
import { FlowchartService } from '../../../global-services/flowchart.service';
import { ModuleService } from '../../../global-services/module.service';
import { ConsoleService } from '../../../global-services/console.service';

import { ICodeGenerator, CodeFactory } from '../../../base-classes/code/CodeModule';
import { IFlowchart, FlowchartReader, FlowchartWriter } from '../../../base-classes/flowchart/FlowchartModule';

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PublishSettingsComponent } from '../publish-settings/publish-settings.component';


@Component({
  selector: 'app-flowchart-controls',
  templateUrl: './flowchart-controls.component.html',
  styleUrls: ['./flowchart-controls.component.scss']
})
export class FlowchartControlsComponent implements OnInit{

  //
  //  FileInput View Child to open file for loading
  //
  @ViewChild('fileInput') fileInput: ElementRef;
  open_picker(): void{
    let el: HTMLElement = this.fileInput.nativeElement as HTMLElement;
    el.click();
  }

  // doesn't really need to extend viewer 
  constructor(private _mb: MobiusService, 
              private _ms: ModuleService,
              private $log: ConsoleService,
              private _fs: FlowchartService, 
              private dialog: MatDialog) { }

  //
  //  Creates new file on loading
  //
  ngOnInit(){ this.new_flowchart(); }  

  //
  //  Loads a new file by 
  //  - Creating a new flowchart
  //  - Setting the Code Generator to JS
  //  - Loading the modules
  //
  new_flowchart(): void{
    this._fs.new_flowchart();
  }

  //
  //  Adds a new node to the flowchart 
  //
  add_node(): void{
    FlowchartUtils.add_node(this._fs.flowchart)
  }


  //
  //
  //  Loads a Mobius file from disk
  //  String to Flowchart Conversion: Handled by FlowchartService
  //
  load_file(url?: string): void{
    let file = this.fileInput.nativeElement.files[0];
    if (file) {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        let fs = this._fs;
        reader.onload = function (evt) {
            let fileString: string = evt.target["result"];
            fs.load_flowchart_from_string(fileString);
        }
        reader.onerror = function (evt) {
            console.log("Error reading file");
        }
    }
  }

  //
  //  Opens the publish settings dialog box 
  //
  publish_settings(): void{
    let dialogRef = this.dialog.open(PublishSettingsComponent, {
            height: '500px',
            width: '450px',          
            data: this._fs.flowchart
        });

    dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
    });

  }

  //
  //  Uses FlowchartWriter to save the flowchart as a JSON file
  //
  save_file(): void{ 
    FlowchartWriter.save_flowchart_as_json(this._fs.flowchart);
  }


}
