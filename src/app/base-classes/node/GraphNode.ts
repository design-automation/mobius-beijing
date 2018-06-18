import {IdGenerator} from '../misc/GUID';

import {IProcedure, ProcedureFactory, ProcedureTypes} from "../procedure/ProcedureModule";
import {InputPort, OutputPort, InputPortTypes} from "../port/PortModule";
import {ICodeGenerator, IModule} from "../code/CodeModule";

import {IGraphNode} from './IGraphNode';

export class GraphNode implements IGraphNode{

	private portCounter: number = 0;
	private inputPortCounter: number = 0;
	private outputPortCounter: number = 0;

	private _name: string;
	private _id: string; 
	private _version: number = 1; 
	private _enabled: boolean; 

	private _type: string = undefined;

	private _inputs: InputPort[] = [];
	private _outputs: OutputPort[] = [];
	private _procedure: IProcedure[] = [];

	private _hasExecuted: boolean = false;
	private _isDisabled: boolean = false; 
	public _hasError: boolean = false;


	private _position: any;

	private _dependencies: any = [];
	private _dependencyNodes: number[] = [];


	public position: number[] = [0,0];

	constructor(name: string, type?: string){
		this._id = IdGenerator.getId();
		this._name = name;
		this._type = type;
	}


	get name(): string{
		return this._name;
	}

	set name(value: string){
		this._name = value;
	}

	get id(): string{
		return this._id;
	}

	set id(uuid: string) {
		this._id = uuid;
	}

	get inputs(): InputPort[]{
		return this._inputs;
	}

	get outputs(): OutputPort[]{
		return this._outputs;
	}

	get enabled(): boolean{
		return this._enabled;
	}

	set enabled(value: boolean){
		this._enabled = value;
	}
	//	
	//
	//
	getName(): string{ 
		return this._name; 
	};

	setName(name: string): void{
		this._name = name; 
	}

	getId(): string { 
		return this._id; 
	};

	getVersion(): number{
		return this._version;
	}

	
	getType(): string{
		return this._type;
	}

	overwrite(node: IGraphNode): number{
		this._inputs = node.getInputs(); 
		this._outputs = node.getOutputs();
		this._procedure = node.getProcedure();
		return this._version++;
	}

	saved(): void{
		this._type = this._id;
	}

	update(nodeData: IGraphNode, nodeMap?: any): void{

		if(nodeData["lib"] == undefined){
			// loading from file
			this._id = nodeData["_id"];
			this.position = nodeData["position"];
			this._name = nodeData["_name"];
		}
		else{
			// creating from library
			this.position = [0,0];
		}


		// map direct properties
		this.portCounter = nodeData["portCounter"];
		this.inputPortCounter = nodeData["inputPortCounter"];
		this.outputPortCounter = nodeData["outputPortCounter"];
		this._isDisabled = nodeData["_isDisabled"];


		// add inputs
		let inputs: InputPort[] = nodeData["_inputs"];
		for( let input_index in inputs ){
			let inp_data :InputPort = inputs[input_index];
			let input :InputPort = new InputPort(inp_data["_name"]);

			input.update(inp_data, "inp");
			this._inputs.push(input);
		}
			
		// add outputs
		let outputs: OutputPort[] = nodeData["_outputs"];
		for( let output_index in outputs ){
			let output_data: OutputPort = outputs[output_index];
			let output: OutputPort = new OutputPort(output_data["_name"]);

			output.update(output_data, "out");
			this._outputs.push(output);
		}

		// replace node function
		let self = this;
		let replace = function (prodD){
			let node_id = prodD["node"]["_id"];
			let actual_node = nodeMap[node_id];
			console.log("replace");
			if(actual_node){
				prodD["node"] = actual_node;
			}
			else{
				throw Error("Higher order not found");
			}

			let portId = prodD["port"]["_id"];
			for(let i=0; i < self._inputs.length; i++){
				if(self._inputs[i]["_id"] == portId){
					prodD["port"] = self._inputs[i]; 
				}
			}
		}
		function checkAndReplaceChildren(procedure){
			if(procedure["_type"] == "Function"){
				// update with the actual node
				replace(procedure);
			}
			else{
				if(procedure.children && procedure["children"].length){
					for(let i=0; i < procedure["children"].length; i++){
						let childData = procedure["children"][i];
						checkAndReplaceChildren(childData);
					}
				}
			}
		}
		
		// add procedure
		let procedureArr: IProcedure[] = nodeData["_procedure"];
		for( let prodIndex in procedureArr ){

			let prodD = procedureArr[prodIndex];
			let procedure: IProcedure;
			
			checkAndReplaceChildren(prodD);				
			procedure = ProcedureFactory.getProcedureFromData(prodD, undefined);

			this._procedure.push(procedure);
		}

	}

