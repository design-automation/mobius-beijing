import {Procedure} from "./Procedure";
import {IProcedure} from "./IProcedure";
import {ProcedureTypes} from "./ProcedureTypes";
import {IComponent} from "./IComponent";

export class StatementProcedure extends Procedure{

	constructor(type: ProcedureTypes){
		super(type, false); 

		let exp: string;
		if(type == ProcedureTypes.LoopBreak){
			exp = "break";
		}
		else if(type == ProcedureTypes.LoopContinue){
			exp = "continue";
		}

		let left: IComponent = { expression: exp, 
								 isAction: false, 
								 module: undefined, 
								 category: undefined, 
								 fn_name: undefined,
								 params: undefined
								}

		super.setLeftComponent(left);
		super.setRightComponent(undefined);
	}

	update(prodData: any, parent: IProcedure): void{
		// do nothing
		//console.error("This shouldn't be updated");
	}

}