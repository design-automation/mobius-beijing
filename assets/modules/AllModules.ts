import {ModuleUtils, IModule} from "../../app/base-classes/code/CodeModule";


import * as MMath from "mobius-math";
import * as MArray from "mobius-array";
import * as MTurf from "mobius-turf";
import * as MString from "mobius-string";
import * as MGeojson from "mobius-geojson";
import * as MCsv from "mobius-csv";

import turf_docs from "mobius-turf/docs_json/mobius-turf.json"; 
// let arr_Analyse: IModule = ModuleUtils.createModule("arr_Analyse", MArray["Analyse"], "attrib", undefined);
// 

;


let AllModules = [];
Object.keys(MArray).map(function(key){
	let pre = "arr_";
	let module: IModule = ModuleUtils.createModule( pre + key, MArray[key], "attrib", undefined);
	AllModules.push(module);
});

Object.keys(MCsv).map(function(key){
	let pre = "csv_";
	let module: IModule = ModuleUtils.createModule( pre + key, MCsv[key], "attrib", undefined);
	AllModules.push(module);
});


Object.keys(MTurf).map(function(key, index){
	let pre = "geo_";
	let module: IModule = ModuleUtils.createModule( pre + key, MTurf[key], "attrib", turf_docs);
	AllModules.push(module);
});

Object.keys(MGeojson).map(function(key){
	let pre = "geo_";
	let module: IModule = ModuleUtils.createModule( pre + key, MGeojson[key], "attrib", undefined);
	AllModules.push(module);
});


Object.keys(MMath).map(function(key){
	let pre = "math_";
	let module: IModule = ModuleUtils.createModule( pre + key, MMath[key], "attrib", undefined);
	AllModules.push(module);
});


Object.keys(MString).map(function(key){
	let pre = "str_";
	let module: IModule = ModuleUtils.createModule( pre + key, MString[key], "attrib", undefined);
	AllModules.push(module);
});


export {AllModules};

