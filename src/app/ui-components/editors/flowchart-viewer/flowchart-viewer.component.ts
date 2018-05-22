import { Component, OnInit, OnDestroy, Injector, ViewChild, ElementRef, HostListener } from '@angular/core';
import { NgClass } from '@angular/common';

import { IGraphNode, IEdge, GraphNode } from '../../../base-classes/node/NodeModule';
import { InputPort, OutputPort } from '../../../base-classes/port/PortModule';

import { Viewer } from '../../../base-classes/viz/Viewer';
import { FlowchartService } from '../../../global-services/flowchart.service';
import { ConsoleService } from '../../../global-services/console.service';

import {MatTooltipModule} from '@angular/material/tooltip';
import {MatMenuModule} from '@angular/material/menu';

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {PublishSettingsComponent} from '../publish-settings/publish-settings.component';

@Component({
  selector: 'app-flowchart-viewer',
  templateUrl: './flowchart-viewer.component.html',
  styleUrls: ['./flowchart-viewer.component.scss']
})
export class FlowchartViewerComponent extends Viewer{

  pan_mode: boolean = false;
  pan_init;
  left: number = 0; 
  top: number = 0;
  zoom: number = 1; 

  _portWidth: number = 15; 
  _margin: number = 10; 

  _selectedNode: IGraphNode;
  _selectedNodeIndex: number;
  _selectedPortIndex: number;
  _nodes: IGraphNode[] = [];
  _edges: IEdge[] = [];

  showLibrary: boolean = false;

  showDialog: {status: boolean, position: number[]} = {status: false, position: [0,0]};

  constructor(injector: Injector, 
    private consoleService: ConsoleService, 
    public dialog: MatDialog){  
    super(injector, "FlowchartViewer");  

    // bad bad bad!
    /*let self = this;
    document.addEventListener("keydown", function(e) {
      if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey))      {
        e.preventDefault();
        self.save(true);
        //your implementation or function calls
      }
    }, false);*/

  }

  ngOnDestroy(){
    this.consoleService = null;
    this._nodes = null; 
    this._edges = null;
  }

  reset(){ 

    if( this.flowchartService.getNodes().length ){
         this.update();
    }
    else{
      this._selectedNode = undefined;
      this._selectedNodeIndex = undefined;
      this._selectedPortIndex = undefined;
      this._nodes = [];
      this._edges = [];
    }

  }

  editNode(): void{
    ////this.layoutService.toggleEditor();
  }

  deleteNode(node_index: number): void{
    this._selectedNode = undefined; 
    ////this.layoutService.hideEditor();
    this.flowchartService.deleteNode(node_index);
  }

  toggleNode(node: IGraphNode, node_index: number): void{ 
    if(node.isDisabled()){
      node.enable();
    }
    else{
      node.disable();
    }
  }

  addFunctionOutput(node_index){
    this.flowchartService.disconnectNode(node_index);
    
    let node: IGraphNode = this._nodes[node_index];
    node.addFnOutput( this.flowchartService.getCodeGenerator() );
    this.flowchartService.update();
  }

  //
  //
  //  Viewer Related Functions
  //
  //
  resetViewer(): void{
    this.zoom = 1; 
    this.left = 0; 
    this.top = 0; 
    this.pan_mode = false;

  }

  //
  //
  //
  pan($event): void{
    //console.log("mousedown", $event);
  }

  //
  //  node class is assigned a zoom value based on this value
  //  this position of this node is absolute coordinates
  //
  scale($event): void{

    $event.preventDefault();
    $event.stopPropagation();

    let scaleFactor: number = 0.1;
    let value: number = this.zoom  + (Math.sign($event.wheelDelta))*scaleFactor;
    
    if(value > 0.2 && value < 1.5){
      this.zoom = Number( (value).toPrecision(2) );
      this.updateEdges();
    }

  }

  lastSaved(): Date{
    let date: Date = this.flowchartService.getLastSaved();
    return date;
  }

  startPan($event): void{
    this.pan_mode = true;
    this.pan_init = [$event.clientX, $event.clientY];
  }

  panning($event): void{
    if (this.pan_mode == true){
        let relX = $event.clientX - this.pan_init[0];
        let relY = $event.clientY - this.pan_init[1];
        let factor: number = 1; 
        this.left += relX; 
        this.top += relY;
        this.pan_init = [$event.clientX, $event.clientY];
    }
  }

  stopPan($event): void{
    this.pan_mode = false;
    this.pan_init = undefined;
  }

