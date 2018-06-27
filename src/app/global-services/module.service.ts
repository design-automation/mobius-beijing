import { Injectable } from '@angular/core';
import { AllModules as ModuleSet } from "../../assets/modules/AllModules";
import { ModuleUtils } from "../base-classes/code/CodeModule"; 

@Injectable()
export class ModuleService {

  public static modules: any[] = [];

  constructor() { /*ModuleService.init()*/ }

  public static init(){
	  let modulearr = Object.keys(ModuleSet).map(function(module_name){ return {_name: module_name, _version: 0.1, _author: "Patrick"}}); 

    let sortFn = function(a, b){
      return a._name.toLowerCase().localeCompare(b._name.toLowerCase());
    }

    ModuleService.modules = modulearr.sort( sortFn );
  }

  get modules(){
    return ModuleService.modules;
  }

  load_modules(){
      // do something
      let module_set = [];
      let module_map = [];
      let moduleSet = module_set;
      let moduleMap = module_map;

      let self = this;
      ModuleSet.map(function(mod){
          let name: string = ModuleUtils.getName(mod);

          if(moduleMap[name] !== undefined){
            let fns = ModuleUtils.getFunctions(mod);
            let original_mod = moduleMap[name];

            for(let i=0; i < fns.length; i++){
              let f = fns[i];
              original_mod[f.name] = <Function>(f.def);
            }

          }
          else{
            moduleMap[name] = mod;
            moduleSet.push(mod);
          }
      })

      // sort the set
      module_set = module_set.sort(function(a, b){
        return a["_name"].toLowerCase().localeCompare(b["_name"].toLowerCase());
      })

      ModuleService.modules = module_set;
  }

}

    
