import {InputPortTypes} from "./InputPortTypes";
import {OutputPortTypes} from "./OutputPortTypes";

export interface IPort{

	_hasDefault: boolean;
	_hasComputed: boolean;
	_executionAddr: string;

	name;
	type;
	id;
	value;
	enabled: boolean;
	isConnected: boolean;

	setOpts(opts: any);
	getOpts(opts: any);

	isSelected(): boolean;

	update(portData: IPort): void;

	reset(); 
}

