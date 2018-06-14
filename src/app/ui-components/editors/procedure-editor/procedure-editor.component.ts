import { Component, 
		 OnInit, OnDestroy,
		 ViewChild, HostListener} from '@angular/core';

import { NgModel } from '@angular/forms';

import {IGraphNode} from '../../../base-classes/node/NodeModule';
import {IProcedure, ProcedureFactory, ProcedureTypes} from '../../../base-classes/procedure/ProcedureModule';
import {Viewer} from '../../../base-classes/viz/Viewer';

import {FlowchartService} from '../../../global-services/flowchart.service';
import {LayoutService} from '../../../global-services/layout.service';

import {ModuleUtils} from "../../../base-classes/code/CodeModule";

export enum KEY_CODE {
  CUT = 88,
  COPY = 67, 
  PASTE = 86 
}


/*
 *	Displays the drag-drop procedure for a node
 *
 * 	Updates on:
 * 	- selected_node is changed
 * 	- selected_node is updated
 */

@Component({
  selector: 'app-procedure-editor',
  templateUrl: './procedure-editor.component.html',
  styleUrls: ['./procedure-editor.component.scss']
})
export class ProcedureEditorComponent implements OnInit, OnDestroy{

	// ----- Tree Initialization
	@ViewChild('tree') tree;
	_tree_options = {
	  allowDrag: function(element){
	  	if(element.data._type == ProcedureTypes.IfControl || element.data._type == ProcedureTypes.ElseControl){
	  		return false;
	  	}
	  	else{
	  		return true;
	  	}
	 },
	  allowDrop:  (element, { parent, index }) => {
	    return (	parent.data._type !== ProcedureTypes.IfElseControl 
	    			&& parent.data._type !== ProcedureTypes.Data 
	    			&& parent.data._type !== ProcedureTypes.Action 
	    			&& parent.data._type !== ProcedureTypes.LoopBreak 
	    			&& parent.data._type !== ProcedureTypes.LoopContinue )
	  }
	};


	// ----- Private Variables
	private _nodeX;
  	_node: IGraphNode;  // node displayed
  	_activeProcedure;			// procedure in focus
  	_procedureArr: IProcedure[] = [];
  	_variableList: string[];
  	copiedProd: IProcedure;

	constructor(private _fs: FlowchartService, 
				private _ls: LayoutService) { }

	ngOnInit(){
		this._nodeX = this._fs.selected_node.subscribe((node:IGraphNode) => {
			this.setProperties();
			this.tree.treeModel.update();
		})
	}

	ngOnDestroy(){
		this._nodeX.unsubsribe()
	}

	
	reset():void{
		this._procedureArr = [];
		this._node = undefined;
		this._variableList = [];
	}

	update(message: string){
		if(message == "procedure"){
			this.tree.treeModel.update();
			this._variableList = this._node.getVariableList();
			this._activeProcedure = this.flowchartService.getSelectedProcedure();
		}
		else{
			this.setProperties();
		}
	}	

	setProperties(): void{
		this._node = this.flowchartService.getSelectedNode();
		this._procedureArr = this._node.getProcedure();	

		// if procedure is selected, add it
		let selectedProd = this.flowchartService.getSelectedProcedure();

		if(selectedProd){
			this._activeProcedure = selectedProd;
			
		}
		else{
			if(this._procedureArr.length>1){
				this._activeProcedure = this._procedureArr[0];
			}
			else{
				// do nothing
			}
		}

		this.tree.treeModel.setFocusedNode(this._activeProcedure )

		this._variableList = this._node.getVariableList();

		for(let i=0; i < this._procedureArr.length; i++){
			let prod = this._procedureArr[i];
			if(prod.getType() == ProcedureTypes.Function){
				this.updateFunctionProd(prod);
			}
		}

	}
	

	
	getString(type: ProcedureTypes): string{
		return type.toString()
	}

	//
	// Procedure Functions 
	//
	openHelp($event, prod): void{
		$event.stopPropagation();

		if(prod.data._type == "Action"){
			let fn = prod.data.getRightComponent().expression.split(".");
			fn = { module: fn[0], name: fn[1] };
			this.layoutService.showHelp(fn);
		}
	}

