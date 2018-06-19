import {Injectable, Input, Output, EventEmitter} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import {IFlowchart, Flowchart, FlowchartReader} from '../base-classes/flowchart/FlowchartModule';
import {FlowchartUtils, FlowchartConnectionUtils} from '../base-classes/flowchart/Flowchart';
import {IGraphNode, GraphNode} from '../base-classes/node/NodeModule';
import {ICodeGenerator, CodeFactory, IModule, ModuleUtils} from "../base-classes/code/CodeModule";
import {IPort} from "../base-classes/port/PortModule";
import {IProcedure} from "../base-classes/procedure/IProcedure";

import * as CircularJSON from 'circular-json';

import {AllModules as ModuleSet} from "../../assets/modules/AllModules";

import {ConsoleService, EConsoleMessageType} from "./console.service";
import {MobiusService} from "./mobius.service";
//import {LayoutService} from "./layout.service";

import {MOBIUS} from './mobius.constants';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

import {FileLoadDialogComponent} from '../ui-components/dialogs/file-load-dialog.component';

@Injectable()
export class FlowchartService {

	/*private _ffactory = new FlowchartFactory();
	private _fc = new FlowchartConverter();*/

	private _user: string = "AKM";

	private _origData: any;
	private _flowchart: IFlowchart;

	private code_generator: ICodeGenerator = CodeFactory.getCodeGenerator("js");
	private _moduleSet: IModule[];
	private _moduleMap: IModule[];

	private _selectedNode: number;
	private _selectedPort: number;
	private _active_node: IGraphNode;

	private _selectedProcedure: IProcedure;

	private _savedNodes: IGraphNode[] = [];

	private _freeze: boolean = false;

	// Observable Data sources
	// fcX.next() <-- to update
	private fcX = new BehaviorSubject<IFlowchart>(this._flowchart);
	private nX = new BehaviorSubject<IGraphNode>(this._active_node);

	// Observable data streams
	// flowchart$.subscribe() <-- to update
	public flowchart$ = this.fcX.asObservable();
	public node$ = this.nX.asObservable();

	push_flowchart(fc: IFlowchart){
		this.fcX.next(fc);
	}

	push_node(node: IGraphNode){
		this.nX.next(node);
	}

	private check(){
		return this._flowchart != undefined;
	}


	constructor(private consoleService: ConsoleService, 
	          private mobiusService: MobiusService, 
	          public dialog: MatDialog, private http: HttpClient) { 
	  	this.newFile();
	  	this.checkSavedNodes();
	};

  get freeze(){
    return this._freeze;
  }

  set freeze(value){
    this._freeze = value;
  }

  getCodeGenerator(): ICodeGenerator{
    return this.code_generator;
  }

  autoSave(time_in_seconds: number): void{
    Observable.interval(1000 * time_in_seconds).subscribe(x => {
        // console.log("saving file");
        this.saveFile(true);
    });
  }

  getLastSaved(): Date{

      if(this._flowchart.getSavedTime()){
        return this._flowchart.getSavedTime()
      }
      else{
        let myStorage = window.localStorage;
        let property = MOBIUS.PROPERTY.FLOWCHART;
        let storageString = myStorage.getItem(property);

        if(storageString){
            let fc = CircularJSON.parse(storageString)["flowchart"]["_lastSaved"];
            return (new Date(fc));
        }
        
        return;
      }

  }

