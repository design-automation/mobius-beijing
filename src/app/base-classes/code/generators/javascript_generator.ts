import { CodeGenerator } from '../CodeGenerator';
import { IModule } from "../CodeModule";
 
import { IFlowchart } from "../../flowchart/FlowchartModule";
import { IGraphNode, IEdge } from "../../node/NodeModule";
import { IProcedure, ProcedureTypes, IComponent } from "../../procedure/ProcedureModule";
import { InputPort, OutputPort } from "../../port/PortModule";

import * as ts from "typescript";

export class CodeGeneratorJS extends CodeGenerator{

		constructor(){ 	super("js");	}

		//
		//	gets the display code for the flowchart
		//
		display_code(flow: IFlowchart){

			let fn_calls :string[]= [];
			let code_defs: string[] = [];
			let connector_lines: any = [];
			let code_block: string = "";

			let nodeOrder: number[] = flow.getNodeOrder();
			let all_nodes: IGraphNode[] = flow.getNodes();
			let all_edges: IEdge[] = flow.getEdges();

			// connector lines
			for(let c=0; c < all_edges.length; c++){

				let edge: IEdge = all_edges[c];
				let input_node: IGraphNode = flow.getNodeByIndex(edge.input_address[0]);
				let output_node: IGraphNode = flow.getNodeByIndex(edge.output_address[0]);



				// create line assigning values
				let code = this.generateConnectionLine(input_node, edge.input_address[1], 
														output_node, edge.output_address[1]);

				if(connector_lines[edge.input_address[0]] == undefined){
					connector_lines[edge.input_address[0]] = [];
				} 

				connector_lines[edge.input_address[0]].push(code);
			}

			// get all the codes of the different functions and the function calls 
			
			for(let c=0; c < nodeOrder.length; c++){
				// check inputs connected to outputs
				var nodeIndex = nodeOrder[c];
				var node = all_nodes[nodeIndex];
				code_defs.push(this.getNodeCode(node, undefined, true));

				if(connector_lines[nodeIndex] !== undefined){
					fn_calls.push(connector_lines[nodeIndex].join("\n"));
				}

				fn_calls.push( this.getFunctionCall(node) );
			}

			code_block = code_defs.join(";\n\n") + "\n" + fn_calls.join("\n");

			// check if code works by uncommenting this line
			// eval(code_block);
			
			return code_block;
		}


		//
		//
		//
		getFunctionCall(node: IGraphNode, params?: any, executionCode?: boolean): string{
			let fn_call: string = "";
			let param_values: string[] = [];

			let inputs = node.inputs;
			for(let i=0; i < inputs.length; i++ ){
				if(inputs[i].isConnected() == true){
					let input_name:string = inputs[i].name;
					if( params ){

						if( executionCode == true){
							param_values.push( "params." + input_name );
						}
						else{
							let p =  params[ input_name ];
							param_values.push( p );
						}
					}
					else{
						param_values.push( input_name );
					}
				}
				else{
					let val = inputs[i].value;
					param_values.push(val);
				}
			}

			param_values = param_values.map(function(p){
				if(p === undefined){
					return "undefined";
				}
				else{
					return p;
				}
			});

			// make function call and assign to variable of same name
			fn_call = "let " + node.name +  "=" + node.name + node.getVersion() + "( " + param_values.join(", ") + " );" ;

			if(node.enabled){
				fn_call = "/* " + fn_call + " */";
			}
			
			return fn_call;
		}

		getDefinition(node: IGraphNode): string{
			let fn_def: string = "";

			let params :string[] = [];
			let inputs = node.inputs;
			for(let i=0; i < inputs.length; i++ ){
				params.push(inputs[i].name);
			}

			// make function
			fn_def += "function " + node.name + node.getVersion() + "( " + params.join(", ") + " )() \n" ;
			
			return fn_def;
		}

