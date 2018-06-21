//
//	Flowchart class 
//  Implement IFlowchart
//	
//
//

import {IFlowchart} from './IFlowchart';
import {IGraphNode, IEdge, GraphNode} from '../node/NodeModule';
import {ICodeGenerator, IModule} from '../code/CodeModule';
import {InputPort} from '../port/PortModule';

import * as gs from 'gs-json';

export class Flowchart implements IFlowchart{

	public name: string;
	public description: string;
	public selectedNode: string;

	private _author: string; 

	private _nodes: IGraphNode[] = [];
	private _edges: IEdge[] = [];

	private _sortOrder: number[];
	private _selected: number;

	private _lastSaved: Date;

	private _globals = [];
	private _visibleNode;

	private _editable;

	//
	//	constructor needs 2 arguments  - username and icodegenerator
	//
	constructor(username: string, data?: any){ 
		this._author = username; 
		this.name = String((new Date()).getTime()) + ".mob";
		this.description = "Lorem ipsum proident nisi dolor ut minim in in non consectetur ut ut.";
		this.selectedNode = undefined;
		this._globals = [];
		this._editable = true;

		if(data){
			this.name = data["name"];
			this.description = data["description"];
			this.selectedNode = data["selectedNode"];

			this._globals = data["_globals"].map(function(in_data){
				let inputPort = new InputPort(in_data["_name"]);
				inputPort.update(in_data);
				return inputPort;
			});
			this._editable = data["_editable"] == undefined ? true : data["_editable"];
		}
	};

	setSavedTime(date: Date){
		this._lastSaved = date;
	}

	getSavedTime(): Date{
		return this._lastSaved;
	}

	//	gets author of the flowchart
	getAuthor(): string{
		return this._author;
	}

	//	Summary of flowchart
	getSummary(): string{
		return "This is a flowchart, with " + this._nodes.length + " nodes, written by " + this._author;
	}

	get globals(): any{
		return this._globals;
	}

	set globals(arr: any){
		this._globals = arr;
	}

	set visibleNode(id: number){
		this._visibleNode = this._nodes[id];
	}

	get visibleNode(){
		return this._visibleNode;
	}

	set editable(value){
		this._editable = value;
	}

	get editable(): any{
		return this._editable;
	}

	get nodes(): IGraphNode[]{
		return this._nodes;
	}

	get edges(): IEdge[]{
		return this._edges;
	}

	set edges(edges: IEdge[]){
		this._edges = edges;
	}

	addEdge(outputAddress: number[], inputAddress: number[]): number{

		if(outputAddress.length !== 2 || inputAddress.length !== 2){
			console.log("inputAddress", inputAddress);
			console.log("outputAddress", outputAddress);
			throw Error("Invalid arguments for edge");
		}

		let oNode = this.getNodeByIndex(outputAddress[0]);
     	let iNode = this.getNodeByIndex(inputAddress[0]);

     	// dont remove previous edges for outputs
		let output = oNode.getOutputByIndex(outputAddress[1]);
		let input = iNode.getInputByIndex(inputAddress[1]);
		if( iNode.hasFnOutput() || ( oNode.hasFnOutput() && !output.isFunction() ) ){
          throw Error("Non-functional inputs/outputs of higher-order nodes cannot be connected");
      	}

      	if (input.isConnected()){
	        FlowchartUtils.delete_edges(this, this.disconnectEdgesWithPortIndex(inputAddress[0], inputAddress[1], "input"));
	    }

		if( this.getNodeByIndex(outputAddress[0]).isDisabled() ||  this.getNodeByIndex(inputAddress[0]).isDisabled() ){
			console.log("Cannot connect to disabled nodes");
		}
		else{
			let edge: IEdge = { output_address: outputAddress, input_address: inputAddress };

			input.setComputedValue({port: outputAddress});
		    output.connect();
		    input.connect();
			
			if(output.isFunction()){
        		input.setIsFunction();
        		input.setFnValue( oNode );
      		}

			// todo: check for valid input/output addresses and port address
			this._edges.push(edge);
		}

		return this._edges.length;
	};


