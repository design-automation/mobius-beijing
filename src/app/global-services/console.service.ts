import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {Subject} from 'rxjs/Subject';

export enum EConsoleMessageType{
	Print = "print", 
	Error = "error", 
	General = "general"
}

export enum LogLevel {
  All = 0,
  Debug = 1,
  Info = 2,
  Warn = 3,
  Error = 4,
  Fatal = 5,
  Off = 6
}

@Injectable()
export class ConsoleService {

	_messages;
	level: LogLevel = LogLevel.All;
	logWithDate: boolean = true;

	constructor() {
		this._messages = [];
	}

	// message handling between components
	// 
	private subject = new Subject<any>();
	sendMessage(message ?: string) {
	  this.subject.next({ text: message });
	}

	clearMessage() {
	  this.subject.next();
	}

	getMessage(): Observable<any> {
	  return this.subject.asObservable();
	}

	addMessage(message: string, type: EConsoleMessageType = EConsoleMessageType.General): void{
  		let obj = {}
  		obj["time"] = new Date();
  		obj["message"] = message;
  		obj["type"] = type;
  		this._messages.push(obj);
  		this.sendMessage();
	};

	getContent(){
			return this._messages; 
	}

	clearConsole(): void{
		this._messages = [];
		this.sendMessage();
	}


	log(msg: any){
		console.log(new Date() + ": " + JSON.stringify(msg));
	}

}

