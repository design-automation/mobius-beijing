import { Component, Injector, OnInit, OnDestroy } from '@angular/core';
import { AceEditorModule } from 'ng2-ace-editor';

import { FlowchartService } from "../../../global-services/flowchart.service";
import { CodeService } from "../../../global-services/code.service";

import * as js_beautify from 'js-beautify';

@Component({
  selector: 'app-code-viewer',
  templateUrl: './code-viewer.component.html',
  styleUrls: ['./code-viewer.component.scss']
})
export class CodeViewerComponent implements OnInit, OnDestroy{

	private subscriptions = [];
	
	private _codeString: string;

	constructor(private _cs: CodeService, 
				private _fs: FlowchartService) { }

	ngOnInit(){
		this.subscriptions.push( 	
			this._fs.flowchart$.subscribe((fc) => 
				this._codeString = js_beautify.js_beautify(this._cs.generator.get_code_display(fc)) ) 
		);
	}

	ngOnDestroy(){
		this.subscriptions.map(function(s){
			s.unsubscribe();
		})
	}

} 
