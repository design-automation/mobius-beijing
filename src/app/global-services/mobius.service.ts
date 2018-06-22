import { Injectable } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { IFlowchart, FlowchartReader } from '../base-classes/flowchart/FlowchartModule';

import { FileService } from './file.service';
import { FileLoadDialogComponent } from '../ui-components/dialogs/file-load-dialog.component';
import * as CircularJSON from 'circular-json';
import { MOBIUS } from './mobius.constants';


@Injectable()
export class MobiusService {

	private _processing: boolean = false;
	stateChanged: EventEmitter<boolean> = new EventEmitter();

	constructor(private http: HttpClient) { }

  get processing(){
    return this._processing;
  }

  set processing(value){
    this._processing = value;
    this.stateChanged.emit(this._processing);
  }

  stateChangedEmitter() {
    return this.stateChanged;
  }


  //
  newFile(): IFlowchart{
    this._flowchart = new Flowchart(this._user);
    this._selectedNode = undefined;
    this._selectedPort = undefined;
    this._selectedProcedure = undefined;

    this.push_flowchart(this._flowchart);
    this.push_node(undefined);

    this.loadModules( ModuleService.modules );

    // print message to console
    this.consoleService.addMessage("New file created.");

    return this._flowchart;
  }


  loadFile(fileString: string): void{

      // check if filestring is url
      if(fileString && fileString.startsWith("https://")){
        try{
          //this.consoleService.addMessage("Loading file from: " + fileString);
          this.http.get(fileString).subscribe(res => { 
            this.loadFile(JSON.stringify(res));
          });
        }
        catch(ex){
          //this.consoleService.addMessage("Error loading file from: " + fileString, EConsoleMessageType.Error);
        }
      }
      else{
        let _this = this;
        let jsonData: {language: string, flowchart: JSON, modules: JSON};

        try{

          this.newFile();

          let data = CircularJSON.parse(fileString);

          // load the required modules
           /* _this.modules. s(data["module"]); */

          // load the required code generator
          if (_this.code_generator.getLanguage() != data["language"] && data["language"] !== undefined){
            _this.code_generator = CodeFactory.getCodeGenerator(data["language"])
          }

          // read the flowchart
          _this._flowchart = FlowchartReader.readFlowchartFromData(data["flowchart"]);

          // select node according to publish settings
          let nds = this._flowchart.getNodes();
          for(let i=0; i < nds.length; i++){
            if(nds[i].getId() == this._flowchart.selectedNode){
              this.selectNode(i, 0);
              break;
            }
          }

          if(this.getSelectedNode() == undefined){
            this.selectNode(this.getNodes().length - 1, 0);
          }

          _this.update();


          //this.consoleService.addMessage("File loaded successfully");
          // this.layoutService.showConsole();
          //this.switchViewer("console-viewer");
          
        }
        catch(err){
          this.newFile();
          this.consoleService.addMessage("Error loading file: " + err, EConsoleMessageType.Error);
          // this.layoutService.showConsole();
          this.switchViewer("console-viewer");
        }
      }


  }


  openFileLoadDialog(): void{

    let myStorage = window.localStorage;
    let property = MOBIUS.PROPERTY.FLOWCHART;
    let storageString = myStorage.getItem(property);

    let message: string;
 
    if(storageString){
      let fc = CircularJSON.parse(storageString)["flowchart"]["_lastSaved"];

      message = "Hey there! We found a file saved on " + (new Date(fc)).toDateString() + " at " 
              + (new Date(fc)).toTimeString() + ". Would you like to reload?"
    }

    if(message){
      this.loadFile(storageString);
      /*if (confirm(message)) {
         this.loadFile(storageString);
      } else {
          this.newFile();
      }*/
    }
    else{
      this.consoleService.addMessage("Error loading file from memory", EConsoleMessageType.Error);
     // // this.layoutService.showConsole();
     this.switchViewer("console-viewer");
      this.newFile();
    }
  }

  //
  //  saves a flowchart
  //
  saveFile(flowchart: IFlowchart): void{
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



}
