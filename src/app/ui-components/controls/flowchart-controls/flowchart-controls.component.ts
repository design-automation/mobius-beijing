import { Component, Injector, OnInit } from '@angular/core';

import { ModuleService } from '../../../global-services/module.service';

@Component({
  selector: 'app-flowchart-controls',
  templateUrl: './flowchart-controls.component.html',
  styleUrls: ['./flowchart-controls.component.scss']
})
export class FlowchartControlsComponent implements OnInit{

  // doesn't really need to extend viewer 
  constructor(injector: Injector, private modules: ModuleService) { }

  ngOnInit(): void{
    this.newfile();
  }

  newfile(): void{
  }

  execute(): void{
  }


  loadFile(url ?:string): void{
  }

  save(): void{
  }

}
