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

  load_file_from_url(url: string){
    try{
        let fileString = this.http.get(url).subscribe(res => { 
              this.load_file_from_string(JSON.stringify(res));
        });
    }
    catch(ex){
        this.$log.log("Error fetching file from from URL: ${url}");
    }
  }

  load_file_from_string(fileString: string): void{
        let _this = this;
        let jsonData: {language: string, flowchart: JSON, modules: JSON};

        try{
          let data = CircularJSON.parse(fileString);

          // set the code_generator to the language of the file
          // set the modules to the modules named by the file
          _this.code_generator = CodeFactory.getCodeGenerator(data["language"]);
          this._ms.load_modules();

          let flowchart: IFlowchart = FlowchartReader.read_flowchart_from_data(data["flowchart"]);
          this._fs.push_flowchart(flowchart);
          // TODO: select a node
          
        }
        catch(err){
          this.$log.log("Error loading file from string");
        }
  }

  new_file(): void{ 
    this._fs.new_flowchart(this.user);
    this.code_generator = CodeFactory.getCodeGenerator("js");
    this._ms.load_modules();
    this.$log.log("Created new file.");
  }


}
