import { Injectable } from '@angular/core';
import { EventEmitter } from '@angular/core';

import { ICodeGenerator, CodeFactory } from '../base-classes/code/CodeModule';

import { ConsoleService } from './console.service';


@Injectable()
export class MobiusService {

  private _user: string = "local_user";
  private _code_gen: ICodeGenerator = CodeFactory.getCodeGenerator("js");
  private _processing: boolean = false;

	stateChanged: EventEmitter<boolean> = new EventEmitter();

	constructor( $log: ConsoleService ) { }

  get processing(){
    return this._processing;
  }

  set processing(value){
    this._processing = value;
    this.stateChanged.emit(this._processing);
  }

  get code_generator(){
      return this._code_gen;
  }

  set code_generator(cg: ICodeGenerator){
      this._code_gen = cg;
  }

  get user(): string{
    return this._user;
  }

  set user(username: string){
    this._user = username;
  }

  stateChangedEmitter() {
    return this.stateChanged;
  }

}
