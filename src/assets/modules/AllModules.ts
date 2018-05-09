import {ModuleUtils, IModule} from "../../app/base-classes/code/CodeModule";

let AllModules = [];

enum MODULE_KEY{
	MATH = "math",
	ARRAY = "arr",
	TURF = "geo", 
	STRING = "str",
	GEOJSON = "geo",
	CSV = "io"
}

const SPACER = "_";

// mobius-math module
import * as MMath from "mobius-math";
import math_docs from "mobius-math/docs_json/mobius-math.json"; 
Object.keys(MMath).map(function(submodule){
	let module: IModule = ModuleUtils.createModule( MODULE_KEY.ARRAY + SPACER + submodule, MMath[submodule], "attrib", math_docs);
	AllModules.push(module);
});


// mobius-array module
import * as MArray from "mobius-array";
import array_docs from "mobius-array/docs_json/mobius-array.json"; 
Object.keys(MArray).map(function(submodule){
	let module: IModule = ModuleUtils.createModule( MODULE_KEY.ARRAY + SPACER + submodule, MArray[submodule], "attrib", array_docs);
	AllModules.push(module);
});


// mobius-turf module
import * as MTurf from "mobius-turf";
import turf_docs from "mobius-turf/docs_json/mobius-turf.json"; 
Object.keys(MTurf).map(function(submodule){
	let module: IModule = ModuleUtils.createModule( MODULE_KEY.ARRAY + SPACER + submodule, MTurf[submodule], "attrib", turf_docs);
	AllModules.push(module);
});


// mobius-string module
import * as MString from "mobius-string";
import string_docs from "mobius-string/docs_json/mobius-string.json"; 
Object.keys(MString).map(function(submodule){
	let module: IModule = ModuleUtils.createModule( MODULE_KEY.ARRAY + SPACER + submodule, MString[submodule], "attrib", string_docs);
	AllModules.push(module);
});


// mobius-geojson module
import * as MGeojson from "mobius-geojson";
import geojson_docs from "mobius-geojson/docs_json/mobius-geojson.json"; 
Object.keys(MGeojson).map(function(submodule){
	let module: IModule = ModuleUtils.createModule( MODULE_KEY.ARRAY + SPACER + submodule, MGeojson[submodule], "attrib", geojson_docs);
	AllModules.push(module);
});


// mobius-csv module
import * as MCsv from "mobius-csv";
import csv_docs from "mobius-csv/docs_json/mobius-csv.json"; 
Object.keys(MCsv).map(function(submodule){
	let module: IModule = ModuleUtils.createModule( MODULE_KEY.ARRAY + SPACER + submodule, MCsv[submodule], "attrib", csv_docs);
	AllModules.push(module);
});


export {AllModules};

