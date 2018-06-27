import { Component, OnInit } from '@angular/core';
import { FlowchartService } from '../../../global-services/flowchart.service'; 
import { ModuleService } from '../../../global-services/module.service'; 

import { Subscription } from 'rxjs/Subscription';
import { DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-help-viewer',
  templateUrl: './help-viewer.component.html',
  styleUrls: ['./help-viewer.component.scss']
})
export class HelpViewerComponent implements OnInit {

  _url;
  private _subscription: Subscription;
  private helpAvailable: boolean = false;

  _loadedModules: any;
  _activeMod: string;

  fnObj: {module: string, name: string};

  //modules/_group_.html
  constructor(private sanitizer: DomSanitizer, 
      private flowchartService: FlowchartService, 
      private _ms: ModuleService) { 
  		this.sanitizer = sanitizer;
      try{
        let mods = ModuleService.modules.map(function(m){
            return m["_name"].toLowerCase();
        });

        this._loadedModules = ModuleService.modules;
        this.helpAvailable = true;
      }
      catch(ex){
        this.helpAvailable = false;
      }
  };

  getSubModule(alldocs, modname){
    for(let i=0; i < alldocs.length; i++){
      let m = alldocs[i];
       if( ( "\"" + modname.split("_")[1] + "\"" ) ==  (m.name)){ 
        return ( (m.children && m.children.length > 0) ? m.children : []);
      }
    }
  };

  notify(): void{

  }

  showAll(): void{

  };  

  ngOnInit() { 
      this.notify();
  };

  replaceLineBreaks(str: string): string{
      return str.split("\n").join("<br>")
  }

}
