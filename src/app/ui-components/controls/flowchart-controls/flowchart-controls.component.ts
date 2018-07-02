import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { FlowchartUtils } from '../../../base-classes/flowchart/FlowchartUtils';
import { MobiusService } from '../../../global-services/mobius.service';
import { FlowchartService } from '../../../global-services/flowchart.service';
import { ModuleService } from '../../../global-services/module.service';
import { ConsoleService } from '../../../global-services/console.service';
import { FileService } from '../../../global-services/file.service';

import { ICodeGenerator, CodeFactory } from '../../../base-classes/code/CodeModule';
import { IFlowchart, FlowchartReader } from '../../../base-classes/flowchart/FlowchartModule';


import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PublishSettingsComponent } from '../publish-settings/publish-settings.component';

import * as CircularJSON from 'circular-json';

@Component({
  selector: 'app-flowchart-controls',
  templateUrl: './flowchart-controls.component.html',
  styleUrls: ['./flowchart-controls.component.scss']
})
export class FlowchartControlsComponent implements OnInit{

  private subscriptions = [];

  // doesn't really need to extend viewer 
  constructor(private _mb: MobiusService, 
              private _ms: ModuleService,
              private $log: ConsoleService,
              private _fs: FlowchartService, 
              private dialog: MatDialogRef<PublishSettingsComponent>) { }

  ngOnInit(){ }

  @ViewChild('fileInput') fileInput: ElementRef;
  open_picker(): void{
    let el: HTMLElement = this.fileInput.nativeElement as HTMLElement;
    el.click();
  }

  new_file(): void{ 
    this._fs.new_flowchart(this._mb.user);
    this._mb.code_generator = CodeFactory.getCodeGenerator("js");
    this._ms.load_modules();
    this.$log.log("Created new file.");
  }

  new_flowchart(): void{
    this._fs.new_flowchart(this._mb.user);
  }

  load_file(url?: string): void{
    let file = this.fileInput.nativeElement.files[0];
    if (file) {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        let mb = this._mb;
        reader.onload = function (evt) {
            let fileString: string = evt.target["result"];
            mb.load_file(fileString);
        }
        reader.onerror = function (evt) {
            console.log("Error reading file");
        }
    }
  }

  save_file(): void{ 
    let flowchart = this._fs.flowchart;

    let file = {};
    let fileString: string;

    file["language"] = "js";
    file["modules"] = [];

    let newFlowchart: IFlowchart = FlowchartReader.readFlowchartFromData(flowchart);
    file["flowchart"] = newFlowchart;
    fileString = CircularJSON.stringify(file);

    let fname: string = 'Scene' + (new Date()).getTime() + ".mob";
    if(flowchart.name){
      fname = flowchart.name;
      if(!fname.endsWith(".mob")){
        fname = fname + ".mob";
      }
    }
    
    FileService.downloadAsJSON(fileString, fname);
  }

  publish_settings(): void{
    let dialogRef = this.dialog.open(PublishSettingsComponent, {
            height: '500px',
            width: '450px',          
            data: {}
        });

    dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
    });

  }
}