	disconnectEdgesWithPortIndex(nodeIndex: number, portIndex: number, type: string): number[]{
      let splicedEdges: number[] = [];
      let edges = this.getEdges();
      
      for(let e=0; e < edges.length; e++){
        let edge = edges[e];

        // if type == "input"
        if( type == "input" && edge.input_address[0] == nodeIndex && edge.input_address[1] == portIndex ){
            let port = this.getNodeByIndex(edge.output_address[0]).getOutputByIndex(edge.output_address[1]);
            port.disconnect();
            port.setComputedValue(undefined);
            splicedEdges.push(e);
        }
        else if( type == "output" && edge.output_address[0] == nodeIndex && edge.output_address[1] == portIndex ){
            let port = this.getNodeByIndex(edge.input_address[0]).getInputByIndex(edge.input_address[1]);
            port.disconnect();
            port.setComputedValue(undefined);
            splicedEdges.push(e);
        }
      }

      return splicedEdges;
  	}

  	disconnectPort(type: string, portIndex: number, nodeIndex: number): void{
  		let edges = this._edges;

	    /// disconnect the edges related to this port
	    let edgesArr: number[] = this.disconnectEdgesWithPortIndex(nodeIndex, portIndex, type); 
	    FlowchartUtils.delete_edges(this, edgesArr);

	    /// update indices of edges
	    /// delete port
	    for(let e=0; e < edges.length; e++){

	        let input_node: number = edges[e].input_address[0];
	        let input_port: number = edges[e].input_address[1];

	        if(type == "input"){
	           let input_node: number = edges[e].input_address[0];
	           let input_port: number = edges[e].input_address[1];

	            if(input_node == nodeIndex && input_port >= portIndex){
	              edges[e].input_address[1] = edges[e].input_address[1] - 1;
	            }
	        }
	        else if(type == "output"){
	           let output_node: number = edges[e].output_address[0];
	           let output_port: number = edges[e].output_address[1];

	            if(output_node == nodeIndex && output_port >= portIndex){
	              edges[e].output_address[1] = edges[e].output_address[1] - 1;
	            }
	        }
	        else{
	           console.warn("reached 358");
	        }
	    }
  	}

	deletePort(type: string, portIndex: number, nodeIndex: number): void{
	    
	    this.disconnectPort(type, portIndex, nodeIndex);

		let _node = this.getNodeByIndex(nodeIndex);

		if(type == "input"){
			_node.deleteInput(portIndex);
		}
		else if(type == "output"){
			_node.deleteOutput(portIndex);
		}
		else{
			throw Error("Unknown port type");
		}

	}

	getNodes(): IGraphNode[]{ 
		return this._nodes;
	}

	getEdges(): IEdge[]{ 
		return this._edges;
	}

	//
	//	Get node by index in flowchart
	//	todo: fix
	//
	getNodeByIndex(index: number): IGraphNode{
		return this._nodes[index];
	}

	getEdgeByIndex(index: number): IEdge{
		return this._edges[index];
	}

	//todo: provide a more efficient sort
	//	Returns an ordering of the node IDs in order or execution
	//
	getNodeOrder(): number[]{

		let n_map = [];

		n_map = this._nodes.map(function(node, index){
			return {prevArr: [], nextArr: [], id: index};
		});

		for(let c=0; c < this._edges.length; c++){
			let edge: IEdge = this._edges[c];
			let out_nodeIndex = edge.output_address[0];
			let in_nodeIndex = edge.input_address[0]; 

			if(n_map[out_nodeIndex].nextArr.indexOf(in_nodeIndex) == -1){
				n_map[out_nodeIndex].nextArr.push(in_nodeIndex);
			}

			if(n_map[in_nodeIndex].prevArr.indexOf(out_nodeIndex) == -1){
				n_map[in_nodeIndex].prevArr.push(out_nodeIndex);
			}

		}

		let sortO = n_map[0].prevArr.concat([n_map[0].id]).concat(n_map[0].nextArr);
		for(let i=1; i < n_map.length; i++){

			let o = n_map[i];
			
			// if id of current node is not found in the sort array already 
			// push it into the array
			if(sortO.indexOf(o.id) == -1){
				sortO.push(o.id);
			}
			
			// find the index of the id of the current node
			let el_pos = sortO.indexOf(o.id);

			// if previous array length of this node is 0 and it is not already at the head of the array
			// add it to the beginning of the array
			if(o.prevArr.length == 0 && el_pos !== 0){
				sortO.splice(el_pos, 1);
				sortO.unshift(o.id);
			}

			o.prevArr.map(function(r){

				// find an element in the previous array in the sortO
				let index = sortO.indexOf(r);

				if(index == -1){
					// if not found, add it to the 
					sortO.splice(el_pos, 0,  r);
				}
				else{
					if(index > el_pos){
						sortO.splice(index, 1);
						sortO.splice(el_pos, 0, r);
					}
					else{
						// do nothing
					}
				}
				
			});

		}

		return sortO;
	}