		getNodeCode(node: IGraphNode, prodArr?: number, withoutFnOutput?: boolean): string{ 	
			let nodeVars: string[] = [];
			let fn_code :string = "";

			// add initializations
			// get params
			let params :string[] = [];
			let initializations :string[] = [];
			let inputs :InputPort[] = node.inputs;
			for(let i=0; i < inputs.length; i++ ){

				let inp = inputs[i];
				nodeVars.push(inp.name);

				if( 1/*inp.isConnected() == true*/ ){
					params.push(inp.name);
				}
				
				let input_port_code: string = this.generateInputPortCode(inp);
				if(input_port_code !== ""){
					//initializations.push( input_port_code );
				}

			}

			// make function
			fn_code += "function " + node.name + node.getVersion() + "( " + params.join(", ") + " ) { \n" ;
			fn_code += ( initializations.length > 0 ? initializations.join(";\n") + ";\n" : "" );
			
			// add outputs 
			let results :string[]= [], opInits :string[] = [];
			let outputs : OutputPort[] = node.outputs;
			for( let o=0; o < outputs.length; o++ ){
				let oname = outputs[o].name; 
				nodeVars.push(oname);

				results.push( oname + " : " + oname);

				if(outputs[o].isFunction() && withoutFnOutput){
					// do nothing
				}
				else{
					opInits.push( this.generateOutputPortCode(outputs[o]) )
				}

			}
			
			// add initialization for outputs
			fn_code += ( opInits.length > 0 ? "\n" + opInits.join(";\n") + ";\n" : ""); 

			// add procedure
			for( let line=0; line <  node.procedure.length; line ++ ){
				let procedure: IProcedure = node.procedure[line];

				// if procedure is disabled - skip
				if(!procedure.enabled){
					continue;
				}

				// if(prodArr)	fn_code += "\n" + "prodArr.push(" + procedure["id"] + ")";
				fn_code += "\n" +  this.generateProcedureCode(procedure, nodeVars, undefined, prodArr); 

			}

			// add return object
			fn_code += "\n" + "return " + " { " + results.join(", ") + " } " + ";";

			// ending
			fn_code += "\n }\n"

			return fn_code;
		}

		getNodeOutputCode(node: IGraphNode, output_idx: number): string{
			return node.name + "." + node.getOutputByIndex(output_idx).name; 
		}

		generateConnectionLine(destination_node: IGraphNode, destination_port: number, source_node: IGraphNode, source_port: number): string{

			let code :string = "let " + destination_node.getInputByIndex(destination_port).name + "=" + this.getNodeOutputCode(source_node, source_port) + ";";

			if(destination_node.enabled || source_node.enabled){
				code = "/* " + code + " */";
			}

			return code;
		}

		static existsInNodeVars(nodeVars: string[], name: string): boolean{

			let var_name: string = name;

			// check if name might be an array index
			let reg = new RegExp(/(\w*)(\[\w*\])/g)
			let result = reg.exec(name);

			if(result){
				var_name = result[1];
				// console.log(var_name, nodeVars);
			}
			else{
				// do nothing
			}

			return (nodeVars.indexOf( var_name ) > -1);
		}

		generateProcedureCode(procedure: IProcedure, nodeVars: string[]=[], prodFn ?: any, prodArr?: number){

			// change based on type
			let code: string; 
			let prod_type = procedure.getType();

			if(prodFn == undefined){
			 	prodFn = this.generateProcedureCode;
			}

			if(prod_type == ProcedureTypes.Data || prod_type == ProcedureTypes.Function){
				let init: string;

				if( CodeGeneratorJS.existsInNodeVars(nodeVars, procedure.getLeftComponent().expression) == false ){
					init = "let ";
					nodeVars.push( procedure.getLeftComponent().expression );
				}
				else{
					init = "";
				}

				code =  init + procedure.getLeftComponent().expression + " = " + procedure.getRightComponent().expression + ";";

				if(procedure.print){
					code = code + "\n" + "__MOBIUS_PRINT__(" + "\'" + procedure.getLeftComponent().expression + "\', " + procedure.getLeftComponent().expression + ");\n";
				}
			}
			else if(prod_type == ProcedureTypes.LoopContinue || prod_type == ProcedureTypes.LoopBreak){
				code = procedure.getLeftComponent().expression + ";";
			}
			else if(prod_type == ProcedureTypes.Action){
				let paramList :string[]= [];
				let params  = procedure.getRightComponent().params;
				for( let p=0; p < params.length; p++){
					let param = params[p];
					if(param.value !== undefined){
						paramList.push(param.value)
					}
					else{
						paramList.push(param.type)
					}
				}

				let right :IComponent = procedure.getRightComponent();

				let init: string;
				if( CodeGeneratorJS.existsInNodeVars(nodeVars, procedure.getLeftComponent().expression) == false ){
					init = "let ";
					nodeVars.push( procedure.getLeftComponent().expression );
				}
				else{
					init = "";
				}


				code = init + procedure.getLeftComponent().expression 
						+ " = " 
						+ "__MOBIUS_MODULES__."
						+ right.module.trim()
						+ "." + right.fn_name + "( " + paramList.join(",") + " );\n";

				if(procedure.print){
					code = code + "\n" + "__MOBIUS_PRINT__(" + "\'" + procedure.getLeftComponent().expression + "\', " + procedure.getLeftComponent().expression + ");\n";
				}

			}
			else if( procedure.hasChildren ){
				let codeArr = [];

				// add statement
				let statement: string = "";
				if(prod_type == ProcedureTypes.IfElseControl){
					statement = "// if-else";
				}
				else if(prod_type == ProcedureTypes.IfControl){
					statement = "if (" + procedure.getLeftComponent().expression + "){"
				}
				else if(prod_type == ProcedureTypes.ElseControl){
					statement = "else{";
					code = "prodArr = (" + procedure["id"] + ");\n" + code; 
				}
				else if(prod_type == ProcedureTypes.ForLoopControl){
					statement = "for ( let " + procedure.getLeftComponent().expression + " of " + procedure.getRightComponent().expression + "){"
					
					if( CodeGeneratorJS.existsInNodeVars(nodeVars, procedure.getLeftComponent().expression) == false ){
						nodeVars.push( procedure.getLeftComponent().expression );
					}
				
				}
				codeArr.push(statement);


				// add children
				// children will have nodeVars from parents 
				// but parents should have childVars
				let childVars = nodeVars.map(function(s){ return s; });
				procedure.getChildren().map(function(child){ 
					if(!child.enabled){
						codeArr.push(prodFn(child, childVars, prodFn, prodArr));
					}
				});

				// add ending
				if (prod_type !== ProcedureTypes.IfElseControl) codeArr.push("}\n")
				code = codeArr.join("\n");
			}

			// add procedure id to track failing
			if(prodArr && prod_type != ProcedureTypes.ElseControl){ 
				code = "prodArr = (" + procedure["id"] + ");\n" + code; 
			};

			return code;
		}


