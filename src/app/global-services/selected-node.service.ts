import { Injectable } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Injectable()
export class ActiveNodeService {

	private _processing: boolean = false;
	stateChanged: EventEmitter<boolean> = new EventEmitter();

	constructor() {
		let self = this;
	}

    get processing(){
      return this._processing;
    }

    set processing(value){
      this._processing = value;
      this.stateChanged.emit(this._processing);
    }

    stateChangedEmitter() {
	    return this.stateChanged;
	}

}
