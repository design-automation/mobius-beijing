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
let UT_Math: IModule = ModuleUtils.createModule("UT_Math", mathjs/*TurfModelling["math"]*/, "attrib", undefined);
//let Togeojson: IModule = ModuleUtils.createModule("Togeojson", tj/*TurfModelling["math"]*/, "attrib", docs);
//let Properties: IModule = ModuleUtils.createModule("Properties", TurfModelling["properties"], "attrib", docs);

let FL_Papaparse: IModule = ModuleUtils.createModule("FL_Papaparse", papaparse, "attrib", undefined);
let FL_Shapefile: IModule = ModuleUtils.createModule("FL_Shapefile", shapefile, "attrib", undefined);


let UT_List: IModule = ModuleUtils.createModule("UT_List", GSS["list"], "attrib", docs);

let TF_Aggregate: IModule = ModuleUtils.createModule("TF_Aggregate", TurfModelling["aggregate"], "attrib", undefined);
let TF_Assert: IModule = ModuleUtils.createModule("TF_Assert", TurfModelling["assert"], "attrib", undefined);
let TF_Bool: IModule = ModuleUtils.createModule("TF_Bool", TurfModelling["bool"], "attrib", undefined);
let TF_Classify: IModule = ModuleUtils.createModule("TF_Classify", TurfModelling["classify"], "attrib", undefined);
let TF_Convert: IModule = ModuleUtils.createModule("TF_Convert", TurfModelling["convert"], "attrib", undefined);
let TF_Coords: IModule = ModuleUtils.createModule("TF_Coords", TurfModelling["coords"], "attrib", undefined);
let TF_Create: IModule = ModuleUtils.createModule("TF_Create", TurfModelling["create"], "attrib", undefined);
let TF_Data: IModule = ModuleUtils.createModule("TF_Data", TurfModelling["data"], "attrib", undefined);
let TF_Grids: IModule = ModuleUtils.createModule("TF_Grids", TurfModelling["grids"], "attrib", undefined);
let TF_Ipolate: IModule = ModuleUtils.createModule("TF_Ipolate", TurfModelling["ipolate"], "attrib", undefined);
let TF_Joins: IModule = ModuleUtils.createModule("TF_Joins", TurfModelling["joins"], "attrib", undefined);
let TF_Measure: IModule = ModuleUtils.createModule("TF_Measure", TurfModelling["measure"], "attrib", undefined);
let TF_Meta: IModule = ModuleUtils.createModule("TF_Meta", TurfModelling["meta"], "attrib", undefined);
let TF_Misc: IModule = ModuleUtils.createModule("TF_Misc", TurfModelling["misc"], "attrib", undefined);
let TF_Random: IModule = ModuleUtils.createModule("TF_Random", TurfModelling["random"], "attrib", undefined);
let TF_Units: IModule = ModuleUtils.createModule("TF_Units", TurfModelling["units"], "attrib", undefined);
let TF_Xform: IModule = ModuleUtils.createModule("TF_Xform", TurfModelling["xform"], "attrib", undefined);


let MJ_Collection: IModule = ModuleUtils.createModule("MJ_Collection", mobiusgeojson["collection"], "attrib", undefined);
let MJ_Feature: IModule = ModuleUtils.createModule("MJ_Feature", mobiusgeojson["feature"], "attrib", undefined); 

// export {Turf};
export {UT_Math,  
		FL_Papaparse, 
		FL_Shapefile, 
	    UT_List, 
	    MJ_Collection, MJ_Feature,
		TF_Aggregate, TF_Assert, TF_Bool, TF_Classify, TF_Convert, TF_Coords, TF_Create, TF_Data, TF_Grids, TF_Ipolate, TF_Joins, TF_Measure, TF_Meta, TF_Misc, TF_Random, TF_Units, TF_Xform};