	removeType(): void{
		this._type = undefined;
	}

	//
	//
	//
	addInput(name?: string): number{

		let default_name = /*this._name + */"in" + this.inputPortCounter; 

		if( name !== undefined ){
			default_name = name;
		}

		let inp = new InputPort(default_name);
		this._inputs.push(inp);

		this.portCounter++;
		this.inputPortCounter++;
		this.removeType();
		
		return this._inputs.length;
	}

	addOutput(name?: string): number{ 

		let default_name = /*this._name +*/ "out" + this.outputPortCounter; 

		if(name !== undefined){
			default_name = name;
		}

		let oup = new OutputPort(default_name);
		this._outputs.push(oup);
		
		this.portCounter++;
		this.outputPortCounter++;
		this.removeType();
		
		return this._outputs.length; 
	}

	addFnOutput( code_generator: ICodeGenerator ): number{
		let index_output: number = this.addOutput(this.getName() + "_function");
		let fnOutput: OutputPort = this.getOutputByIndex(index_output - 1);

		fnOutput.setDefaultValue( this.getFunction(code_generator) );

		fnOutput.setIsFunction();

		return this._outputs.length; 
	}

	hasFnOutput(): boolean{
		return this._outputs.filter(function(o){
			return o.isFunction();
		}).length > 0;
	}

	deleteInput(input_port_index: number): number{
		this._inputs.splice(input_port_index, 1);
		this.removeType();
		//delete this._inputs[input_port_index];
		return this._inputs.length; 
	}

	deleteOutput(output_port_index: number): number{ 
		this._outputs.splice(output_port_index, 1);
		this.removeType();
		//delete this._outputs[output_port_index];
		return this._outputs.length; 
	}

	getInputs(): InputPort[]{
		return this._inputs;
	}

	getOutputs(): OutputPort[]{
		return this._outputs;
	}

	getInputByIndex(input_port_index: number): InputPort{
		return this._inputs[input_port_index];
	}

	getOutputByIndex(output_port_index: number): OutputPort{
		return this._outputs[output_port_index];
	}

	getProcedure(): IProcedure[]{
		return this._procedure;
	}

	addProcedure(prod: IProcedure): void{
		this.removeType();
		this._procedure.push(prod);
	}

	addProcedureAtPosition(prod: IProcedure, index: number): void{
		this.removeType();
		this._procedure.splice(index, 0, prod);
	}

	deleteProcedure(prod: IProcedure): void{
		this.removeType();
		this._procedure = this._procedure.filter(function(child: IProcedure){ 
			if(child === prod){
				return false; 
			}
			else{
				return true;
			}
		});
	}

	deleteProcedureAtPosition(index: number): void{
		this.removeType();
		this._procedure.splice(index, 1);
	}


	//
	//
	//
	isDisabled(): boolean{
		return this._isDisabled;
	}

	enable(): void{
		this._isDisabled = false; 
	}

	disable(): void{
		this._isDisabled = true;
	}


	hasExecuted(): boolean{
		return this._hasExecuted; 
	}

