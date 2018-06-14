import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';

import { ICodeGenerator, CodeFactory } from "../base-classes/code/CodeModule";

@Injectable()
export class CodeService {

	private _codeGenerator: ICodeGenerator = CodeFactory.getCodeGenerator("js");

	constructor(){}

	get generator(): ICodeGenerator{
		return this._codeGenerator;
	}

	set generator(gen: ICodeGenerator){
		this._codeGenerator = gen;
	}

}

