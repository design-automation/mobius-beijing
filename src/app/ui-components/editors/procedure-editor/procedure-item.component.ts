import { Component, 
		 Input, Output, 
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
	@Output() active;

	ngOnInit(){
	}

	ngOnDestroy(){

	}

	updateProcedure($event, prod, comp){
		console.log("prod updated");
	}

}