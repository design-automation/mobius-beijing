import { Component, 
		 OnInit, OnDestroy,
		 ViewChild, HostListener} from '@angular/core';

import { NgModel } from '@angular/forms';

import {IGraphNode, NodeUtils} from '../../../base-classes/node/NodeModule';
import {IProcedure, ProcedureFactory, ProcedureTypes, ProcedureUtils} from '../../../base-classes/procedure/ProcedureModule';

import {FlowchartService} from '../../../global-services/flowchart.service';
import {LayoutService} from '../../../global-services/layout.service';

import {ModuleUtils} from "../../../base-classes/code/CodeModule";

export enum KEY_CODE {
  CUT = 88,
  COPY = 67, 
  PASTE = 86,
  LEFT = 37,
  UP = 38,
  RIGHT = 39,
  DOWN = 40,
  DELETE = 46
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
		prod.enabled = !prod.enabled;
	}

	onSelect($event): void{
		if( !($event instanceof Event) ){
			this.active_node.active_procedure = $event;
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
			var shiftDown = event.shiftKey;

			if((event.srcElement.className.indexOf("input") > -1)){	
				event.stopPropagation(); 
				return;	
			};

			if(ctrlDown){
				switch (key){
					case KEY_CODE.CUT:
						this.copiedProd = ProcedureUtils.copy_procedure(this.active_node.active_procedure);
						this.delete_procedure();
					case KEY_CODE.COPY:
						this.copiedProd = ProcedureUtils.copy_procedure(this.active_node.active_procedure);
						break;
					case KEY_CODE.PASTE:
						let parent: IProcedure = this.active_node.active_procedure.parent;
						if(parent){
							ProcedureUtils.add_child(parent, this.copiedProd);
						}
						else{
							NodeUtils.add_procedure(this.active_node, this.copiedProd);
						}
						this.copiedProd = ProcedureUtils.copy_procedure(this.copiedProd);
						break;

				}
			}
			else if(shiftDown){
				switch (key){
					case KEY_CODE.LEFT:
						//this.copyProcedure(event, this.active_node.active_procedure, false);
						break;
					case KEY_CODE.RIGHT:
						//this.copyProcedure(event, this.active_node.active_procedure, true);
						break;
					case KEY_CODE.DOWN:
						break;
					case KEY_CODE.UP:
						break;
				}
			}
			else if(key == KEY_CODE.DELETE){
				this.delete_procedure()
 			}

 			console.log(key)
		}


	delete_procedure(): void{
		NodeUtils.delete_procedure(this.active_node)
	}

}
