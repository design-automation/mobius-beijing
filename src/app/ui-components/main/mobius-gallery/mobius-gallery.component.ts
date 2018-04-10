import { Component, OnInit } from '@angular/core';

import '../../../../assets/json-files/jsonList';

@Component({
  selector: 'mobius-gallery',
  templateUrl: './mobius-gallery.component.html',
  styleUrls: ['./mobius-gallery.component.scss']
})
export class MobiusGalleryComponent implements OnInit {

  private fs;

  constructor() { 
  		console.log("allfiles: ", AllFiles);
  		this.fs = AllFiles;
  }

  ngOnInit() {
  }

}
