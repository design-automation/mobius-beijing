import {InputPort, OutputPort} from "../port/PortModule";
import {IGraphNode} from "./IGraphNode";

export abstract class NodeUtils{

	public static delete_port(node: IGraphNode, port: InputPort|OutputPort): IGraphNode{

		let prop = "";

		if (port instanceof InputPort){
			prop = "inputs"
		}
		else if( port instanceof OutputPort){
			prop = "outputs";
		}
		else{
			throw Error("Invalid Port Type");
		}

		for (const [idx, p] of node[prop].entries()) {
		  	if(p.id === port.id){
				node[prop].splice(idx, 1);
				break;
			}
		}

		return node;
	}
}