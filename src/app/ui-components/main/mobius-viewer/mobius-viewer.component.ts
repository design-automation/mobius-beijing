import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mobius-viewer',
  templateUrl: './mobius-viewer.component.html',
  styleUrls: ['./mobius-viewer.component.scss']
})
export class MobiusViewerComponent implements OnInit {

  router;
  constructor(private _router: Router ) {
  	this.router = _router;
  }

  ngOnInit() {

  	// load file 
  	// https://raw.githubusercontent.com/akshatamohanty/mobius-cesium/workshop-features/src/assets/json-files/file1.txt

  	console.log("hello world: ", this.router.url);
  }

}