	togglePrint(prod: IProcedure): void{
		prod.print = !prod.print;
	}

	toggle(prod: IProcedure): void{
		if (prod.isDisabled()){
			prod.enable();
		}
		else{
			prod.disable();
		}
	}


	//
	//
	//
	onMoveNode($event) {
		// get previous parent
		let moved_procedure: IProcedure = $event.node;
		let to_procedure: IProcedure = $event.to.parent;
		let moved_position: number = $event.to.index;

		moved_procedure.setParent(to_procedure);

	}

	//
	//	procedure update
	//
	updateProcedure($event: Event, prod: any, property: string){

		// todo: change this string attachment!
		if(property == 'left' && prod.data._type !== "If"){
			prod.data.getLeftComponent().expression = prod.data.getLeftComponent().expression.replace(/[^\w\[\]]/gi, '');
		}

		if(property == 'right' && prod.data._type == "Function"){
			this.updateFunctionProd(prod.data);
		}

		this._variableList = this._node.getVariableList();

	}

	// helper function
	updateFunctionProd(prod: any){
		let rightC = prod.getRightComponent();
		let reqParams = prod.updateParams().length;


		if(rightC.params.length > reqParams){
			rightC.params = rightC.params.slice(0, reqParams);
		}

		let paramStr = rightC.params.join(",");
		let expr: string = prod.getFunctionName() + "(" + paramStr + ")" + "." + rightC.category;
		rightC.expression = expr;
	}



	// ---- Cut / Copy / Paste Functions
	@HostListener('window:keyup', ['$event'])
		keyEvent(event: KeyboardEvent) {

			var key = event.keyCode
			var ctrlDown = event.ctrlKey || event.metaKey // Makey support

			if(ctrlDown && (event.srcElement.className.indexOf("input") > -1)){	event.stopPropagation(); return;	};

			if (ctrlDown && key == KEY_CODE.CUT) {
				this.copyProcedure(event, this._activeProcedure, false);
			}
			else if(ctrlDown && key == KEY_CODE.COPY) {
				this.copyProcedure(event, this._activeProcedure, true);
			}
			else if(ctrlDown && key == KEY_CODE.PASTE){
				this.pasteProcedure(event, this._activeProcedure);
			}
		}


	deleteProcedure(node): void{

		let parent = node.parent;
		if(parent.data.virtual){
			this._node.deleteProcedure(node.data);
			this._procedureArr = this._node.getProcedure();
		}
		else{
			parent.data.deleteChild(node.data);
			this.tree.treeModel.update();
		}
	}
	
	copyProcedure($event, node, copy: boolean): void{
		try{
			let prod: IProcedure = node.data;

			// check for "If" or "Else" type
			if(prod.getType() == "If" || prod.getType() == "Else"){
				return;
			}

			this.copiedProd = ProcedureFactory.getProcedureFromData(prod, undefined);

			if(copy){
				// do nothing
			}else{
				this.deleteProcedure(node)
			}
		}
		catch(ex){
			console.error("Error copying procedure");
			this.copiedProd = undefined;
		}
	}

	pasteProcedure($event, node, pos?: number): void{
		try{
			if(!this.copiedProd){
				return;
			}

			let parent: IProcedure = node.data;

			if(parent.getType() == "IfElse"){
				return;
			}

			if(parent.hasChildren){
				this.copiedProd.setParent(parent);
				parent.addChildAtPosition(this.copiedProd, 0);
			}
			else{
				let pos = node.index;
				let grandparent = node.parent;
				// in the top level
				if(grandparent.data.virtual){
					this._node.addProcedureAtPosition(this.copiedProd, pos+1);
				}
				else{
					grandparent.data.addChildAtPosition(this.copiedProd, pos+1);
				}

				//grandparent.addChildAtPosition(this.copiedProd, pos)
			}

			this._procedureArr = this._node.getProcedure();
			this.tree.treeModel.update();
			this.copiedProd = ProcedureFactory.getProcedureFromData(this.copiedProd, undefined);

		}
		catch(ex){
			console.error("Error pasting procedure");
			this.copiedProd = undefined;
		}
	}

}
