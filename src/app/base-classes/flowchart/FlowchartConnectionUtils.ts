import {IFlowchart} from './IFlowchart';
import {Flowchart} from './Flowchart';
import {IGraphNode, IEdge, GraphNode} from '../node/NodeModule';
import {ICodeGenerator, IModule} from '../code/CodeModule';
import {InputPort} from '../port/PortModule';

export class FlowchartConnectionUtils{
	
	public static disconnect_node(flowchart: IFlowchart, idx: number): IFlowchart{
  		
		let node = flowchart.nodes[idx];

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
			    let port = flowchart.nodes[edge.input_address[0]].getInputByIndex(edge.input_address[1]);
			    port.disconnect();
			    port.setComputedValue(undefined);
			    linked_edges.push(e);
			}
			else if(edge.input_address[0] == node_index){
			    let port = flowchart.nodes[edge.output_address[0]].getOutputByIndex(edge.output_address[1]);
			    port.disconnect();
			    port.setComputedValue(undefined);
			    linked_edges.push(e);
			}
		}

		return linked_edges;
  	}
}

