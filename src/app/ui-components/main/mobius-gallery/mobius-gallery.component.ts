import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

import '../../../../assets/json-files/jsonList';

@Component({
  selector: 'mobius-gallery',
  templateUrl: './mobius-gallery.component.html',
  styleUrls: ['./mobius-gallery.component.scss']
})
export class MobiusGalleryComponent implements OnInit {

  private all_files;

  constructor(private http: HttpClient) { 
  		this.all_files = AllFiles;
  }

  ngOnInit() {
  }

  loadFile(filename): void{
  	//console.log("load file: ", filename);
  	/*this.http.get('./assets/json-files/'+filename)
  		.pipe(
        tap(heroes => this.log(`fetched heroes`)),
        catchError(this.handleError('getHeroes', []))
      );*/
      // console.log(fs);
      // fs.readFile('./assets/json-files/' + filename, function(err, data){
      // 	console.log(data);
      // });

       // let address: string = '../assets/json-files/' + filename; 
       // console.log(address);
       // this.http.get(address)
       //  .subscribe(
       //    data => {
       //      console.log(data)
       //    },
       //    err => {
       //      console.log(err)
       //    });

  }

}
