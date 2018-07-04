import {Component, Injector, OnInit} from '@angular/core';
import {FlowchartService} from '../../../global-services/flowchart.service';
import {LayoutService} from '../../../global-services/layout.service';
import {ModuleService} from '../../../global-services/module.service';

import {ModuleUtils} from "../../../base-classes/code/CodeModule";
import {IProcedure, ProcedureFactory, ProcedureTypes} from '../../../base-classes/procedure/ProcedureModule';
import {NodeUtils} from '../../../base-classes/node/NodeUtils';
import {IGraphNode} from '../../../base-classes/node/NodeModule';
import {PortTypes} from '../../../base-classes/port/PortModule';


@Component({
  selector: 'app-modulebox',
  templateUrl: './modulebox.component.html',
  styleUrls: ['./modulebox.component.scss']
})
export class ModuleboxComponent implements OnInit{

  	readonly procedureTypes: ProcedureTypes[] = [
		ProcedureTypes.Data, 
		ProcedureTypes.ForLoopControl,
		ProcedureTypes.WhileControl,
		ProcedureTypes.IfControl,
		ProcedureTypes.ElseControl, 
		ProcedureTypes.ElseIfControl,
		ProcedureTypes.LoopBreak, 
		ProcedureTypes.LoopContinue
  	];

  	private subscriptions = [];
  	private active_node: IGraphNode;
  	_moduleList = [];
  	_category: string[] = [];

  	constructor(private _fs: FlowchartService, 
  				private _ms: ModuleService,
  				private layoutService: LayoutService) { }

	ngOnInit(){
		
		this._moduleList = [];

		let modules = this._ms.modules;
		for(let mod=0; mod < modules.length; mod++){
			let user_module = modules[mod];
			this._category.push(user_module["_name"]);
			this._moduleList[user_module["_name"]] = this._moduleList.concat(ModuleUtils.getFunctions(user_module));
		}

		this.subscriptions.push(this._fs.node$.subscribe( (node) => this.active_node = node ));
	}

	ngOnDestroy(){
		this.subscriptions.map(function(s){
	  		s.unsubscribe();
		})
	}

	//
	addActionProcedure(fn: {name: string, params: string[], module: string}){

		if(this.active_node == undefined){
			alert("Oops.. No Node Selected");
			return;
		}

		let prod_data :  {result: string, module: string, function: any, params: string[]} = 
			{result: "", module: fn.module, function: fn.name, params: fn.params};
		let prod:IProcedure = ProcedureFactory.getProcedure( ProcedureTypes.Action, prod_data);
		this.active_node = NodeUtils.add_procedure(this.active_node, prod);
	}


	getStringForProcedureType(type: ProcedureTypes): string{

		let value:string = "";

		switch(type){

			case ProcedureTypes.Data: 
				value = "Variable";
				break;

			case ProcedureTypes.Action: 
				value = "Function";
				break;

			case ProcedureTypes.IfControl: 
				value = "If";
				break;

			case ProcedureTypes.ElseControl: 
				value = "Else";
				break;

			case ProcedureTypes.ElseIfControl: 
				value = "Else-If";
				break;

			case ProcedureTypes.ForLoopControl: 
				value = "For-loop";
				break;

			case ProcedureTypes.WhileControl: 
				value = "While-loop";
				break;

			case ProcedureTypes.LoopBreak: 
				value = "Break";
				break;

			case ProcedureTypes.LoopContinue: 
				value = "Continue";
				break;

		}

		return value;
	}

	addProcedure($event, type: ProcedureTypes): void{

		$event.stopPropagation();
		
		let prod:IProcedure;
		let prod_data; 

/*		switch(type){

			case ProcedureTypes.Data: 
				let default_variable_name: string = "var" + this.active_node.procedure.length;
				prod_data = {result: default_variable_name, value: "undefined"};
				prod = ProcedureFactory.getProcedure( ProcedureTypes.Data, prod_data );
				break;

			case ProcedureTypes.Action: 
				// do nothing
				break;

			case ProcedureTypes.IfControl: 
				prod = ProcedureFactory.getProcedure( ProcedureTypes.IfElseControl );
				break;

			case ProcedureTypes.ElseControl: 
				prod = ProcedureFactory.getProcedure( ProcedureTypes.ElseControl );
				break;

			case ProcedureTypes.ElseIfControl: 
				prod = ProcedureFactory.getProcedure( ProcedureTypes.ElseIfControl );
				break;

			case ProcedureTypes.ForLoopControl: 
				prod_data = {variable: "i", array_name: "[]"};
				prod = ProcedureFactory.getProcedure( ProcedureTypes.ForLoopControl, prod_data);
				break;

			case ProcedureTypes.WhileControl: 
				prod = ProcedureFactory.getProcedure( ProcedureTypes.WhileControl );
				break;

			case ProcedureTypes.LoopBreak: 
			case ProcedureTypes.LoopContinue: 
				prod = ProcedureFactory.getProcedure( type );
				break;

			default:
				throw Error("Procedure Type invalid");
		}
*/
		this.active_node = NodeUtils.add_procedure(this.active_node, ProcedureFactory.getProcedure(type));
	}

	addPort(type: string): void{
	  NodeUtils.add_port(this.active_node, PortTypes.Input, undefined);
    }


    openModuleHelp($event, category: string): void{
    	$event.stopPropagation();
    	this.layoutService.showHelp({module: category, name: undefined})
	}

}
