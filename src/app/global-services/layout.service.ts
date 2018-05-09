import { Injector, ComponentFactoryResolver} from '@angular/core';

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';

//import {OutputPortTypes} from '../../../base-classes/Port/PortModule';
import { EViewer } from '../ui-components/viewers/EViewer';

import { ViewerContainerComponent } from "../ui-components/viewers/viewer-container/viewer-container.component";
import { FlowchartViewerComponent } from "../ui-components/editors/flowchart-viewer/flowchart-viewer.component";
import { EditorComponent } from "../ui-components/editors/editor/editor.component";
import { ParameterViewerComponent } from "../ui-components/viewers/parameter-viewer/parameter-viewer.component";

@Injectable()
export class LayoutService {

  	private layout = {
        useTransition: true,
        mode: 'Editor',
        gutter: 7,
        size: {
          main: 70, 
          side: 30, 
          top: 33, 
          middle: 33, 
          bottom: 33
        },
        content: {
          main: EViewer.Flowchart, 
          side: {
            top: EViewer.Editor, 
            middle: EViewer.Viewer,
            bottom: EViewer.Parameter
          }
        }, 
        views: []
  	}

    private viewContainerIndex: number = 500; 

    _url: string = "index";
    _fnObj: {module: string, name: string};

    public static ComponentMap = {
      "Output" : ViewerContainerComponent,
      "Flowchart" : FlowchartViewerComponent,
      "Procedure": EditorComponent, 
      "Parameters": ParameterViewerComponent, 
    }

  	constructor(injector: Injector, private r: ComponentFactoryResolver) { 

      function createView(component_name: string){
        let component = LayoutService.ComponentMap[component_name];
        let factory = r.resolveComponentFactory(component);
          let componentRef = factory.create(injector);
          let view = componentRef.hostView;
          return view;
      }

      this.layout.views[EViewer.Editor] = createView(EViewer.Editor);
      this.layout.views[EViewer.Viewer] = createView(EViewer.Viewer);
      this.layout.views[EViewer.Flowchart] = createView(EViewer.Flowchart);
      this.layout.views[EViewer.Parameter] = createView(EViewer.Parameter);

    }

    // handing subscriptions
    private subject = new Subject<any>();
    sendMessage(message: string) {
        this.subject.next({ text: message });
    }
   
    clearMessage() {
        this.subject.next();
    }

    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }

    // general 
    getView(panel_id: string){
        let viewer_name: string
                = panel_id == "main" ? this.layout.content.main :
                  this.layout.content.side[panel_id];
        return {name: viewer_name, view: this.layout.views[viewer_name]};
    } 
    
    getAssets(){
      return this.layout;
    }

    //panels related
    maximize(panel_id: string): void{

        if(panel_id == "main"){
          return;
        }

        // get the panel_id passed and the corresponding component
        // interchange values
        let max_item = this.layout.content.side[panel_id];

        if(max_item){
           let current_main = this.layout.content.main;
           this.layout.content.main = max_item; 
           this.layout.content.side[panel_id] = current_main;
        }

        this.sendMessage("Layout Changed");

    }

    minimize(panel_id: string): void{
      alert("To be implemented");
    }

    restore(panel_id: string): void{
      alert("To be implemented");
    }



    // functions
    showHelp(fn: {module: string, name: string}): void{
        this._url  = "modules/" + "_" + fn.module.toLowerCase() + "_";
        this._fnObj = fn;
        this.sendMessage("Module: " + fn.module);
    } 

    showConsole(): void{
        this.sendMessage("console");
    }

    getViewContainer(): number{
      return this.viewContainerIndex;
    }


    //
    setViewContainer(index: number): void{
      this.viewContainerIndex = index;
    }


    // help
    getUrl(): string{
      return this._url;
    }

    getObj(): {module: string, name: string}{
      return this._fnObj;
    }

    setObj(): void{
      this._url = undefined;
    }


    // modes - mobius editor or mobius viewer
    toggleMode(): void{
      
      if(this.layout.mode == 'Editor'){
        this.layout.mode = 'Viewer';
        this.layout.size.top = 0; 
        this.layout.size.middle = 0; 
        this.layout.size.bottom = 100; 
      }
      else{
        this.layout.mode = 'Editor';
        this.layout.size.top = 33; 
        this.layout.size.middle = 33; 
        this.layout.size.bottom = 33; 

      }
    }

    setEditor(): void{
        this.layout.mode = 'Editor';
        this.layout.size.top = 33; 
        this.layout.size.middle = 33; 
        this.layout.size.bottom = 33; 
    }

    setViewer(): void{
        this.layout.mode = 'Viewer';
        this.layout.size.top = 0; 
        this.layout.size.middle = 0; 
        this.layout.size.bottom = 33; 
    }


}