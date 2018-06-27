import { Component, 
         Output, EventEmitter,
         OnInit, OnDestroy, 
         ViewChild, ElementRef, 
         HostListener } from '@angular/core';
import { NgClass } from '@angular/common';

import { IFlowchart } from '../../../base-classes/flowchart/IFlowchart';
import { FlowchartUtils } from '../../../base-classes/flowchart/Flowchart';
import { IGraphNode, IEdge, GraphNode } from '../../../base-classes/node/NodeModule';
import { InputPort, OutputPort } from '../../../base-classes/port/PortModule';

import { FlowchartService } from '../../../global-services/flowchart.service';
import { ConsoleService } from '../../../global-services/console.service';
import { MobiusService } from '../../../global-services/mobius.service';


import {MatTooltipModule} from '@angular/material/tooltip';
import {MatMenuModule} from '@angular/material/menu';

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {PublishSettingsComponent} from '../publish-settings/publish-settings.component';


abstract class  FlowchartRenderUtils{
  private static _portWidth: number = 15; 
  private static _margin: number = 10;  

  public static node_width(node: IGraphNode): number{
    let max = Math.max(node.inputs.length, node.outputs.length); 
    let width = FlowchartRenderUtils._margin*(max+1) + (max)*FlowchartRenderUtils._portWidth;
    return width;
  }

  public static get_port_position(node: IGraphNode, portIndex: number, portType: string): {x: number, y: number}{

    let x: number;
    let y: number;
    let port_size: number = 15;

    let name: string = "n" + node.id + portType + portIndex;
    let el: any = document.getElementById(name);

    if(el == null || node == undefined){
      return {x: 0, y: 0};
    }

    let node_pos: number[] = node.position;

    let port_pos_x = el.offsetLeft;
    let port_pos_y = el.offsetTop;
    let node_width = el.offsetParent.offsetWidth;

    if(portType == "pi"){
      x = node_pos[0];
      y = node_pos[1] + (port_pos_y + port_size/2);
    } 
    else if(portType == "po"){
      x = node_pos[0] + node_width;
      y = node_pos[1] + (port_pos_y + port_size/2);
    }
    else{
      throw Error("Unknown port type");
    }

    return {x: x, y: y};
  }
}


@Component({
  selector: 'app-flowchart-viewer',
  templateUrl: './flowchart-viewer.component.html',
  styleUrls: ['./flowchart-viewer.component.scss']
})
export class FlowchartViewerComponent implements OnInit, OnDestroy{

  pan_mode: boolean = false;
  pan_init;
  left: number = 0; 
  top: number = 0;
  zoom: number = 1; 


  _selectedNode: IGraphNode;
  _selectedNodeIndex: number;
  _selectedPortIndex: number;


  fc: IFlowchart;

  showLibrary: boolean = false;

  showDialog: {status: boolean, position: number[]} = {status: false, position: [0,0]};

  private subscriptions = [];
  private active_node: IGraphNode;

  constructor(private _fs: FlowchartService, 
    private _mb: MobiusService,
    private consoleService: ConsoleService, 
    public dialog: MatDialog){}

  ngOnInit(){
    this.subscriptions.push(this._fs.flowchart$.subscribe((fc) => this.render_flowchart(fc) ));
    this.subscriptions.push(this._fs.node$.subscribe( (node) => this.active_node = node ));
  }

  ngOnDestroy(){
    this.subscriptions.map(function(s){
      s.unsubscribe();
    })
  }
  
  push_flowchart(){
    this._fs.push_flowchart(this.fc)
  }

  push_node(){
    this._fs.push_node(this.active_node)
  }

  render_flowchart(fc: IFlowchart){
    this.fc = fc;

    this.fc.nodes.map( (node) => node["width"] = FlowchartRenderUtils.node_width(node) );
    this.fc.edges.map( (edge) => {
      edge["inputPosition"] = FlowchartRenderUtils.get_port_position( this.fc.nodes[edge.input_address[0]], edge.input_address[1], "pi");
      edge["outputPosition"] = FlowchartRenderUtils.get_port_position(this.fc.nodes[edge.output_address[0]], edge.output_address[1], "po");
    })

    console.log("Flowchart updated") 
  }


