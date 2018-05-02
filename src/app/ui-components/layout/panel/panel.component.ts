import { Component, Input, OnInit, Injector,
         ViewChild, ViewContainerRef, 
         ComponentFactoryResolver} from '@angular/core';
         
import { LayoutService } from '../../../global-services/layout.service';
import { Subscription } from 'rxjs/Subscription';
import { EViewer } from '../../viewers/EViewer';

import { Viewer } from '../../../base-classes/viz/Viewer';


@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss']
})
export class PanelComponent extends Viewer implements OnInit{

  @ViewChild('container', {read: ViewContainerRef}) container: ViewContainerRef;
  @Input() panel_id: string;

  _lsubscription: Subscription;
  _selectedNodeName: string;
  active_viewer: string;


  constructor(injector: Injector, 
              private layoutService: LayoutService, 
              private r: ComponentFactoryResolver) { 
    super(injector, "Panel Component");
    this._lsubscription = this.layoutService.getMessage().subscribe(message => { 
        this.updateView();
    });
  }

  ngOnInit(){
    this.updateView();
  }

  ngOnDestroy(){
    this._lsubscription.unsubscribe();
  }

  reset(): void{
    this._selectedNodeName = "";
  }

  update(): void{
    this._selectedNodeName = this.flowchartService.getSelectedNode().getName();
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
