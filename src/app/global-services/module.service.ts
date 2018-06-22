import { Injectable } from '@angular/core';
import {AllModules as ModuleSet} from "../../assets/modules/AllModules";

@Injectable()
export abstract class ModuleService {

  public static modules: any[] = [];

  constructor() { ModuleService.init() }

  get modules(){
  	return ModuleService.modules;
  }

  public static init(){
	let modulearr = Object.keys(ModuleSet).map(function(module_name){ return {_name: module_name, _version: 0.1, _author: "Patrick"}}); 

    let sortFn = function(a, b){
      return a._name.toLowerCase().localeCompare(b._name.toLowerCase());
    }

    ModuleService.modules = modulearr.sort( sortFn );
  }

}