		//
		//	required for code generation
		//
		generateInputPortCode(port: InputPort): string{
			if( port.isConnected() == true ) 
				return "";

			return "let " + port.name + " = " + port.value; 
		}

		generateOutputPortCode(port: OutputPort): string{

			let prepend: string = "let ";

			if(port.isFunction()){
				prepend = "const ";
			}

			return prepend + port.name + " = " + port.getDefaultValue(); 
		}

		executeNode(node: IGraphNode, params: any, 
							__Mobius__Modules__: IModule[], 
							print: Function, globals?: any): any{

			//let prodArr: number[] = [];
			let prodArr: number = 1;

			window["__MOBIUS_MODULES__"] = __Mobius__Modules__;
			window["__MOBIUS_PRINT__"] = print;


			let str: string = "" //"(function(){";

			if(globals){
				for(let g=0; g < globals.length; g++){
					str += "const " + globals[g].name  + " =" + globals[g].value + ";\n";
	 			}
			}

			str +=	this.getNodeCode(node, prodArr) + "\n" + 
					this.getFunctionCall(node, [], true) + "\n" + 
					"return " + node.name + ";" 
					//"})();";

			let result: any;

			try{
				//console.log("script execution started: ", str.length);
				// result =  Function('return ' + str )(); 
				//console.log(str);
				result = (new Function('params', str))(params);
				//result = eval(str);
				//console.log("script execution finsihed");
			}
			catch(ex){

				console.log(`Execution Error: ${ex}`)
				node.hasError();

				// Unexpected Identifier
				// Unexpected token
				let prodWithError: number = prodArr;//.pop(); 

				let markError = function(prod: IProcedure, id: number){
					if(prod["id"] && id && prod["id"] == id){
						prod.setError(true);
					}

					if(prod.hasChildren){
						prod.children.map(function(p){
							markError(p, id);
						});
					}

				}
				
				if(prodWithError){
					node.getProcedure().map(function(prod: IProcedure){

						if(prod["id"] == prodWithError){
							prod.setError(true);
						}

						if(prod.hasChildren){
							prod.children.map(function(p){
								markError(p, prodWithError);
							})
						}

					});
				}

				let error: Error;
				if(ex.toString().indexOf("Unexpected Identifier") > -1){
					error = new Error("Unexpected Identifier error. Did you declare everything? Check that your strings are enclosed in quotes (\")");
				}
				else if(ex.toString().indexOf("Unexpected token") > -1){
					error = new Error("Unexpected token error. Check for stray spaces or reserved keywords?");
				}
				else{
				 	error = new Error(ex);
				}
				throw error;
			}
			

			prodArr = null; 
			print = null; 
			delete window["__MOBIUS_MODULES__"];
			delete window["__MOBIUS_PRINT__"];


			return result;//result;// return result of the node
		}

};