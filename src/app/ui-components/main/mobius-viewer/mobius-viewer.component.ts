import { Component, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs/Rx";

@Component({
  selector: 'app-mobius-viewer',
  templateUrl: './mobius-viewer.component.html',
  styleUrls: ['./mobius-viewer.component.scss']
})
export class MobiusViewerComponent implements OnInit {

	router; sub;
	filepath: string;
	constructor(private _router: ActivatedRoute, private http: HttpClient) {
		this.router = _router;
	}

	ngOnInit() {
		this.sub = this.router.params.subscribe(params => {
		   this.filepath = this.getFlowchart(params.id);
		});
	}

	getFlowchart(filename: string){
		let filepath: string = 
			"https://raw.githubusercontent.com/akshatamohanty/mobius-cesium/\
			workshop-features/src/assets/json-files/" + filename;
		return filepath;
		//return this.http.get(filepath).subscribe(val => console.log(val));
		//return .map((res: Response) => { res.json(); console.log(res)} );
	}

	ngOnDestroy() {
		this.sub.unsubscribe();
	}
}
