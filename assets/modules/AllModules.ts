import {ModuleUtils, IModule} from "../../app/base-classes/code/CodeModule";

import * as GSS from "gs-modelling";
import docs from "turf-modelling/docs_json/turf-modelling.json";

// let Measure: IModule = ModuleUtils.createModule("Measure", Turf["measure"], "attrib", docs);
// 
import * as TurfModelling from "turf-modelling";
import * as papaparse from "papaparse";
import * as shapefile from "shpjs";
//import * as math from "mathjs";

import * as mobiusgeojson from "mobius-geojson"; 

let mathjs = require('mathjs');
//var tj = require('togeojson');

//let Feature_Coll: IModule = ModuleUtils.createModule("Feature_Coll", TurfModelling["feature_coll"], "attrib", docs);
let MA_Math: IModule = ModuleUtils.createModule("UT_Math", mathjs/*TurfModelling["math"]*/, "attrib", undefined);
//let Togeojson: IModule = ModuleUtils.createModule("Togeojson", tj/*TurfModelling["math"]*/, "attrib", docs);
//let Properties: IModule = ModuleUtils.createModule("Properties", TurfModelling["properties"], "attrib", docs);

let IO_Papaparse: IModule = ModuleUtils.createModule("IO_Papaparse", papaparse, "attrib", undefined);
let GJ_Shapefile: IModule = ModuleUtils.createModule("GJ_Shapefile", shapefile, "attrib", undefined);


let UT_List: IModule = ModuleUtils.createModule("UT_List", GSS["list"], "attrib", docs);
let UT_String: IModule = ModuleUtils.createModule("UT_String", GSS["string"], "attrib", docs);

let GJ_Aggregate: IModule = ModuleUtils.createModule("GJ_Aggregate", TurfModelling["aggregate"], "attrib", undefined);
let GJ_Assert: IModule = ModuleUtils.createModule("GJ_Assert", TurfModelling["assert"], "attrib", undefined);
let GJ_Bool: IModule = ModuleUtils.createModule("GJ_Bool", TurfModelling["bool"], "attrib", undefined);
let GJ_Classify: IModule = ModuleUtils.createModule("GJ_Classify", TurfModelling["classify"], "attrib", undefined);
let GJ_Convert: IModule = ModuleUtils.createModule("GJ_Convert", TurfModelling["convert"], "attrib", undefined);
let GJ_Coords: IModule = ModuleUtils.createModule("GJ_Coords", TurfModelling["coords"], "attrib", undefined);
let GJ_Create: IModule = ModuleUtils.createModule("GJ_Create", TurfModelling["create"], "attrib", undefined);
let GJ_Data: IModule = ModuleUtils.createModule("GJ_Data", TurfModelling["data"], "attrib", undefined);
let GJ_Grids: IModule = ModuleUtils.createModule("GJ_Grids", TurfModelling["grids"], "attrib", undefined);
let GJ_Ipolate: IModule = ModuleUtils.createModule("GJ_Ipolate", TurfModelling["ipolate"], "attrib", undefined);
let GJ_Joins: IModule = ModuleUtils.createModule("GJ_Joins", TurfModelling["joins"], "attrib", undefined);
let GJ_Measure: IModule = ModuleUtils.createModule("GJ_Measure", TurfModelling["measure"], "attrib", undefined);
let GJ_Meta: IModule = ModuleUtils.createModule("GJ_Meta", TurfModelling["meta"], "attrib", undefined);
let GJ_Misc: IModule = ModuleUtils.createModule("GJ_Misc", TurfModelling["misc"], "attrib", undefined);
let GJ_Random: IModule = ModuleUtils.createModule("GJ_Random", TurfModelling["random"], "attrib", undefined);
let GJ_Units: IModule = ModuleUtils.createModule("GJ_Units", TurfModelling["units"], "attrib", undefined);
let GJ_Xform: IModule = ModuleUtils.createModule("GJ_Xform", TurfModelling["xform"], "attrib", undefined);


let GJ_Collection: IModule = ModuleUtils.createModule("GJ_Collection", mobiusgeojson["collection"], "attrib", undefined);
let GJ_Feature: IModule = ModuleUtils.createModule("GJ_Feature", mobiusgeojson["feature"], "attrib", undefined); 

// export {Turf};
export {MA_Math,  
		IO_Papaparse, 
		GJ_Shapefile, 
	    UT_List, 
	    GJ_Collection, GJ_Feature,
		GJ_Aggregate, GJ_Assert, GJ_Bool, GJ_Classify, GJ_Convert, GJ_Coords, GJ_Create, GJ_Data, GJ_Grids, GJ_Ipolate, GJ_Joins, GJ_Measure, GJ_Meta, GJ_Misc, GJ_Random, GJ_Units, GJ_Xform};

