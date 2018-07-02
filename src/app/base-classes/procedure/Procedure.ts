import {IdGenerator} from '../misc/GUID';

import {IProcedure} from "./IProcedure";
import {ProcedureTypes} from "./ProcedureTypes";
import {IComponent} from "./IComponent";
import {ICodeGenerator} from "../code/CodeModule";

export abstract class Procedure implements IProcedure{

	private _id: string; 

	private _error: boolean;

	private _level: number;

	private _type: ProcedureTypes; 
	private _selected: boolean; 
	private _disabled: boolean = false; 
	private _printToConsole: boolean = false;
	
	private _parent: IProcedure;

	protected _leftComponent: IComponent; 
	protected _rightComponent: IComponent; 

	public hasChildren: boolean;
	public children: IProcedure[] = []; 

	constructor(type: ProcedureTypes, hasChildren: boolean){
		this._id = IdGenerator.getId();

		this._type = type; 
		this._level = 0;

		this.hasChildren = hasChildren;
		
		this.hasChildren = this.hasChildren;
		this.children = this.children;
		this._error = false;
	}	

	get enabled(): boolean{
		return !this._disabled;
	}

	set enabled(value: boolean){
		this._disabled = !value;
	}

	get id(): string{
		return this._id;
	}

	set id(value: string){
		console.warn("Id of procedure being set manually");
		this._id = value;
	}

	update(prodData: any, parent: IProcedure): void{
		this._id = prodData._id;
		this._disabled = prodData._disabled; 

		// todo: be careful
		//this._leftComponent =  prodData._leftComponent; 
		//this._rightComponent = prodData._rightComponent; 

		this._parent = parent;
		this._level = prodData._level;
		
		this.hasChildren = prodData.hasChildren;
		this.children = [];
		this._error = false; 
	}

	reset(): void{
		this._error = false;
		this.children.map(function(p){
			p.reset();
		})
	}

	setError(value: boolean): void{
		this._error = value;
	}

	getError(): boolean{
		return this._error;
	}

	getLevel(): number{
		return this._level;
	}

	getType(): ProcedureTypes{
		return this._type; 
	}

	isSelected(): boolean{
		return this._selected; 
	}

	select(): void{
		this._selected = true;
	}

	unselect(): void{
		this._selected = false;
	}

	isDisabled(): boolean{
		return this._disabled;
	}

	enable(): void{
		this._disabled = false;
		if(this.children.length){
			for(let i=0; i < this.children.length; i++){
				this.children[i].enable();
			}
		}
	}

	disable(): void{
		this._disabled = true;

		if(this.children.length){
			for(let i=0; i < this.children.length; i++){
				this.children[i].disable();
			}
		}
	}

	get print(): boolean{
		return this._printToConsole;
	}

	set print(value: boolean){
		this._printToConsole = value;
	}

	hasParent(): boolean{
		if(this._parent == undefined){
			return false;
		}
		else{
			return true;
		}
	}

	get parent(): IProcedure{
		return this._parent;
	}

	set parent(parent: IProcedure){
		if(parent && (parent["_level"]!==undefined)){
			this._level = parent["_level"] + 1;
		}
		else{
			this._level = 0;
		}

		this._parent = parent;
	}



	getChildren(): IProcedure[]{
		if( this.hasChildren == false){
			throw Error("This Procedure Type is not a container");
		}
		else{
			return this.children;
		}
		
	}	

	addChild(child: IProcedure): IProcedure{
		return ProcedureUtils.add_child(this, child);
	}

	addChildFromData(child: IProcedure): IProcedure{
		return ProcedureUtils.add_child_from_data(this, child);
	}

	addChildAtPosition(child: IProcedure, index: number): IProcedure{
		return ProcedureUtils.add_child_at_position(this, child, index);		
	}

	deleteChild(procedure: IProcedure): IProcedure{
		return ProcedureUtils.delete_child(this, procedure);
	}

	getLeftComponent(): IComponent{
		return this._leftComponent; 
	}

	setLeftComponent(component: IComponent): void{
		this._leftComponent = component;
	}

	getRightComponent(): IComponent{
		return this._rightComponent; 
	}

	setRightComponent(component: IComponent): void{
		this._rightComponent = component;
	}

	getCodeString(code_generator: ICodeGenerator): string{
		return code_generator.generateProcedureCode(this);
	}

}

export abstract class ProcedureUtils{

	public static add_child(procedure: IProcedure, child: IProcedure): IProcedure{
		if( procedure.hasChildren ){
			procedure.children.push(child);
			child.parent = procedure;
		}
		else{
			throw Error("Cannot add child to this procedure");
		}
		
		return procedure;
	}

	public static add_child_from_data(procedure: IProcedure, child: IProcedure): IProcedure{
		if( procedure.hasChildren ){
			procedure.children.push(child);
			child.parent = procedure;
		}
		else{
			throw Error("Cannot add child to this procedure");
		}

		return procedure;
	}

	public static add_child_at_position(procedure: IProcedure, child: IProcedure, index: number): IProcedure{
		procedure.children.splice(index, 0, child);
		child.parent = procedure;

		return procedure;
	}

	public static delete_child(procedure: IProcedure, remove: IProcedure): IProcedure{
		procedure.children = procedure.children.filter(function(child: IProcedure){ 
			return !(child === remove)
		});

		return procedure;
	}
} 