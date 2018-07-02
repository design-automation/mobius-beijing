//
// A flowchart is a collection of graph-nodes. A flowchart maintains the information about which nodes present, 
// how the nodes are connected,
// and is responsible for the execution of the nodes in the correct order.
//
// The execution of the flowchart is dependent on the code-generator provided to it.
//
// The code generated will be dependent on the code-generator being used by the flowchart-service
// 
//
import {IGraphNode, IEdge} from '../node/NodeModule';
import {ICodeGenerator}  from '../code/CodeModule';
import {IModule} from "../code/CodeModule";


export interface IFlowchart{

	name: string;
	description: string;
	selectedNode: string;

	nodes: IGraphNode[];
	edges: IEdge[];
	
	setSavedTime(date: Date): void;
	getSavedTime(): Date;

	// gets the author of the flowchart
	getAuthor(): string; 
	getSummary(): string;

	globals;
	editable;
};