	//
	//	clears all the cached results
	//
	reset(): void{
		for(let n=0; n < this._nodes.length; n++){
			let node: IGraphNode = this._nodes[n];
			node.reset();

			if(node.isDisabled()){
				FlowchartConnectionUtils.disconnect_node(this, n);
			}
		}
	}

	updateDependentInputs(node: IGraphNode, originalRank: number): void{

		let selectedEdges: IEdge[] = this.getEdges().filter(function(edge){
			return edge.output_address[0] == originalRank;
		});

		for( let e=0;  e < selectedEdges.length; e++ ){

			let edge: IEdge = selectedEdges[e];
			let inputNode: IGraphNode = this.getNodeByIndex(edge.input_address[0]);

			// set computed value of port
			// should this be from within the node?
			let outputPort = node.getOutputByIndex(edge.output_address[1]);
			let inputPort = inputNode.getInputByIndex(edge.input_address[1]);

			let outVal = outputPort.getValue();
			if(outVal && outVal.constructor.name == "Model"){
				let modelData: string = outVal.toJSON();
				let model = new gs.Model(JSON.parse(modelData));
				inputPort.setComputedValue( model );
			}
			else{
				inputPort.setComputedValue( JSON.parse(JSON.stringify(outVal)) );
			}

		}
	}

	//
	//	executes the flowchart
	//
	execute(code_generator: ICodeGenerator, modules: IModule[], print: Function) :any{

		// set all nodes to status not executed
		// future: cache results and set status based on changes
		this.reset();

		let gld = [];
		for(let i=0; i < this._globals.length; i++){
			let prop = this._globals[i].getName();
			let value = this._globals[i].getValue();
			gld.push({name: prop, value: value});
		}

		// sort nodes 
		let all_nodes = this.getNodes();
		let sortOrder: number[] = this.getNodeOrder();

		let executed = [];
		while(executed.length < all_nodes.length){
			for(let index=0; index < all_nodes.length; index++){

				let node = all_nodes[index];
				if(executed.indexOf(index) > -1){
					//do nothing
				}
				else{

					// check if all inputs have valid inputs
					// if yes, execute add to executed
					// if no, set flag to true 
					// check status of the node; don't rerun
					if( node.isDisabled() || node.hasFnOutput() ){
						// do nothing
						executed.push(index);
					}
					else{

						let flag = true;
						let inputs = node.getInputs();
						for(let i=0; i < inputs.length; i++){
							let inp = inputs[i];

							if(inp.getValue() && inp.getValue()["port"] && !inp.isFunction()){
								flag = false;
								break;
							}
						}

						if(flag){
							let time1 = (new Date()).getTime();
							node.execute(code_generator, modules, print, gld);
							this.updateDependentInputs(node, index); 
							executed.push(index);
							let time2 = (new Date()).getTime();
							let time_taken = (time2 - time1)/1000;
							console.log(`${node.name} executed in ${time_taken}s`);
						}

					}
				}
			} 
		}

		// execute each node
		// provide input to next 
		/*let timeStarted	:number = (new Date()).getTime();
		for( let nc=0; nc < sortOrder.length; nc++ ){

			let originalRank = sortOrder[nc];
			let node = all_nodes[originalRank];

			// check status of the node; don't rerun
			if( node.isDisabled() || node.hasFnOutput() ){
				continue;
			}

			console.log(`${node.getName()} executing...`);
			console.log(node);

			node.execute(code_generator, modules, print, gld);

			this.updateDependentInputs(node, originalRank); 

			//todo: print time taken
		}*/



		return true;
	}


	save(): string{
		throw Error("Not implemented");
		/*this.reset();
		//todo:
		console.log(CircularJSON.stringify(this));
		return CircularJSON.stringify(this);*/
	}

	readFromJSON(filename: string): void{
		// todo:
		// read the nodes and edges and add to the flowchart
	}

}



export class FlowchartUtils{

