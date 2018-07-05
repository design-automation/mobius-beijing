import { IFlowchart } from './IFlowchart';
import { Flowchart } from './Flowchart';
import { FlowchartConnectionUtils } from './FlowchartConnectionUtils';

import { IGraphNode, IEdge, GraphNode, NodeUtils } from '../node/NodeModule';
import { ICodeGenerator, IModule } from '../code/CodeModule';
import { InputPort, PortTypes } from '../port/PortModule';

export class FlowchartUtils{	

	public static new(): IFlowchart{ return new Flowchart("default"); }


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
		let new_node = new GraphNode();
		new_node.name = FlowchartUtils.get_new_node_name(flowchart, "node");
		NodeUtils.add_port(new_node, PortTypes.Input); 
		NodeUtils.add_port(new_node, PortTypes.Output);

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
		
		
	};


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


	public static add_edge(flowchart: IFlowchart, outputAddress: number[], inputAddress: number[]): IFlowchart{

		if(outputAddress.length !== 2 || inputAddress.length !== 2){
			throw Error("Invalid arguments for edge");
		}

		let oNode = flowchart.nodes[outputAddress[0]];
     	let iNode = flowchart.nodes[inputAddress[0]];

     	// dont remove previous edges for outputs
		let output = oNode.outputs[outputAddress[1]];
		let input = iNode.inputs[inputAddress[1]];

      	if (input.isConnected){
	        FlowchartUtils.delete_edges(flowchart, 
	        							FlowchartUtils.disconnect_edges_with_port_idx(flowchart, 
	        							inputAddress[0], inputAddress[1], "input"));
	    }

		if( !flowchart.nodes[outputAddress[0]].enabled ||  !flowchart.nodes[inputAddress[0]].enabled ){
			console.warn("Cannot connect to disabled nodes");
		}
		else{
			let edge: IEdge = { output_address: outputAddress, input_address: inputAddress };

			input.value = {port: outputAddress};
		    output.isConnected = true;
		    input.isConnected = true;
			
			if(output.isFunction()){
        		input.setIsFunction();
        		input.setFnValue( oNode );
      		}

			// todo: check for valid input/output addresses and port address
			flowchart.edges.push(edge);
		}

		return flowchart;
	};

  	public static disconnect_port(flowchart: IFlowchart, type: string, portIndex: number, nodeIndex: number): IFlowchart{
  		let edges = flowchart.edges;

	    /// disconnect the edges related to this port
	    let edgesArr: number[] = FlowchartUtils.disconnect_edges_with_port_idx(flowchart, nodeIndex, portIndex, type); 
	    FlowchartUtils.delete_edges(flowchart, edgesArr);

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

	    return flowchart;
  	}

	public static disconnect_edges_with_port_idx(flowchart: IFlowchart, nodeIndex: number, portIndex: number, type: string): number[]{
      let splicedEdges: number[] = [];
      let edges = flowchart.edges;
      
      for(let e=0; e < edges.length; e++){
        let edge = edges[e];

        // if type == "input"
        if( type == "input" && edge.input_address[0] == nodeIndex && edge.input_address[1] == portIndex ){
            let port = flowchart.nodes[edge.output_address[0]].outputs[edge.output_address[1]];
            port.isConnected = false;
            port.value = undefined;
            splicedEdges.push(e);
        }
        else if( type == "output" && edge.output_address[0] == nodeIndex && edge.output_address[1] == portIndex ){
            let port = flowchart.nodes[edge.input_address[0]].inputs[edge.input_address[1]];
            port.isConnected = false;
            port.value = undefined;
            splicedEdges.push(e);
        }
      }

      return splicedEdges;
  	}

	public static delete_port(flowchart: IFlowchart, type: string, portIndex: number, nodeIndex: number): void{
	    FlowchartUtils.disconnect_port(flowchart, type, portIndex, nodeIndex);
		NodeUtils.delete_port_by_index(flowchart.nodes[nodeIndex], type, portIndex)
	}

	//todo: provide a more efficient sort
	//	Returns an ordering of the node IDs in order or execution
	//
	public static get_node_order(flowchart: IFlowchart): number[]{

		let n_map = [];

		n_map = flowchart.nodes.map(function(node, index){
			return {prevArr: [], nextArr: [], id: index};
		});

		for(let c=0; c < flowchart.edges.length; c++){
			let edge: IEdge = flowchart.edges[c];
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
	public static reset(flowchart: IFlowchart): void{
		for(let n=0; n < flowchart.nodes.length; n++){
			let node: IGraphNode = flowchart.nodes[n];
			node.reset();

			if(!node.enabled){
				FlowchartConnectionUtils.disconnect_node(flowchart, n);
			}
		}
	}

	public static update_dependent_inputs(flowchart: IFlowchart, node: IGraphNode, originalRank: number): void{

		let selectedEdges: IEdge[] = flowchart.edges.filter(function(edge){
			return edge.output_address[0] == originalRank;
		});

		for( let e=0;  e < selectedEdges.length; e++ ){

			let edge: IEdge = selectedEdges[e];
			let inputNode: IGraphNode = flowchart.nodes[edge.input_address[0]];

			// set computed value of port
			// should this be from within the node?
			let outputPort = node.outputs[edge.output_address[1]];
			let inputPort = inputNode.inputs[edge.input_address[1]];

			let outVal = outputPort.getValue();
			if(outVal && outVal.constructor.name == "Model"){
				console.error("Shouldn't be here")
				// let modelData: string = outVal.toJSON();
				// let model = new gs.Model(JSON.parse(modelData));
				// inputPort.setComputedValue( model );
			}
			else{
				inputPort.value = JSON.parse(JSON.stringify(outVal));
			}

		}
	}

	//
	//	executes the flowchart
	//
	public static execute(flowchart: IFlowchart, code_generator: ICodeGenerator, modules: IModule[], print: Function) :any{

		// set all nodes to status not executed
		// future: cache results and set status based on changes
		FlowchartUtils.reset(flowchart);

		let gld = [];
		for(let i=0; i < flowchart.globals.length; i++){
			let prop = flowchart.globals[i].getName();
			let value = flowchart.globals[i].getValue();
			gld.push({name: prop, value: value});
		}

		// sort nodes 
		let all_nodes = flowchart.nodes;
		let sortOrder: number[] = FlowchartUtils.get_node_order(flowchart);

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
					if( !node.enabled ){
						// do nothing
						executed.push(index);
					}
					else{

						let flag = true;
						let inputs = node.inputs;
						for(let i=0; i < inputs.length; i++){
							let inp = inputs[i];

							if(inp.value && inp.value["port"] && !inp.isFunction()){
								flag = false;
								break;
							}
						}

						if(flag){
							let time1 = (new Date()).getTime();
							NodeUtils.execute_node(node, code_generator, modules, print, gld);
							FlowchartUtils.update_dependent_inputs(flowchart, node, index); 
							executed.push(index);
							let time2 = (new Date()).getTime();
							let time_taken = (time2 - time1)/1000;
							console.log(`${node.name} executed in ${time_taken}s`);
						}

					}
				}
			} 
		}

		return true;
	}


	public static save(): string{  throw Error("Not implemented"); }

	public static read_from_json(filename: string): void{ /*TODO*/	}

}
