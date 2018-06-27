import {Component, Injector, OnInit} from '@angular/core';
import {FlowchartService} from '../../../global-services/flowchart.service';
import {LayoutService} from '../../../global-services/layout.service';
import {ModuleService} from '../../../global-services/module.service';

import {ModuleUtils} from "../../../base-classes/code/CodeModule";
import {IProcedure, ProcedureFactory, ProcedureTypes} from '../../../base-classes/procedure/ProcedureModule';
import {NodeUtils} from '../../../base-classes/node/NodeUtils';
import {IGraphNode} from '../../../base-classes/node/NodeModule';

@Component({
  selector: 'app-modulebox',
  templateUrl: './modulebox.component.html',
  styleUrls: ['./modulebox.component.scss']
})
export class ModuleboxComponent implements OnInit{

  	readonly procedureTypes: ProcedureTypes[] = [
  			ProcedureTypes.Data, 
  			ProcedureTypes.IfElseControl,
  			ProcedureTypes.ForLoopControl, 
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

		if(type == ProcedureTypes.Data){
			value = "variable"
		}
		else if(type == ProcedureTypes.Action){
			value = "function"
		}
		else if(type == ProcedureTypes.IfElseControl){
			value = "if-else"
		}
		else if(type == ProcedureTypes.ForLoopControl){
			value = "loop"	
		}
		else if(type == ProcedureTypes.LoopBreak){
			value = "loop break"	
		}
		else if(type == ProcedureTypes.LoopContinue){
			value = "loop continue"	
		}

		return value;
	}

	addProcedure($event, type: ProcedureTypes): void{

		$event.stopPropagation();
		let prod:IProcedure;

		if( type == ProcedureTypes.Data){
			let default_variable_name: string = "var" + this.active_node.procedure.length;
			let prod_data: {result: string, value: string} = {result: default_variable_name, value: "undefined"};
			prod = ProcedureFactory.getProcedure( ProcedureTypes.Data, prod_data );
		}
		else if (type == ProcedureTypes.IfElseControl){
			let prod_data : {if_condition: string, el_condition: string} = {if_condition: "undefined", el_condition: "undefined"};
			prod = ProcedureFactory.getProcedure( ProcedureTypes.IfElseControl, prod_data);
		}
		else if(type == ProcedureTypes.ForLoopControl){
			let prod_data :  {variable: string, array_name: string} = {variable: "i", array_name: "[]"};
			prod = ProcedureFactory.getProcedure( ProcedureTypes.ForLoopControl, prod_data);
		}
		else if(type == ProcedureTypes.LoopBreak || type == ProcedureTypes.LoopContinue){
			prod = ProcedureFactory.getProcedure( type );
		}
		else if(type == ProcedureTypes.Action){
		}
		else{
			throw Error("Procedure Type invalid");
		}

		this.active_node = NodeUtils.add_procedure(this.active_node, prod);
	}

	addPort(type: string): void{

      // add port 
      if(type == "in"){
          this.active_node.addInput();
      }
      else if(type == "out"){
          this.active_node.addOutput();
      }
      else{
        throw Error("Unknown Port Type");
      }  

      //this._fs.update();
    }


    openModuleHelp($event, category: string): void{
    	$event.stopPropagation();

    	//this._fs.switchViewer("help-viewer")

    	this.layoutService.showHelp({module: category, name: undefined})
	}

}
