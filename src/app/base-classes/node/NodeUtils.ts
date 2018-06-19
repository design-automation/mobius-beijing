import {InputPort, OutputPort} from "../port/PortModule";
import {IGraphNode} from "./IGraphNode";
import {IProcedure} from "../procedure/ProcedureModule";
import {ProcedureUtils} from '../procedure/Procedure';

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

	public static add_procedure_at_position(node: IGraphNode, procedure: IProcedure, index: number): IGraphNode{

		node.removeType();
		node.procedure.splice(index, 0, procedure);

		return node;
	}


	public static add_procedure(node: IGraphNode, procedure: IProcedure): IGraphNode{
      
      let active_procedure: IProcedure = node.active_procedure;

      // TODO: Validate procedure
      // this.checkProcedure(prod);

      if(active_procedure){
	        if(active_procedure.hasChildren){
	        	active_procedure = ProcedureUtils.add_child(active_procedure, procedure);
	        }
	        else{

	           if(active_procedure.parent && !active_procedure.parent["virtual"]){

	               let parent: IProcedure = active_procedure.parent;
	               let index: number = 0;
	               let allChildren: IProcedure[] = parent.getChildren();

	               for(let i=0; i<allChildren.length; i++){
	                   if(allChildren[i] === active_procedure){
	                       index = i;
	                       break;
	                   }
	               }

	               parent = ProcedureUtils.add_child_at_position(parent, procedure, index + 1)
	           }
	           else{

	               let parent: IGraphNode = node;
	               let index: number = 0;
	               let allChildren: IProcedure[] = node.getProcedure();

	               for(let i=0; i<allChildren.length; i++){
	                   if(allChildren[i] === active_procedure){
	                       index = i;
	                       break;
	                   }
	               }

	               node = NodeUtils.add_procedure_at_position(node, procedure, index + 1);
	           }

	        }
      }
      else{
      	node = NodeUtils.add_procedure(node, procedure)
      }


      // update active procedure for the node
      if(procedure.getType() == "IfElse"){
      	  node.active_procedure = procedure.getChildren()[0]
      }
      else{
      	  node.active_procedure = procedure;
      }

		return node;
	}

}