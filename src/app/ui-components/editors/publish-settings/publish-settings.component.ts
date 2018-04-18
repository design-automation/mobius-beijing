import { Component, Injector, Inject } from '@angular/core';
import { Viewer } from '../../../base-classes/viz/Viewer';
import { FlowchartService } from '../../../global-services/flowchart.service';
import { InputPort, OutputPort, InputPortTypes, OutputPortTypes } from '../../../base-classes/port/PortModule';

@Component({
  selector: 'app-publish-settings',
  templateUrl: './publish-settings.component.html',
  styleUrls: ['./publish-settings.component.scss']
})
export class PublishSettingsComponent extends Viewer{

  _inputs;
  inputPortOpts: InputPortTypes[] = [
        InputPortTypes.Input,
        InputPortTypes.Slider, 
        InputPortTypes.FilePicker,
        InputPortTypes.URL,
        InputPortTypes.Checkbox
    ]; 

  constructor(injector: Injector){  
      super(injector, "publish-settings"); 
    }

  ngOnInit() {
  	this._inputs = this.flowchartService.getFlowchart().globals;
  }

  addGlobal(): void{
  	let inputPort = new InputPort("global"  + this._inputs.length);
  	this._inputs.push(inputPort);
  	this.flowchartService.getFlowchart().globals(this._inputs);
  }

  getInputTypeName(type: InputPortTypes): string{
      if(type == InputPortTypes.ColorPicker){
        return "Color";
      }
      else if(type == InputPortTypes.Input){
        return "Simple Input";
      }
      else if(type == InputPortTypes.Dropdown){
        return "Dropdown";
      }
      else if(type == InputPortTypes.FilePicker){
        return "File";
      }
      else if(type == InputPortTypes.Slider){
        return "Slider";
      }
      else if(type == InputPortTypes.URL){
        return "WebURL";
      }
      else if(type == InputPortTypes.Checkbox){
        return "Checkbox";
      }
      else{
        return "Not Identifiable"
      }
    }

}
