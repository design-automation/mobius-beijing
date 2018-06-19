import { Pipe, PipeTransform } from '@angular/core';
import { InputPort, OutputPort, InputPortTypes, OutputPortTypes } from '../base-classes/port/PortModule';

@Pipe({name: 'port_type_name'})
export class PortTypePipe implements PipeTransform {
  transform(type: any): string {

    if (type in InputPortTypes){
      return this.getInputTypeName(type);
    }
    else if(type in OutputPortTypes){
      return this.getOutputTypeName(type);
    }
    else
      return "";
  }

  private getInputTypeName(type: InputPortTypes): string{
      let str_rep = undefined;
      switch(type){
        case InputPortTypes.ColorPicker:
          str_rep = "Color"
          break;
        case InputPortTypes.Dropdown:
          str_rep = "Dropdown"
          break;
        case InputPortTypes.Input:
          str_rep = "SimpleInput"
          break;
        case InputPortTypes.FilePicker:
          str_rep = "Load_File"
          break;
        case InputPortTypes.Slider:
          str_rep = "Slider"
          break;
        case InputPortTypes.URL:
          str_rep = "WebURL"
          break;
        case InputPortTypes.Checkbox:
          str_rep = "Checkbox"
          break;
        default:
          str_rep = "Not Identifiable"
      }

      return str_rep;
  }

  private getOutputTypeName(type: OutputPortTypes): string{
      if(type == OutputPortTypes.Three){
        return "Geometry";
      }
      else if(type == OutputPortTypes.Text){
        return "Text Viewer";
      }
      else if(type == OutputPortTypes.Code){
        return "Code Viewer";
      }
      else if(type == OutputPortTypes.Console){
        return "Console";
      }
      else if(type == OutputPortTypes.Cesium){
        return "Cesium";
      }
      else{
        return "Not Identifiable"
      }
  }

}