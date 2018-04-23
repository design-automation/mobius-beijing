import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

@Component({
  selector: 'mobius-gallery',
  templateUrl: './mobius-gallery.component.html',
  styleUrls: ['./mobius-gallery.component.scss']
})
export class MobiusGalleryComponent implements OnInit {

  static readonly gallery_url = 'https://api.github.com/repos/akshatamohanty/mobius-cesium/contents/src/assets/json-files?ref=master';

  private all_files;
  //https://api.github.com/repos/akshatamohanty/mobius-cesium/contents/src/assets/json-files?ref=workshop-features

  constructor(private http: HttpClient) { 
    this.http.get(MobiusGalleryComponent.gallery_url).subscribe(data => this.all_files = data);
  }

  ngOnInit() {
    console.log(this.all_files);
  }

}
