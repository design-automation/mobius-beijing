import { Component, OnInit, Injector, ElementRef } from '@angular/core';
import {DataSubscriber} from "../data/DataSubscriber";

@Component({
  selector: 'cesium-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.css']
})
export class ViewerComponent extends DataSubscriber {
  data:JSON;
  myElement;
  fullscreenContainer: HTMLCollectionOf<Element>;

  constructor(injector: Injector, myElement: ElementRef) { 
  	super(injector);
    this.myElement = myElement;
  }

  ngOnInit() {

  }

  notify(message: string): void{
    if(message == "model_update" ){
      this.data = this.dataService.getGsModel(); 
      try{
      	this.LoadData(this.data);
      }
      catch(ex){
      	console.log(ex);
      }
    }
  }

  LoadData(data){
  	if(document.getElementsByClassName('cesium-viewer').length!==0){
      document.getElementsByClassName('cesium-viewer')[0].remove();
	  }	
    var viewer = new Cesium.Viewer('cesiumContainer');  
    document.getElementsByClassName('cesium-viewer-bottom')[0].remove();
    document.getElementsByClassName('cesium-viewer-animationContainer')[0].remove();
    document.getElementsByClassName('cesium-viewer-timelineContainer')[0].remove();
    this.data=data;

    var promise = Cesium.GeoJsonDataSource.load(this.data);
    promise.then(function(dataSource) {
      viewer.dataSources.add(dataSource);
      var entities = dataSource.entities.values;
      for (var i = 0; i < entities.length; i++) {
        var entity = entities[i];                               
        entity.polygon.extrudedHeight = entity.properties.height;
        entity.polygon.material=Cesium.Color.WHITE.withAlpha(1);
        if(entity.properties.propertyNames.length!==0){
          for(var j=0;j<entity.properties.propertyNames.length;j++){
          	if(entity.properties.propertyNames[j]==="roofColor"){
          	  entity.polygon.material=Cesium.Color.fromCssColorString(entity.properties.roofColor._value).withAlpha(1);//entity.properties.roofColor._value);
          	}
          }
        }
      }
    });

    viewer.zoomTo(promise);
  }

}