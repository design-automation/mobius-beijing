import { IFlowchart } from './IFlowchart';
import { FlowchartReader } from './FlowchartReader';
import * as CircularJSON from 'circular-json';
import { FileService } from '../../global-services/file.service';

export abstract class FlowchartWriter{

	public static save_flowchart_as_json(flowchart: IFlowchart): void{
	    let file = {};
	    let fileString: string;

	    file["language"] = "js";
	    file["modules"] = [];

	    let newFlowchart: IFlowchart = FlowchartReader.read_flowchart_from_data(flowchart);
	    file["flowchart"] = newFlowchart;
	    fileString = CircularJSON.stringify(file);

	    let fname: string = 'Scene' + (new Date()).getTime() + ".mob";
	    if(flowchart.name){
	      fname = flowchart.name;
	      if(!fname.endsWith(".mob")){
	        fname = fname + ".mob";
	      }
	    }
	    
	    FileService.downloadAsJSON(fileString, fname);
	}

}