  // node utils
  delete_node(node_id: string): void{
    this._selectedNode = undefined; 
    if (this.active_node.id == node_id)   this._fs.push_node(undefined); 

    this.fc = FlowchartUtils.delete_node(this.fc, node_id);
  }

  addFunctionOutput(node_index){
    this._fs.disconnectNode(node_index);
    
    let node: IGraphNode = this.fc.nodes[node_index];
    node.addFnOutput( this._fs.getCodeGenerator() );
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
    
  }

  resetData(): void{
  }

  //
  //
  //
  isSelected(node: IGraphNode): boolean{
    if(node == undefined){
      return false;
    }
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
  add_node($event): void{
    $event.stopPropagation();
    this.fc = FlowchartUtils.add_node(this.fc);
    this.push_flowchart()
  }

  addEdge(outputPortAddress: number[], inputPortAddress: number[]): void{
    this._fs.addEdge(outputPortAddress, inputPortAddress);
  }

  //
  //
  //  Events
  //
  //
  deselect($event){
     $event.stopPropagation();
  }

  clickPort($event: Event, nodeIndex: number, portIndex: number): void{
    // select the node
    $event.stopPropagation();
  }

  //
  //  node dragging
  //
  dragStart = {x: 0, y: 0};
  trend = {x: 1, y: 1};
  shakeCount: number = 0;

  nodeDragStart($event, node): void{
    $event.dataTransfer.setDragImage( new Image(), 0, 0);
    // todo : find more elegant solution
    this.dragStart = {x: $event.pageX, y: $event.pageY}; 

    this.trend = {x: 1, y: 1};
    this.shakeCount = 0; 
  }

  nodeDragging($event, node, nodeIndex): void{
    this.pan_mode = false;
    let relX: number = $event.pageX - this.dragStart.x; 
    let relY: number = $event.pageY - this.dragStart.y;

    // if node is going beyond canvas, do nothing
    if( (node.position[0] + relX/this.zoom) < 0 || (node.position[1] + relY/this.zoom) < 0){
      return;
    }
    
    node.position[0] += relX/this.zoom; 
    node.position[1] += relY/this.zoom; 

    this.dragStart = {x: $event.pageX, y: $event.pageY};

    if(relX && relY){
      if( Math.sign(relX) !== this.trend.x || Math.sign(relY) !== this.trend.y ){
        this.trend = {x: Math.sign(relX), y: Math.sign(relY) };
        this.shakeCount++;

        if(this.shakeCount == 8){
           this._fs.disconnectNode(nodeIndex);
        }

      }
    }

    this.updateEdges();
  }

  nodeDragEnd($event, node): void{
    this.pan_mode = false;
    let relX: number = $event.pageX - this.dragStart.x; 
    let relY: number = $event.pageY - this.dragStart.y;

    if( (node.position[0] + relX/this.zoom) < 0 || (node.position[1] + relY/this.zoom) < 0){
      return;
    }
    
    node.position[0] += relX; 
    node.position[1] += relY; 

    this.dragStart = {x:  0, y: 0};

    this.trend = {x: 1, y: 1};
    this.shakeCount = 0;

    this.updateEdges();
  }

  //
  //  port dragging to link
  //
  _startPort: InputPort|OutputPort;
  _endPort: InputPort|OutputPort;
  _linkMode: boolean = false;
  mouse_pos = { 
                start: {x: 0, y: 0}, 
                current: {x: 0, y: 0}
              }

  portDragStart($event, port: InputPort|OutputPort, address: number[]){

      $event.stopPropagation();

      $event.dataTransfer.setDragImage( new Image(), 0, 0);
      this._startPort = port; 
      this._startPort['address'] = address;
      this._linkMode = true;

      let type: string;
      if(port instanceof InputPort){
        type = "pi";
      }
      if(port instanceof OutputPort){
        type = "po";
      }
      

      let port_position = FlowchartRenderUtils.get_port_position(this.fc.nodes[address[0]], address[1], type);
      console.log(port_position)

      this.mouse_pos.start = {x: port_position.x, y: port_position.y };
      this.mouse_pos.current = {x: port_position.x, y: port_position.y };
      
      this.dragStart = {x: $event.clientX, y: $event.clientY};
  }

  portDragging($event, port: InputPort|OutputPort){

      $event.stopPropagation();

      // todo: compute total offset of this div dynamically
      // urgent!
      let relX: number = $event.clientX - this.dragStart.x; 
      let relY: number = $event.clientY - this.dragStart.y;

      this.mouse_pos.current.x += relX/this.zoom; 
      this.mouse_pos.current.y += relY/this.zoom; 

      this.dragStart = {x: $event.clientX, y: $event.clientY}; 
  }

  portDragEnd($event, port: InputPort|OutputPort){

      $event.stopPropagation();

      let relX: number = $event.clientX - this.dragStart.x; 
      let relY: number = $event.clientY - this.dragStart.y;
      this.mouse_pos.current.x += relX; 
      this.mouse_pos.current.y += relY; 
      
      this.dragStart = {x: 0, y: 0}; 

      this._startPort = undefined; 
      this._endPort = undefined;
      this._linkMode = false;
  }

  portDrop($event, port: InputPort|OutputPort, address: number[]){
      
      this._endPort = port; 
      this._endPort["address"] = address;

      if(this._startPort !== undefined && this._endPort !== undefined){


        let inputPort: number[]; 
        let outputPort: number[];

        if( this._startPort instanceof InputPort ){
          inputPort = this._startPort["address"];
        }

        if( this._startPort instanceof OutputPort ){
          outputPort = this._startPort["address"];
        }

        if( this._endPort instanceof InputPort ){
          inputPort = this._endPort["address"];
        }

        if( this._endPort instanceof OutputPort ){
          outputPort = this._startPort["address"];
        }

        if( inputPort !== undefined && outputPort !== undefined){
            this.addEdge(outputPort, inputPort);
        }
        else{
            alert("Invalid connection")
        }

        // clear the variables
        this._startPort = undefined; 
        this._endPort = undefined;
      }
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

      output_position =  FlowchartRenderUtils.get_port_position(this.fc.nodes[edge.output_address[0]], edge.output_address[1], "po");
      input_position = FlowchartRenderUtils.get_port_position(this.fc.nodes[edge.input_address[0]], edge.input_address[1], "pi");
      
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

  edgeClicked(): void{
    alert("Edge clicked");
  }


  updateNodeName($event): void{
    let name: string =  $event.target.value.trim(); 
    name = name.replace(/[^\w\[\]]/gi, '');

    if(name.length == 0){
      return;
    }

    // check no other node has the same name
    let flag: boolean = false;
    for(let i=0; i < this.fc.nodes.length; i++){
        if(this.fc.nodes[i].name == name){
          this.consoleService.addMessage("Node with this name already exists in the flowchart!");
          flag = true;
          break;
        }
    }

    if(!flag){
      this._selectedNode.name = name;
    }
    else{
      $event.target.value = this._selectedNode.name;
    }

  }

  saveNode(node: IGraphNode): void{
  }



  //
  //
  
  @ViewChild('fileInput') fileInput: ElementRef;
  openPicker(): void{
    let el: HTMLElement = this.fileInput.nativeElement as HTMLElement;
    el.click();
  }

  load_file(url ?:string): void{
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
    // this._fs.loadFile(url);
  }

  save(value: boolean): void{
    this._mb.save_file( this._fs.flowchart );
    // this._.saveFile(value);
    //this.layoutService.showConsole();
  }

  new_file(): void{
    this._mb.new_file();
  }


  new_flowchart(): void{
    this.active_node = undefined;
    this.fc = FlowchartUtils.new();

    this.push_node();
    this.push_flowchart();
  }

  publishSettings(): void{
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