  //
  //
  //  Data Related Functions
  //
  //
  updateEdges(): void{ 
    for(let e=0; e< this._edges.length; e++){
        let edge: IEdge = this._edges[e];
        let output_position =  this.getPortPosition(edge.output_address[0], edge.output_address[1], "po");
        let input_position = this.getPortPosition(edge.input_address[0], edge.input_address[1], "pi");

        edge["inputPosition"] = input_position;
        edge["outputPosition"] = output_position;
    }
  }

  update(){

    console.log("updated")

    this._nodes = this.flowchartService.getNodes();
    this._edges = this.flowchartService.getEdges();

    let m = this._margin; 
    let pw = this._portWidth;
    this._nodes.map(function(node){

          let inputs = node.getInputs().length; 
          let outputs =  node.getOutputs().length;
          let max = inputs > outputs ? inputs : outputs; 

          let width = m*(max+1) + (max)*pw;

          node["width"] = width;
    }) 

    this.updateEdges();

    this._selectedNode = this.flowchartService.getSelectedNode();
    this._selectedNodeIndex = this.flowchartService.getSelectedNodeIndex();
    this._selectedPortIndex = this.flowchartService.getSelectedPortIndex();
  }

  resetData(): void{
    this._selectedNode = undefined;
    this._nodes = [];
    this._edges = [];
  }

  //
  //
  //
  isSelected(node: IGraphNode): boolean{
    if(node == undefined){
      return false;
    }

    return this.flowchartService.isSelected(node);
  }

  isPortSelected(nodeIndex:number, portIndex: number){
    return (nodeIndex == this._selectedNodeIndex && portIndex == this._selectedPortIndex)
  }

  isSaved(node: IGraphNode): boolean{
    if(node.getType() === undefined){
      return false;
    }
    else{
      return true;
    }
  }

  //
  // Add node and edges
  //
  addNode($event, type: number): void{
    $event.stopPropagation();
    if(type == undefined){
      this.flowchartService.addNode();
    }
    else{
      this.flowchartService.addNode(type);
    }

    this.update();
  }

  addEdge(outputPortAddress: number[], inputPortAddress: number[]): void{
    this.flowchartService.addEdge(outputPortAddress, inputPortAddress);
  }

  //
  //
  //  Events
  //
  //
  deselect($event){
     $event.stopPropagation();
     this.flowchartService.selectNode(undefined, undefined);
  }

  clickNode($event: Event, nodeIndex: number): void{
    // select the node
    $event.stopPropagation();
    this.flowchartService.selectNode(nodeIndex);
  }

  clickPort($event: Event, nodeIndex: number, portIndex: number): void{
    // select the node
    $event.stopPropagation();
    this.flowchartService.selectNode(nodeIndex, portIndex);
  }

  // clickEdge(): void{
  //   alert("hello wrold");
  // }

  // addPort(nodeIndex: number, type: string): void{
  //   // select the node
  //   this.clickNode(null, nodeIndex);

  //   // add port 
  //   if(type == "in"){
  //       this._nodes[nodeIndex].addInput();
  //   }
  //   else if(type == "out"){
  //       this._nodes[nodeIndex].addOutput();
  //   }  

  //   this.flowchartService.update();
  // }


  //
  //  node dragging
  //
  dragProp = {dragStart: {x: 0, y: 0}, trend: {x: 1, y: 1}, shakeCount: 0};

  nodeDragStart($event, node): void{
    $event.dataTransfer.setDragImage( new Image(), 0, 0);
    // todo : find more elegant solution
    this.dragProp.dragStart = {x: $event.pageX, y: $event.pageY}; 

    this.dragProp.trend = {x: 1, y: 1};
    this.dragProp.shakeCount = 0; 
  }

  nodeDragging($event, node, nodeIndex): void{
    this.pan_mode = false;
    let relX: number = $event.pageX - this.dragProp.dragStart.x; 
    let relY: number = $event.pageY - this.dragProp.dragStart.y;

    // if node is going beyond canvas, do nothing
    if( (node.position[0] + relX/this.zoom) < 0 || (node.position[1] + relY/this.zoom) < 0){
      return;
    }
    
    node.position[0] += relX/this.zoom; 
    node.position[1] += relY/this.zoom; 

    this.dragProp.dragStart = {x: $event.pageX, y: $event.pageY};

    if(relX && relY){
      if( Math.sign(relX) !== this.dragProp.trend.x || Math.sign(relY) !== this.dragProp.trend.y ){
        this.dragProp.trend = {x: Math.sign(relX), y: Math.sign(relY) };
        this.dragProp.shakeCount++;

        if(this.dragProp.shakeCount == 8){
           this.flowchartService.disconnectNode(nodeIndex);
        }

      }
    }

    this.updateEdges();
  }

