import { Component, Input, OnInit, Injector,
         ViewChild, ViewContainerRef, 
         ComponentFactoryResolver} from '@angular/core';
 
import { FlowchartService } from '../../../global-services/flowchart.service';    

import { LayoutService } from '../../../global-services/layout.service';
import { Subscription } from 'rxjs/Subscription';
import { EViewer } from '../../viewers/EViewer';


@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss']
})
export class PanelComponent implements OnInit{

  @ViewChild('container', {read: ViewContainerRef}) container: ViewContainerRef;
  @Input() panel_id: string;

  _lsubscription: Subscription;
  active_viewer: string;

  active_node;
  subscriptions = [];

  constructor(private _fs: FlowchartService, 
  			      private layoutService: LayoutService, 
              private r: ComponentFactoryResolver) { 
   
  }

  ngOnInit(){
    this.updateView();

    this.subscriptions.push(this._fs.node$.subscribe( (node) => this.active_node = node ));
    this.subscriptions.push(this.layoutService.getMessage().subscribe(message => { 
        this.updateView();
    }));
  }

  ngOnDestroy(){
    this.subscriptions.map(function(s){
    	s.unsubscribe()
    })
  }
  

  updateView(){ 
	  	let layout = this.layoutService.getView(this.panel_id); 
	    let pos = this.container.indexOf(layout.view);

	    if(this.active_viewer === layout.name){

	    }
	    else{

	      this.active_viewer = layout.name;
	      
	      if(pos === -1){
	        this.container.insert(layout.view);
	      }
	       
	      this.container.move(layout.view, 0)

	    }
  }

  // shifts component to main panel
  maximize(): void{
  	this.layoutService.maximize(this.panel_id);
  }

  // reduces size of component
  minimize(): void{
  	this.layoutService.minimize(this.panel_id);
  }

  // refreshes size of component
  restore(): void{
  	this.layoutService.restore(this.panel_id);
  }

}
