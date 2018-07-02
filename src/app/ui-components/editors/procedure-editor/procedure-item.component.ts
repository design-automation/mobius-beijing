import { Component, 
		 Input, Output, 
		 EventEmitter,
		 OnInit, OnDestroy,
		 ViewChild, HostListener} from '@angular/core';

import {IProcedure, ProcedureFactory, ProcedureTypes} from '../../../base-classes/procedure/ProcedureModule';

@Component({
  selector: 'app-procedure-item',
  templateUrl: './procedure-item.component.html', 
  styleUrls: ['procedure-item.component.scss']
})
export class ProcedureItemComponent implements OnInit, OnDestroy{

	@Input() prod: IProcedure;
	@Input() active_procedure: IProcedure;
	@Input() level: number;

 	@Output() select = new EventEmitter<IProcedure>();

	ngOnInit(){ }  

	ngOnDestroy(){ }

	updateProcedure($event, prod, comp){
		console.log("prod updated");
	}

	onSelect($event, prod): void{
		if( !($event instanceof Event) )
			this.select.emit($event); 
		else
			this.select.emit(prod);
	}

}