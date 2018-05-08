import {Component, Injector, OnInit} from '@angular/core';
import {FlowchartService} from '../../../global-services/flowchart.service';
import {LayoutService} from '../../../global-services/layout.service';
import {ModuleUtils} from "../../../base-classes/code/CodeModule";
import {Viewer} from '../../../base-classes/viz/Viewer';
import {IProcedure, ProcedureFactory, ProcedureTypes} from '../../../base-classes/procedure/ProcedureModule';
import {IGraphNode} from '../../../base-classes/node/NodeModule';

@Component({
  selector: 'app-modulebox',
  templateUrl: './modulebox.component.html',
  styleUrls: ['./modulebox.component.scss']
})
export class ModuleboxComponent extends Viewer implements OnInit{

  	_moduleList = [];
  	_category: string[] = [];
  	_node: IGraphNode;
  	_procedureArr: IProcedure[] = [];

  	procedureTypes: ProcedureTypes[] = [
  			ProcedureTypes.Data, 
  			ProcedureTypes.IfElseControl,
  			ProcedureTypes.ForLoopControl, 
  			ProcedureTypes.LoopBreak, 
  			ProcedureTypes.LoopContinue
  	];

  	constructor(injector: Injector, private layoutService: LayoutService) { 
  		super(injector, "module-viewer"); 
	}

	ngOnInit(){
  		this._moduleList = [];
  		this._node = this.flowchartService.getSelectedNode();
  		this._procedureArr = this._node.getProcedure();

		let modules = this.flowchartService.getModules();
		for(let mod=0; mod < modules.length; mod++){
			let user_module = modules[mod];
			this._category.push(user_module["_name"]);
			this._moduleList[user_module["_name"]] = this._moduleList.concat(ModuleUtils.getFunctions(user_module));
		}

	}

	reset():void{
		this._node = undefined;
		this._procedureArr = [];
	}

	update(){
		this._node = this.flowchartService.getSelectedNode();
		if(this._node !== undefined){
			this._procedureArr = this._node.getProcedure();
		}
		else{
			// do nothing
		}
	}


	//
	//
	//
	addActionProcedure(fn: {name: string, params: string[], module: string}){

		if(this._node == undefined){
			alert("Oops.. No Node Selected");
			return;
		}

		let prod_data :  {result: string, module: string, function: any, params: string[]} = 
			{result: "", module: fn.module, function: fn.name, params: fn.params};
		let prod:IProcedure = ProcedureFactory.getProcedure( ProcedureTypes.Action, prod_data);
		this.flowchartService.addProcedure(prod);
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
			let default_variable_name: string = "var" + this._procedureArr.length;
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
			alert(type);
			prod = ProcedureFactory.getProcedure( type );
			console.log(prod);
		}
		else if(type == ProcedureTypes.Action){
		}
		else{
			throw Error("Procedure Type invalid");
		}

		this.flowchartService.addProcedure(prod);
	}

	addPort(type: string): void{

      // add port 
      if(type == "in"){
          this._node.addInput();
      }
      else if(type == "out"){
          this._node.addOutput();
      }
      else{
        throw Error("Unknown Port Type");
      }  

      this.flowchartService.update();
    }


    openModuleHelp($event, category: string): void{
    	$event.stopPropagation();

    	this.layoutService.showHelp({module: category, name: undefined})
	}

}