	reset(): boolean{
		this._hasExecuted = false;
		this._hasError = false;

		this._procedure.map(function(prod){
			prod.reset();
		});

		this._outputs.map(function(output){
			output.reset();
		});

		return (this._hasExecuted == false); 
	}

	hasError(): void{
		this._hasError = true; 
	}

	//
	//
	//
	execute(code_generator: ICodeGenerator, modules: IModule[], print: Function, globals?: any): void{

		let window_params: string[] = [];

		let params: any[] = [];
		let self = this;

		let live_data_downloads = 0;

		this.getInputs().map(function(i, index){ 

			// if any of the inputs is a web url, get data first
			if(i.getType() == InputPortTypes.URL){
				live_data_downloads++;
				let urlString: any = i.getOpts().url;
				fetch(urlString)
				.then((res) => res.text())
				.then((out) => {
					let val = out;

					try{
						val = JSON.parse(out);
					}
					catch(ex){

					}

					i.setComputedValue(val);
					// file processing
					/*let file_name: string = "MOBIUS_FILES_" + self._id + "I" + index;
					window[file_name] = i.getValue();
					params[i.getName()] = "window[" + file_name + "]";
					window_params.push("window[" + file_name + "]");
					i._executionAddr =  "window['" + file_name + "']";;*/

					live_data_downloads--;

					// when last of all data has downloaded
					if(live_data_downloads == 0){
						outputProcessing();
					}

				})
				.catch(err => { alert("Oops...Error fetching data from URL."); throw err; });
			}
			else if(i.isFunction()){
				let oNode: IGraphNode = i.getFnValue();
				let codeString: string = code_generator.getNodeCode(oNode);

				// converts string to functin
				let fn_def = Function("return " + codeString)();
				params[i.getName()] = fn_def;
			}
			else{
				params[i.getName()] = i.getValue(); 
			}

		});

		// this code runs only after live_data_downloads = 0;
	    function outputProcessing(){
			self.getOutputs().map(function(o){
				if(o.isFunction()){
					let node_code: string =  code_generator.getNodeCode(self, undefined, true);
					o.setDefaultValue( node_code );
				}
			});


			// use code generator to execute code
			let result: any  = code_generator.executeNode(self, params, modules, print, globals);

			// add results to self node
			for( let n=0;  n < self._outputs.length; n++ ){
				let output_port = self._outputs[n];
				output_port.setComputedValue(result[output_port.getName()]);
			}

			self._hasExecuted = true;

			// delete all files stored in window reference
			window_params.map(function(filename){
				delete window[filename];
			})

			//self.getInputs().map( i => i._executionAddr = undefined );



	    }


	    if(live_data_downloads == 0){
	    	outputProcessing();
	    }

	}

	getResult():any{
		let final_values :any = {};
		for(let o=0; o < this._outputs.length; o++ ){
			let output :OutputPort = this._outputs[o];
			final_values[output.getName()] = output.getValue();
		}

		return final_values;
	}


	getVariableList(): string[]{

		let varList: string[] = [];

		//push undefined
		varList.push("undefined");

		//push names of inputs and outputs
		this._inputs.map(function(inp){
			varList.push(inp.getName());
		});

		this._outputs.map(function(out){
			varList.push(out.getName());
		});

		// push names of left components in procedure
		this._procedure.map(function(prod){
			let type = prod.getType();
			if(type == ProcedureTypes.Data || type == ProcedureTypes.ForLoopControl || 
				type ==ProcedureTypes.Action){
				let var_name: string = prod.getLeftComponent().expression;
				if(var_name && var_name.length > 0){
					varList.push(var_name);
				};
			}
		});

		return varList;
	}

	getFunction(code_generator: ICodeGenerator): string{
		let node_code: string =  code_generator.getNodeCode(this);
		return node_code;
	}

	addFunctionToProcedure(code_generator: ICodeGenerator): void{
		let node_code: string = this.getFunction(code_generator);
	}
}
