//
//	A Code Generator works directly on a graph-node containing procedures to generate the corresponding code in a particular language
//  It may or may not use custom modules
//  A code generator uses each element of a flowchart to string together code
//
import { IFlowchart } from "../flowchart/FlowchartModule";
import { IGraphNode } from "../node/NodeModule";
import { IProcedure } from "../procedure/ProcedureModule";
import { InputPort, OutputPort } from "../port/PortModule";
import { IModule } from "./computation-modules/IModule";

export interface ICodeGenerator{
	getLanguage(): string;
	setModules(modules: IModule[]): void;

	get_code_display(flowchart: IFlowchart) :string;

	get_code_node_def(node: IGraphNode): string;
	get_code_function_call(node: IGraphNode, params?: any): string;

	get_code_node(node: IGraphNode, prodArr?: number, withoutFnOutput?: boolean): string;
	get_code_node_io(node: IGraphNode, output_idx: number): string;

	get_code_connection_line(input_node: IGraphNode, input_port: number, output_node: IGraphNode, output_port: number): string;
	get_code_procedure(procedure: IProcedure): string;

	get_code_port_input(port: InputPort): string;
	get_code_port_output(port: OutputPort): string;

	execute_node(node: IGraphNode, params: any, Modules: IModule, print: Function, globals?: any): any;
};