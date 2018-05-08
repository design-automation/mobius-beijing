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

	setSavedTime(date: Date): void;
	getSavedTime(): Date;

	// gets the author of the flowchart
	getAuthor(): string; 
	getSummary(): string;

	globals();
	globals(arr);

	editable();
	editable(val);

	// icodegenerator

	// get / set
	addNode(node?: IGraphNode): number;
	addEdge(outputAddress: number[], inputAddress: number[]): number;
	deleteNode(nodeIndex: number): number;
	deleteEdge(edgeIndex: number): number;
	deleteEdges(edgeIndexArr: number[]): void;

	deletePort(type: string, portIndex: number, nodeIndex: number): void;
	disconnectPort(type: string, portIndex: number, nodeIndex: number);
	disconnectNode(nodeIndex: number);

	disconnectEdgesWithNode(nodeIndex: number);
	disconnectEdgesWithPortIndex(nodeIndex: number, portIndex: number, type: string);

	getNodes(): IGraphNode[];
	getEdges(): IEdge[];
	getNodeByIndex(index: number): IGraphNode;
	getEdgeByIndex(index: number): IEdge;

	getNodeOrder(): number[];


	//reset 
	reset(): void;

	// output related
	execute(code_generator: ICodeGenerator, moduleSet: IModule[], print: Function): boolean;
	

	// read / write
	save(): void;
	readFromJSON(file: string): void;

};