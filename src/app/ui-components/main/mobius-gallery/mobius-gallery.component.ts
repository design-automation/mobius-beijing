import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { Constants } from "../../../constants";

@Component({
  selector: 'mobius-gallery',
  templateUrl: './mobius-gallery.component.html',
  styleUrls: ['./mobius-gallery.component.scss']
})
export class MobiusGalleryComponent implements OnInit {

  private all_files;

  constructor(private http: HttpClient) { 
    this.http.get(Constants.GALLERY_URL).subscribe(data => this.all_files = data);
  }

  ngOnInit() {
  }

}