	public static new(): IFlowchart{
		return new Flowchart("default");
	}


	public static get_new_node_name(flowchart: IFlowchart, prefix?: string): string{
		let default_node_name: string = prefix + (flowchart.nodes.length + 1);
		return default_node_name;
	}

	public static get_node_idx(flowchart: IFlowchart, uuid: string): number{
		
		let nodes: IGraphNode[] = flowchart.nodes;
		let idx: number = undefined;
		for(let i=0; i< nodes.length; i++){
			if(nodes[i].id == uuid){
				idx = i;
				break;
			}
		}

		return idx;
	}


	public static add_node(flowchart: IFlowchart){
		let default_node_name: string = FlowchartUtils.get_new_node_name(flowchart, "node");
		let new_node = new GraphNode(default_node_name, undefined);
		new_node.addInput(); 
		new_node.addOutput();

		flowchart.nodes.push(new_node);

		return flowchart;
	}

	public static add_node_from_library(flowchart){
		// n_data = this._savedNodes[type];
		// let name:string = n_data["_name"]
		// new_node = new GraphNode(FlowchartUtils.get_new_node_name(flowchart, n_data["_id"]));
		// n_data["lib"] = true;
		// new_node.update(n_data);
	}

	public static add_node_from_data(flowchart, data){
		console.log("TODO: Add Node from Data");
	}


	public static delete_node(flowchart: IFlowchart, uuid: string): IFlowchart{

		// get node_index of the uuid
		let node_index: number = FlowchartUtils.get_node_idx(flowchart, uuid);
		if (node_index == undefined) throw Error("Node not found");

		// disconnect the node and set all port values to undefined
		FlowchartConnectionUtils.disconnect_node(flowchart, node_index);
		flowchart.nodes.splice(node_index, 1);


		/*compute redundant edges in the node and delete the edges
  		let redundant_edges = FlowchartConnectionUtils.edges_with_node(flowchart, node_index);
  		flowchart = FlowchartUtils.delete_edges(flowchart, redundant_edges);*/

  		// todo: clean this up!
  		for(let e=0; e < flowchart.edges.length; e++){
			let edge = flowchart.edges[e];

			let input_node = edge.input_address[0];
			let output_node = edge.output_address[0];

			if(input_node == node_index || output_node == node_index){
				FlowchartUtils.delete_edge(flowchart, e);
			}
			
			if(input_node > node_index){
				edge.input_address[0] = input_node - 1;
			}
			
			if(output_node > node_index){
				edge.output_address[0] = output_node - 1;
			}

		}

  		return flowchart;
	}

	public static delete_edge(flowchart: IFlowchart, edgeIdx: number): IFlowchart{
		return FlowchartUtils.delete_edges(flowchart, [edgeIdx]);
	}

	public static delete_edges(flowchart: IFlowchart, edgeIds: number[]): IFlowchart{

		flowchart.edges = flowchart.edges.filter(function(edge, index){
			return ( edgeIds.indexOf(index) == -1 );
		})

		return flowchart;
	}

}


export class FlowchartConnectionUtils{
	
	public static disconnect_node(flowchart: IFlowchart, idx: number): IFlowchart{
  		
		let node = flowchart.getNodeByIndex(idx);

  		node.inputs.map(function(input){
  			if(input.isConnected()){
	  			input.disconnect();
	  			input.setComputedValue(undefined);
  			}
  		});

  		node.outputs.map(function(output){
  			output.disconnect();
  			output.setComputedValue(undefined);
  		});

  		return flowchart;
  	}


  	public static edges_with_node(flowchart: IFlowchart, node_index: number){
		let linked_edges: number[] = [];
		let edges = flowchart.edges;

		for(let e=0; e < edges.length; e++){
			let edge = edges[e];
			if( edge.output_address[0] == node_index){
			    let port = flowchart.getNodeByIndex(edge.input_address[0]).getInputByIndex(edge.input_address[1]);
			    port.disconnect();
			    port.setComputedValue(undefined);
			    linked_edges.push(e);
			}
			else if(edge.input_address[0] == node_index){
			    let port = flowchart.getNodeByIndex(edge.output_address[0]).getOutputByIndex(edge.output_address[1]);
			    port.disconnect();
			    port.setComputedValue(undefined);
			    linked_edges.push(e);
			}
		}

		return linked_edges;
  	}
}

