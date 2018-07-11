import {ICodeGenerator} from "../code/CodeModule";
import {InputPort, OutputPort} from "../port/PortModule";
import {IProcedure} from "../procedure/ProcedureModule";

export interface IGraphNode{

	position: number[];
	name: string;
	id: string;
	type: string;
	version: number;

	inputs: InputPort[];
	outputs: OutputPort[];
	procedure: IProcedure[];
	children: IProcedure[];
	active_procedure: IProcedure;

	enabled: boolean;
	hasExecuted: boolean;
	hasError: boolean;
	time_taken: number;

	update_properties(data: any);
	reset();
}