  nodeDragEnd($event, node): void{
    this.pan_mode = false;
    let relX: number = $event.pageX - this.dragProp.dragStart.x; 
    let relY: number = $event.pageY - this.dragProp.dragStart.y;

    if( (node.position[0] + relX/this.zoom) < 0 || (node.position[1] + relY/this.zoom) < 0){
      return;
    }
    
    node.position[0] += relX; 
    node.position[1] += relY; 

    this.dragProp.dragStart = {x:  0, y: 0};

    this.dragProp.trend = {x: 1, y: 1};
    this.dragProp.shakeCount = 0;

    this.updateEdges();
  }

  //
  //  port dragging to link
  //
  portDragProp = { _startPort: undefined, 
                   _endPort: undefined, 
                   dragStart: {x: 0, y: 0},
                   _linkMode: false, 
                   _mouse_pos: { 
                        start: {x: 0, y: 0}, 
                        current: {x: 0, y: 0}
                      }
                 }

  portDragStart($event, port: InputPort|OutputPort, address: number[]){

      $event.stopPropagation();

      $event.dataTransfer.setDragImage( new Image(), 0, 0);
      this.portDragProp._startPort = port; 
      this.portDragProp._startPort['address'] = address;
      this.portDragProp._linkMode = true;

      let type: string;
      if(port instanceof InputPort){
        type = "pi";
      }
      if(port instanceof OutputPort){
        type = "po";
      }
      

      let port_position =  this.getPortPosition(address[0], address[1], type);

      this.portDragProp._mouse_pos.start = {x: port_position.x, y: port_position.y };
      this.portDragProp._mouse_pos.current = {x: port_position.x, y: port_position.y };
      
      this.portDragProp.dragStart = {x: $event.clientX, y: $event.clientY};
  }

  portDragging($event, port: InputPort|OutputPort){

      $event.stopPropagation();

      // todo: compute total offset of this div dynamically
      // urgent!
      let relX: number = $event.clientX - this.portDragProp.dragStart.x; 
      let relY: number = $event.clientY - this.portDragProp.dragStart.y;

      this.portDragProp._mouse_pos.current.x += relX/this.zoom; 
      this.portDragProp._mouse_pos.current.y += relY/this.zoom; 

      this.portDragProp.dragStart = {x: $event.clientX, y: $event.clientY}; 
  }

  portDragEnd($event, port: InputPort|OutputPort){

      $event.stopPropagation();

      let relX: number = $event.clientX - this.portDragProp.dragStart.x; 
      let relY: number = $event.clientY - this.portDragProp.dragStart.y;
      this.portDragProp._mouse_pos.current.x += relX; 
      this.portDragProp._mouse_pos.current.y += relY; 
      
      this.portDragProp.dragStart = {x: 0, y: 0}; 

      this.portDragProp._startPort = undefined; 
      this.portDragProp._endPort = undefined;
      this.portDragProp._linkMode = false;
  }

  portDrop($event, port: InputPort|OutputPort, address: number[]){
      
      this.portDragProp._endPort = port; 
      this.portDragProp._endPort["address"] = address;

      if(this.portDragProp._startPort !== undefined && this.portDragProp._endPort !== undefined){


        let inputPort: number[]; 
        let outputPort: number[];

        if( this.portDragProp._startPort instanceof InputPort ){
          inputPort = this.portDragProp._startPort["address"];
        }

        if( this.portDragProp._startPort instanceof OutputPort ){
          outputPort = this.portDragProp._startPort["address"];
        }

        if( this.portDragProp._endPort instanceof InputPort ){
          inputPort = this.portDragProp._endPort["address"];
        }

        if( this.portDragProp._endPort instanceof OutputPort ){
          outputPort = this.portDragProp._startPort["address"];
        }

        if( inputPort !== undefined && outputPort !== undefined){
            this.addEdge(outputPort, inputPort);
        }
        else{
            alert("Invalid connection")
        }

        // clear the variables
        this.portDragProp._startPort = undefined; 
        this.portDragProp._endPort = undefined;
      }
  }


  private getPortPosition(nodeIndex: number, portIndex: number, type: string): {x: number, y: number}{

    let x: number;
    let y: number;
    let port_size: number = 15;

    let name: string = "n" + nodeIndex + type + portIndex;
    let el: any = document.getElementById(name);

    if(el == null || this._nodes[nodeIndex] == undefined){
      return {x: 0, y: 0};
    }

    let node_pos: number[] = this._nodes[nodeIndex].position;

    let port_pos_x = el.offsetLeft;
    let port_pos_y = el.offsetTop;
    let node_width = el.offsetParent.offsetWidth;

    if(type == "pi"){
      x = node_pos[0];
      y = node_pos[1] + (port_pos_y + port_size/2);
    } 
    else if(type == "po"){
      x = node_pos[0] + node_width;
      y = node_pos[1] + (port_pos_y + port_size/2);
    }
    else{
      throw Error("Unknown port type");
    }

    return {x: x, y: y};
  }


