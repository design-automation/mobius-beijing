import { Component, 
		 Input, Output, 
		 EventEmitter,
		 OnInit, OnDestroy,
		 ViewChild, HostListener} from '@angular/core';

import {IProcedure, ProcedureFactory, 
		ProcedureTypes} from '../../../base-classes/procedure/ProcedureModule';
import {NodeUtils} from '../../../base-classes/node/NodeModule';

@Component({
  selector: 'app-procedure-item',
  templateUrl: './procedure-item.component.html', 
  styleUrls: ['procedure-item.component.scss']
})
export class ProcedureItemComponent implements OnInit, OnDestroy{

	@Input() prod: IProcedure;
	@Input() active_procedure: IProcedure;
	@Input() level: number;
	@Input() root;

 	//@Output() action = new EventEmitter<{prod: IProcedure, type:string}>();

	ngOnInit(){ }  

	ngOnDestroy(){ }

	updateProcedure($event, prod, comp){
	}

	onSelect($event): void{
		this.root.active_procedure = this.prod;
	}

	// onAction($event, prod, type): void{
	// 	if( !($event instanceof Event) )
	// 		this.action.emit({prod: $event, type: type}); 
	// 	else if($event["prod"])
	// 		this.action.emit({prod: prod, type: type});
	// }

}