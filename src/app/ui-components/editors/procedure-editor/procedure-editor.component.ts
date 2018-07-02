import { Component, 
		 OnInit, OnDestroy,
		 ViewChild, HostListener} from '@angular/core';

import { NgModel } from '@angular/forms';

import {IGraphNode} from '../../../base-classes/node/NodeModule';
import {IProcedure, ProcedureFactory, ProcedureTypes} from '../../../base-classes/procedure/ProcedureModule';

import {FlowchartService} from '../../../global-services/flowchart.service';
import {LayoutService} from '../../../global-services/layout.service';

import {ModuleUtils} from "../../../base-classes/code/CodeModule";

export enum KEY_CODE {
  CUT = 88,
  COPY = 67, 
  PASTE = 86 
}

abstract class ProcedureOptions{
	
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

	// ----- Private Variables
    private subscriptions = [];
    private active_node: IGraphNode;
  	private active_procedure: IProcedure;			// procedure in focus
  	_variableList: string[];
  	copiedProd: IProcedure;

    constructor(private _fs: FlowchartService, 
                private _ls: LayoutService){}

    ngOnInit(){
      this.subscriptions.push(this._fs.node$.subscribe( (node) => {
      		console.log("selected node updated");
       		this.active_node = node;
      }));
    }

    ngOnDestroy(){
      this.subscriptions.map(function(s){
        s.unsubscribe();
      })
    }

	//
	// Procedure Functions 
	//
	openHelp($event, prod): void{
		$event.stopPropagation();

		if(prod.data._type == "Action"){
			let fn = prod.data.getRightComponent().expression.split(".");
			fn = { module: fn[0], name: fn[1] };
			this._ls.showHelp(fn);
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

	onSelect($event): void{
		if( !($event instanceof Event) ){
			this.active_procedure = $event;
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

		moved_procedure.parent = (to_procedure);

	}

	// ---- Cut / Copy / Paste Functions
	@HostListener('window:keyup', ['$event'])
		keyEvent(event: KeyboardEvent) {

			var key = event.keyCode
			var ctrlDown = event.ctrlKey || event.metaKey // Makey support

			if(ctrlDown && (event.srcElement.className.indexOf("input") > -1)){	event.stopPropagation(); return;	};

			if (ctrlDown && key == KEY_CODE.CUT) {
				this.copyProcedure(event, this.active_procedure, false);
			}
			else if(ctrlDown && key == KEY_CODE.COPY) {
				this.copyProcedure(event, this.active_procedure, true);
			}
			else if(ctrlDown && key == KEY_CODE.PASTE){
				this.pasteProcedure(event, this.active_procedure);
			}
		}


	deleteProcedure(node): void{
		let parent = node.parent;
		if(parent.data.virtual){
			this.active_node.deleteProcedure(node.data);
		}
		else{
			parent.data.deleteChild(node.data);
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
				this.copiedProd.parent = (parent);
				parent.addChildAtPosition(this.copiedProd, 0);
			}
			else{
				let pos = node.index;
				let grandparent = node.parent;
				// in the top level
				if(grandparent.data.virtual){
					this.active_node.addProcedureAtPosition(this.copiedProd, pos+1);
				}
				else{
					grandparent.data.addChildAtPosition(this.copiedProd, pos+1);
				}

				//grandparent.addChildAtPosition(this.copiedProd, pos)
			}

			this.copiedProd = ProcedureFactory.getProcedureFromData(this.copiedProd, undefined);

		}
		catch(ex){
			console.error("Error pasting procedure");
			this.copiedProd = undefined;
		}
	}

}
