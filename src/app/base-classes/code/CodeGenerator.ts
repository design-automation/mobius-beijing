import { IModule } from './computation-modules/IModule'; 

import { ICodeGenerator } from "./ICodeGenerator";

import { IFlowchart } from "../flowchart/FlowchartModule";
import { IGraphNode } from "../node/NodeModule";
import { IProcedure } from "../procedure/ProcedureModule";
import { InputPort, OutputPort } from "../port/PortModule";

export abstract class CodeGenerator implements ICodeGenerator{

	private _language: string; 
	private _modules: IModule[];

	constructor(language: string){  this._language = language; };

	setModules(modules: IModule[]){  this._modules = modules; };

	getLanguage(): string{  return this._language; };

	get_code_display(flowchart: IFlowchart) :string{ throw Error("Not Implemented: CodeGenerator") };
	get_code_node_def(node: IGraphNode): string{ throw Error("Not Implemented: CodeGenerator") };
	get_code_function_call(node: IGraphNode, params?: any): string{ throw Error("Not Implemented: CodeGenerator") };
	get_code_node(node: IGraphNode, prodArr?: number, withoutFnOutput?: boolean): string{ throw Error("Not Implemented: CodeGenerator") };
	get_code_node_io(node: IGraphNode, output_idx: number): string{ throw Error("Not Implemented: CodeGenerator") };
	get_code_connection_line(input_node: IGraphNode, input_port: number, output_node: IGraphNode, output_port: number): string{ throw Error("Not Implemented: CodeGenerator") };
	get_code_procedure(procedure: IProcedure): string{ throw Error("Not Implemented: CodeGenerator") };
	get_code_port_input(port: InputPort): string{ throw Error("Not Implemented: CodeGenerator") };
	get_code_port_output(port: OutputPort): string{ throw Error("Not Implemented: CodeGenerator") };
	execute_node(node: IGraphNode, params: any, Modules: IModule, print: Function, globals?: any): any{ throw Error("Not Implemented: CodeGenerator") };
}