  checkSavedFile(): void{
      this.openFileLoadDialog();
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

  checkSavedNodes(): void{ 

    this._savedNodes = [];
    
    let myStorage = window.localStorage;
    let property = MOBIUS.PROPERTY.NODE;
    let storageString = myStorage.getItem(property);
    let nodesStorage = CircularJSON.parse( storageString == null ? CircularJSON.stringify({n: []}) : storageString );

    let nodeData = nodesStorage.n; 

    for(let n=0; n < nodeData.length; n++){
        let n_data = nodeData[n];
        this._savedNodes.push(n_data);
    }

  }

  // 
  // message handling between components
  // 
  private subject = new Subject<any>();
  sendMessage(message: string) {
      this.subject.next({ text: message });
  }
 
  clearMessage() {
      this.subject.next();
  }

  getMessage(): Observable<any> {
      return this.subject.asObservable();
  }

  //
  //  message to all viewers that flowchart updated
  //
  update(message?: string): void{
    this.sendMessage(message || "Updated");
  }

  
  readTextFile(file: string){
      
  }

  loadFile(fileString: string): void{

      // check if filestring is url
      if(fileString && fileString.startsWith("https://")){
        try{
          this.consoleService.addMessage("Loading file from: " + fileString);
          this.http.get(fileString).subscribe(res => { 
            this.loadFile(JSON.stringify(res));
          });
        }
        catch(ex){
          this.consoleService.addMessage("Error loading file from: " + fileString, EConsoleMessageType.Error);
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

  selectNode(nodeIdx, portIdx){
    this._selectedNode = nodeIdx;
    this._selectedPort = portIdx;

    this.nX.next(this._flowchart.nodes[this._selectedNode]);
  }

  getFunction(str): Function{
    return str;
  }

  loadModules(modules: Object[]): void{

    this._moduleSet = [];
    this._moduleMap = [];
    let moduleSet = this._moduleSet;
    let moduleMap = this._moduleMap;

    let self = this;

    ModuleSet.map(function(mod){
        let name: string = ModuleUtils.getName(mod);

        if(moduleMap[name] !== undefined){
          let fns = ModuleUtils.getFunctions(mod);
          let original_mod = moduleMap[name];

          for(let i=0; i < fns.length; i++){
            let f = fns[i];
            original_mod[f.name] = self.getFunction(f.def);
          }

        }
        else{
          moduleMap[name] = mod;
          moduleSet.push(mod);
        }
    })

    // sort the set
    this._moduleSet = this._moduleSet.sort(function(a, b){
      return a["_name"].toLowerCase().localeCompare(b["_name"].toLowerCase());
    })

  }

  getModules(): IModule[]{
    return this._moduleSet;
  }

  //
  // gets the textual representation of the actual flowchart
  //
  getChartData(): string{
    return JSON.stringify(this._flowchart); //this._fc.flowchartToData(this._flowchart);
  }

  //
  //  check if flowchart is there
  //
  hasFlowchart(): boolean{
    return this._flowchart != undefined;
  }

  //
  //
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

  //
  //  returns the flowchart
  //
  getFlowchart(): IFlowchart{
    //console.warn("Flowchart shouldnot be modified outside of this service");
    return this._flowchart; 
  }

  getNodes(): IGraphNode[]{
    return this._flowchart.getNodes();
  }

  getEdges(): any[]{
    return this._flowchart.getEdges();
  }

  getSavedNodes(): any{
    return this._savedNodes;
  }

  saveNode(node: IGraphNode|number): void{

    if( typeof node == "number"){
      node = this._flowchart.getNodeByIndex(node);
    }

    // todo: check if overwrite
    if( node.getType() !== undefined ){
      console.error("This node was already in the library and shouldn't have invoked this function.");
    }
    else{
      let message: string;

      let nav: any = navigator;
      let myStorage = window.localStorage;

      let property = MOBIUS.PROPERTY.NODE; 
      let storageString = myStorage.getItem(property);

      // initialize node storage by reading from localStorage or reading an empty array
      let nodesStorage = CircularJSON.parse(storageString == null ? CircularJSON.stringify({n: []}) : storageString);

      // array of nodes
      let nodes = nodesStorage.n;

      // check is another node exists with same name
      for(let i=0; i < nodes.length; i++){

          let node_in_lib: IGraphNode = nodes[i];
          if(node_in_lib["_name"] === node.getName()){
            message = "Node with this name already exists in the library. Either delete existing\
            node from the library or rename your node and try again.";
            this.consoleService.addMessage(message);
            // this.layoutService.showConsole();
            this.switchViewer("console-viewer");
            return;
          }
      }

      // no node with common name was found
      try{
        nodesStorage.n.push(node);
        myStorage.setItem( property, CircularJSON.stringify(nodesStorage) );
        message = "Bravo! Node saved. Now you have " + (nodes.length) + " node(s) in the library!";
        node.saved();

        this.consoleService.addMessage(message);
        // this.layoutService.showConsole();
        this.switchViewer("console-viewer");
        this.checkSavedNodes();
        this.update();
      }
      catch(ex){
        this.consoleService.addMessage("Oops. Something went wrong while saving this node.\
                                        Post the error message to the dev team on our Slack channel.", EConsoleMessageType.Error);
        this.consoleService.addMessage(ex, EConsoleMessageType.Error);
        // this.layoutService.showConsole();
        this.switchViewer("console-viewer");
      }

    }

  }

  clearLibrary(nodeID ?: string): void{

    let nav: any = navigator;
    let myStorage = window.localStorage;

    let property = MOBIUS.PROPERTY.NODE;

    if(nodeID == undefined){
      let storageString = myStorage.removeItem(property);
      this.consoleService.addMessage("Node Library was cleared.");
    }
    else{
      this._savedNodes = this._savedNodes.filter(function(node){
         return node["_id"] != nodeID;
      });
      
      if(this._savedNodes.length == 0){
        myStorage.removeItem(property);
      }
      else{
        let nodesStorage = CircularJSON.stringify({ n: this._savedNodes });
        myStorage.setItem(property, nodesStorage);
      }
      this.consoleService.addMessage("Node from library was deleted.");
    }

    this.getNodes().map(function(node){

      if(nodeID === undefined){
        node.removeType();
      }
      else if(node.getType() == nodeID){
        node.removeType();
      }

    })

    // print message to console
    this.switchViewer("console-viewer");
    this.checkSavedNodes();
    this.update();
  }

  addEdge(outputAddress: number[], inputAddress: number[]):  void{

      if(outputAddress[0] == inputAddress[0]){
        return;
      }

      try{
        this._flowchart.addEdge(outputAddress, inputAddress);
        this.consoleService.addMessage("New Edge was added");
      }
      catch(ex){
        this.consoleService.addMessage(ex, EConsoleMessageType.Error);
      }

      this.update();
  }

  addProcedure(prod: IProcedure): void{
      this.update("procedure");
  }

  checkProcedure(prod: IProcedure): void{
      // validate procedure
      //let codeString: string = prod.getCodeString(this.code_generator);
  }

  disconnectPort(type: string, portIndex: number, nodeIndex: number): void{
    this._flowchart.disconnectPort(type, portIndex, nodeIndex)
  }

  disconnectNode(nodeIndex: number): void{
    this.fcX.next(FlowchartConnectionUtils.disconnect_node(this._flowchart, nodeIndex));
  }

  //
  //  update indices in edges on port deleted
  //
  deletePort(type: string, portIndex: number): void{
    this._flowchart.deletePort(type, portIndex, this._selectedNode);

    this.update();
  }

  deleteEdge(edgeIndex: number): void{
    FlowchartUtils.delete_edge(this._flowchart, edgeIndex);
    
    // print message to console
    this.consoleService.addMessage("Edge was deleted");
  }

  selectProcedure(prod: IProcedure): void{
    this._selectedProcedure = prod;
  }

  getSelectedNode(): IGraphNode{


    if(this._selectedNode == undefined)
      return undefined;

    return this._flowchart.getNodeByIndex(this._selectedNode);
  }

  getSelectedNodeIndex(): number{
    return this._selectedNode;
  }

  getSelectedPort(): any{

    if(this._selectedNode == undefined){
      return undefined;
    }
    // todo: where is this used?
    return this.getSelectedNode().getOutputByIndex(this._selectedPort);
  }

  getSelectedPortIndex(): number{
    return this._selectedPort;
  }

  getSelectedProcedure(): IProcedure{
    return this._selectedProcedure;
  }

  //
  //  
  //
  isSelected(node: IGraphNode): boolean{
    if(this._selectedNode == undefined){
      return false; 
    }
    return this._flowchart.getNodeByIndex(this._selectedNode).getId() == node.getId();
  }

  // 
  //  run this flowchart
  //
  execute(): any{

      let consoleMessages: string[] = [ "<div class='console-heading'>Printed Values</div>" ];

      //
      //  generates an HTML version of the values
      //
      let printFunction = function(varName: string, value: any){
          let consoleHTML: string = "";
          
          let variable_name: string = varName;
          let variable_value: string = value; 

          if(Array.isArray(value)){
             variable_value = "<em>Array(" + value.length + " items)</em>"; //"[" + variable_value + "]";
          }
          else if(typeof value == 'string'){
             variable_value = "\"" + value + "\"";
          }
          else if(typeof(value) == "object"){
            let strRep: string = value.toString();
            if(strRep !== "[object Object]"){
              variable_value = strRep.replace(/\n/g, '<br>');
            }
            else{
              let keys = Object.keys(value);
              variable_value = "<em>JSON Object with properties: (" + keys.toString() + ")</em>";;
              // variable_value += "<ul>" + keys.map(function(k){
              //   let type: string = typeof(variable_value[k]);
              //   if (Array.isArray(variable_value[k])){
              //     type = "<em>array(" + variable_value[k].length + " items)</em>"
              //   }
              //   else if(type == "string"){
              //     type = "\"" + variable_value[k] + "\"";
              //   }
              //   else if(type == "number"){
              //     type = variable_value[k];
              //   }
              //   else if(type == "object"){
              //     type = "<em>" + type + "</em>";
              //   }

              //   return "<li>" + k + " :: "+  type + "</li>";
              // }).join("") + "</ul>";
            }
          }

          consoleHTML += "<div class='console-line'>" +  "<span class='var-name'>Value of "  + variable_name + ": </span>" + 
                 "<span class='var-value'>"  + variable_value +  "</div>";

          consoleMessages.push(consoleHTML);
      }

      try{
          this._flowchart.execute(this.code_generator, this._moduleMap, printFunction);
          
          if(consoleMessages.length > 1){
            this.consoleService.addMessage( consoleMessages.join(""), EConsoleMessageType.Print );
          }
          consoleMessages = null;
          printFunction = null;
          
          this.consoleService.addMessage("Flowchart was successfully executed.");
          
          
      }
      catch(ex){
        
          if(consoleMessages.length > 1){
            this.consoleService.addMessage( consoleMessages.join(""), EConsoleMessageType.Print );
          }
          consoleMessages = null;
          printFunction = null;

          let errorMessage: string = "<div class='error'>" + ex + "</div>";
          this.consoleService.addMessage( errorMessage, EConsoleMessageType.Error );

          // this.layoutService.showConsole();
          this.switchViewer("console-viewer");
      }

      this.mobiusService.processing = false;

      this.update();
  }

  //
  // get execution code    
  //
  getCode(): string{
    console.log("get code called");
    return ""
    //return this.code_generator.getDisplayCode(this._flowchart);
  }

  saveFile(local?: boolean): void{
    let file = {};
    let fileString: string;

    if(local)
        this._flowchart.setSavedTime(new Date());

    file["language"] = "js";
    file["modules"] = [];

    if(local == true){
      // add file string to local storage
      file["flowchart"] = this._flowchart;

      fileString = CircularJSON.stringify(file);

      let myStorage = window.localStorage;
      let property = MOBIUS.PROPERTY.FLOWCHART;
      myStorage.setItem(property, fileString);

      this.consoleService.addMessage("Autosaved flowchart.");
    }
    else{
      let newFlowchart: IFlowchart = FlowchartReader.readFlowchartFromData(this._flowchart);
      file["flowchart"] = newFlowchart;
      fileString = CircularJSON.stringify(file);

      let fname: string = 'Scene' + (new Date()).getTime() + ".mob";
      if(this._flowchart.name){
        fname = this._flowchart.name;
        if(!fname.endsWith(".mob")){
          fname = fname + ".mob";
        }
      }


      // this.downloadContent({
      //     type: 'text/plain;charset=utf-8',
      //     filename: fname,
      //     content: fileString
      // });
      var blob = new Blob([fileString], {type: 'application/json'});
      this.downloadContent(blob, fname);
      this.consoleService.addMessage("File saved successfully");
      
      
    }

  }

  // downloadContent(filename, filestring){
  //   var blob = new Blob([filestring], {type: 'application/json'});
  //   var url = URL.createObjectURL(blob);
  // }

  downloadContent(blob, filename) {
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, filename);
    } else {
        const a = document.createElement('a');
        document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = filename;
        a.click();
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 0)
    }
  }

  switchViewer(viewerType: string): void{
    let self = this;
    setTimeout(function(){
      self.update("switch viewer: " + viewerType);
    }, 200);
  }

}

export abstract class ModuleService {

  public static modules: any[] = [];

  constructor() { ModuleService.init() }

  public static init(){
  let modulearr = Object.keys(ModuleSet).map(function(module_name){ return {_name: module_name, _version: 0.1, _author: "Patrick"}}); 

    let sortFn = function(a, b){
      return a._name.toLowerCase().localeCompare(b._name.toLowerCase());
    }

    ModuleService.modules = modulearr.sort( sortFn );
  }

}
