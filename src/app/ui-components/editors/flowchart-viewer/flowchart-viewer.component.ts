import { Component, 
         Output, EventEmitter,
         OnInit, OnDestroy, 
         ViewChild, ElementRef, 
         HostListener } from '@angular/core';
import { NgClass } from '@angular/common';

import { IFlowchart } from '../../../base-classes/flowchart/IFlowchart';
import { FlowchartUtils } from '../../../base-classes/flowchart/FlowchartUtils';
import { IGraphNode, IEdge, GraphNode, NodeUtils } from '../../../base-classes/node/NodeModule';
import { InputPort, OutputPort } from '../../../base-classes/port/PortModule';

import { FlowchartService } from '../../../global-services/flowchart.service';
import { ConsoleService } from '../../../global-services/console.service';
import { MobiusService } from '../../../global-services/mobius.service';
import { NodeLibraryService } from '../../../global-services/node-library.service';

abstract class  FlowchartRenderUtils{
  private static _portWidth: number = 15; 
  private static _margin: number = 10;  

  public static node_width(node: IGraphNode): number{
    let max = Math.max(node.inputs.length, node.outputs.length); 
    let width = FlowchartRenderUtils._margin*(max+1) + (max)*FlowchartRenderUtils._portWidth;
    return width;
  }

  public static port_dom_element(node: IGraphNode, portIndex: number, portType: string): any{
    let name: string = "n" + node.id + portType + portIndex;
    let el: any = document.getElementById(name);

    if(el == undefined) throw Error(`Element with ID ${name} not found`);
    else console.log(`Element with ID ${name} was found`)

    return el;
  }  

  public static get_port_position(node: IGraphNode, portIndex: number, portType: string): {x: number, y: number}{

    let x: number;
    let y: number;
    let port_size: number = 15;

    // let name: string = "n" + node.id + portType + portIndex;
    // let el: any = document.getElementById(name);

    let el: any = FlowchartRenderUtils.port_dom_element(node, portIndex, portType);

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

    console.log(node.name, portIndex, portType, {x: x, y: y});

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

  showLibrary: boolean = false;

  showDialog: {status: boolean, position: number[]} = {status: false, position: [0,0]};

  private subscriptions = [];
  private fc: IFlowchart;
  private active_node: IGraphNode;

  constructor(private _fs: FlowchartService, 
    private _mb: MobiusService,
    private $log: ConsoleService, 
    private _ns: NodeLibraryService){}

  ngOnInit(){
    this.subscriptions.push(this._fs.flowchart$.subscribe((fc) => { this.fc = fc; this.render_flowchart(); }));
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

  render_flowchart(){
    let fc = this.fc;
    if(fc){
      this.fc.nodes.map( (node) => node["width"] = FlowchartRenderUtils.node_width(node) );
      this.fc.edges.map( (edge) => {
        edge["inputPosition"] = FlowchartRenderUtils.get_port_position( this.fc.nodes[edge.input_address[0]], edge.input_address[1], "pi");
        edge["outputPosition"] = FlowchartRenderUtils.get_port_position(this.fc.nodes[edge.output_address[0]], edge.output_address[1], "po");
      })
    }

    this.$log.log("Flowchart was updated");
  }


  duplicate_node(): void{
    this._fs.flowchart.nodes.push(NodeUtils.copy_node(this.active_node));
    console.log(this._fs.flowchart.nodes.length);
  }

  // node utils
  delete_node(node_id: string): void{
    this._selectedNode = undefined; 
    if (this.active_node.id == node_id)   this._fs.push_node(undefined); 

    this.fc = FlowchartUtils.delete_node(this.fc, node_id);
  }

  save_node_to_library(): void{
      NodeLibraryService.save_library_node(this.active_node);
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
      this.render_flowchart();
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
  //  Node Draggin
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

    this.render_flowchart();
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

    this.render_flowchart();
  }

  //
  //  Port Dragging to created edges
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
            this.$log.log("Invalid connection")
        }

        // clear the variables
        this._startPort = undefined; 
        this._endPort = undefined;
      }

      this.render_flowchart(this._fs.flowchart);
  }



  getZoomStyle(): string{
    let value: string = "scale(" + this.zoom + ")";
    return value;
  }

  //
  // Edge drawing functions
  //
  getEdgePath(edge: IEdge): {}{

    let output_position, input_position;

    try{

      output_position =  FlowchartRenderUtils.get_port_position(this.fc.nodes[edge.output_address[0]], edge.output_address[1], "po");
      input_position = FlowchartRenderUtils.get_port_position(this.fc.nodes[edge.input_address[0]], edge.input_address[1], "pi");
      
      edge["inputPosition"] = input_position;
      edge["outputPosition"] = output_position;
      
    }
    catch(ex){

    }

    return edge;

  }


}