  getZoomStyle(): string{
    let value: string = "scale(" + this.zoom + ")";
    return value;
  }

  //
  // Edge drawing functions
  //
  getEdgePath(edge: IEdge): string{

    let output_position, input_position;

    try{
      output_position =  this.getPortPosition(edge.output_address[0], edge.output_address[1], "po");
      input_position = this.getPortPosition(edge.input_address[0], edge.input_address[1], "pi");
      
      edge["inputPosition"] = input_position;
      edge["outputPosition"] = output_position;
      
    }
    catch(ex){

    }

    return this.edgeString( output_position, input_position );

  }


  //
  //  todo: Balu
  //
  //
  edgeString(output_port_position: {x: number, y: number},  input_port_position: {x: number, y: number}): string{

    if(output_port_position == undefined || input_port_position == undefined)
      return "";

    // add margin to output port in downward direction
    //output_port_position.y += 30; 
    // add margin to input port in upward direction
    //input_port_position.y -= 30;
    //
    
    let path: string;
    let move: string = "M";
    let line: string = " L";
    let control: string = " Q";

    // add the start point from output
    let startPoint: string = output_port_position.x + " " + output_port_position.y;
    let endPoint: string = input_port_position.x +  " " + input_port_position.y;

    // move downwards/upwards in straight line
    let translate: number = 10; 
    let shifted_startPoint: string = output_port_position.x  + translate + " " + (output_port_position.y);
    let shifted_endPoint: string = input_port_position.x - translate + " " + (input_port_position.y );

    // compute curvy line
    var x0 = output_port_position.x + translate;
    var y0 = output_port_position.y ;
    var x3 =  input_port_position.x - translate;
    var y3 =  input_port_position.y ;
    
    var mx1=0.75*x0+0.25*x3;
    var mx2=0.25*x0+0.75*x3;

    var my1=0.75*y0+0.25*y3;
    var my2=0.25*y0+0.75*y3;

    var distance = 0.25*Math.round(Math.sqrt(Math.pow((x3-x0),2)+Math.pow((y3-y0),2)));
    var pSlope =(x0-x3)/(y3-y0);
    var multi = Math.round(Math.sqrt(distance*distance/(1+(pSlope*pSlope))));
    
    var x1,y1,x2,y2=0;
    
    x1 =mx1+multi;
    x2 =mx2-multi;
    
    if(y0==y3){
      y1=y0+distance;
      y2=y0-distance;
    }
    else{
      y1 =my1+(pSlope*multi);
      y2 =my2-(pSlope*multi);
    }
  
    //path="M"+x0+" "+y0+" C"+x1+" "+y1+" "+x2+" "+y2+" "+x3+" "+y3;*/

    path = move + startPoint 
          + line + shifted_startPoint 
          + "C" + x1 + " " + y1 + " " + x2 + " " + y2 + " " + x3 + " " + y3
          //+ line + shifted_endPoint 
          + line + endPoint;
    
    return path;
  }


  saveNode(node: IGraphNode): void{
    this.flowchartService.saveNode(node);
  }

  //
  //
  
  @ViewChild('fileInput') fileInput: ElementRef;
  openPicker(): void{
    let el: HTMLElement = this.fileInput.nativeElement as HTMLElement;
    el.click();
  }

  loadFile(url ?:string): void{
    let file = this.fileInput.nativeElement.files[0];
    if (file) {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        let fs = this.flowchartService;
        reader.onload = function (evt) {
          let fileString: string = evt.target["result"];
          fs.loadFile(fileString);
        }
        reader.onerror = function (evt) {
            console.log("Error reading file");
        }
    }
    // this.flowchartService.loadFile(url);
  }

  loadFromMemory(): void{
    this.flowchartService.checkSavedFile();
  }

  save(value: boolean): void{
    this.flowchartService.saveFile(value);
    //this.layoutService.showConsole();
  }

  newfile(): void{
    this.flowchartService.newFile();
  }

  publishSettings(): void{
    let dialogRef = this.dialog.open(PublishSettingsComponent, {
            height: '500px',
            width: '450px',          
            data: { 
                  }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
        });

  }

}

