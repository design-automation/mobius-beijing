import { Injectable } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { IFlowchart, FlowchartReader } from '../base-classes/flowchart/FlowchartModule';
import { ICodeGenerator, CodeFactory } from '../base-classes/code/CodeModule';

import { FileService } from './file.service';
import { FlowchartService } from './flowchart.service';
import { ModuleService } from './module.service';
import { ConsoleService } from './console.service';

import { FileLoadDialogComponent } from '../ui-components/dialogs/file-load-dialog.component';
import * as CircularJSON from 'circular-json';
import { MOBIUS } from './mobius.constants';


@Injectable()
export class MobiusService {

  private _user: string = "local_user";
  private _code_gen: ICodeGenerator;
  private _processing: boolean = false;

	stateChanged: EventEmitter<boolean> = new EventEmitter();

	constructor(private http: HttpClient,
              private _fs: FlowchartService, 
              private _ms: ModuleService,
              private $log: ConsoleService) { }

  get processing(){
    return this._processing;
  }

  set processing(value){
    this._processing = value;
    this.stateChanged.emit(this._processing);
  }

  get code_generator(){
      return this._code_gen;
  }

  set code_generator(cg: ICodeGenerator){
      this._code_gen = cg;
  }

  get user(): string{
    return this._user;
  }

  set user(username: string){
    this._user = username;
  }

  stateChangedEmitter() {
    return this.stateChanged;
  }

  load_file(fileString: string): void{

      // check if filestring is url
      if(fileString && fileString.startsWith("https://")){

        try{

            //this.consoleService.addMessage("Loading file from: " + fileString);
            this.http.get(fileString).subscribe(res => { 
              this.load_file(JSON.stringify(res));
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

          this.new_file();

          let data = CircularJSON.parse(fileString);

          // load the required modules
           /* _this.modules. s(data["module"]); */

          // load the required code generator
          if (_this.code_generator.getLanguage() != data["language"] && data["language"] !== undefined){
            _this.code_generator = CodeFactory.getCodeGenerator(data["language"])
          }

          // read the flowchart
          let flowchart: IFlowchart = FlowchartReader.readFlowchartFromData(data["flowchart"]);

          // select node according to publish settings
          let nds = flowchart.nodes;
          for(let i=0; i < nds.length; i++){
            if(nds[i].getId() == flowchart.selectedNode){
              //this.selectNode(i, 0);
              break;
            }
          }

          // if(this.getSelectedNode() == undefined){
          //   this.selectNode(this.getNodes().length - 1, 0);
          // }

          // _this.update();


          // this.consoleService.addMessage("File loaded successfully");
          // this.layoutService.showConsole();
          // this.switchViewer("console-viewer");
          
        }
        catch(err){
          //this.newFile();
          //this.consoleService.addMessage("Error loading file: " + err, EConsoleMessageType.Error);
          // this.layoutService.showConsole();
          //this.switchViewer("console-viewer");
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
      this.load_file(storageString);
      /*if (confirm(message)) {
         this.loadFile(storageString);
      } else {
          this.newFile();
      }*/
    }
    else{
      // this.consoleService.addMessage("Error loading file from memory", EConsoleMessageType.Error);
      // this.layoutService.showConsole();
      // this.switchViewer("console-viewer");
      // this.newFile();
    }
  }

}
