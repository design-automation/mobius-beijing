import { Component, ViewChild, ElementRef } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { FlowchartService } from '../../../global-services/flowchart.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent{
	
	@ViewChild('fileInput') fileInput: ElementRef;


}
