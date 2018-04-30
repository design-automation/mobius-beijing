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
let ma_Math: IModule = ModuleUtils.createModule("ma_Math", mathjs/*TurfModelling["math"]*/, "attrib", undefined);
//let Togeojson: IModule = ModuleUtils.createModule("Togeojson", tj/*TurfModelling["math"]*/, "attrib", docs);
//let Properties: IModule = ModuleUtils.createModule("Properties", TurfModelling["properties"], "attrib", docs);

let io_Papaparse: IModule = ModuleUtils.createModule("io_Papaparse", papaparse, "attrib", undefined);
let io_Shapefile: IModule = ModuleUtils.createModule("io_Shapefile", shapefile, "attrib", undefined);


let ut_List: IModule = ModuleUtils.createModule("ut_List", GSS["list"], "attrib", docs);
let ut_String: IModule = ModuleUtils.createModule("ut_String", GSS["string"], "attrib", docs);

let gj_Aggregate: IModule = ModuleUtils.createModule("gj_Aggregate", TurfModelling["aggregate"], "attrib", undefined);
let gj_Assert: IModule = ModuleUtils.createModule("gj_Assert", TurfModelling["assert"], "attrib", undefined);
let gj_Bool: IModule = ModuleUtils.createModule("gj_Bool", TurfModelling["bool"], "attrib", undefined);
let gj_Classify: IModule = ModuleUtils.createModule("gj_Classify", TurfModelling["classify"], "attrib", undefined);
let gj_Convert: IModule = ModuleUtils.createModule("gj_Convert", TurfModelling["convert"], "attrib", undefined);
let gj_Coords: IModule = ModuleUtils.createModule("gj_Coords", TurfModelling["coords"], "attrib", undefined);
let gj_Create: IModule = ModuleUtils.createModule("gj_Create", TurfModelling["create"], "attrib", undefined);
let gj_Data: IModule = ModuleUtils.createModule("gj_Data", TurfModelling["data"], "attrib", undefined);
let gj_Grids: IModule = ModuleUtils.createModule("gj_Grids", TurfModelling["grids"], "attrib", undefined);
let gj_Ipolate: IModule = ModuleUtils.createModule("gj_Ipolate", TurfModelling["ipolate"], "attrib", undefined);
let gj_Joins: IModule = ModuleUtils.createModule("gj_Joins", TurfModelling["joins"], "attrib", undefined);
let gj_Measure: IModule = ModuleUtils.createModule("gj_Measure", TurfModelling["measure"], "attrib", undefined);
let gj_Meta: IModule = ModuleUtils.createModule("gj_Meta", TurfModelling["meta"], "attrib", undefined);
let gj_Misc: IModule = ModuleUtils.createModule("gj_Misc", TurfModelling["misc"], "attrib", undefined);
let gj_Random: IModule = ModuleUtils.createModule("gj_Random", TurfModelling["random"], "attrib", undefined);
let gj_Units: IModule = ModuleUtils.createModule("gj_Units", TurfModelling["units"], "attrib", undefined);
let gj_Xform: IModule = ModuleUtils.createModule("gj_Xform", TurfModelling["xform"], "attrib", undefined);


let gj_Collection: IModule = ModuleUtils.createModule("gj_Collection", mobiusgeojson["collection"], "attrib", undefined);
let gj_Feature: IModule = ModuleUtils.createModule("gj_Feature", mobiusgeojson["feature"], "attrib", undefined); 

// export {Turf};
export {ma_Math,  
		io_Papaparse, 
		io_Shapefile, 
	    ut_List, 
	    gj_Collection, gj_Feature,
		gj_Aggregate, gj_Assert, gj_Bool, gj_Classify, gj_Convert, gj_Coords, gj_Create, gj_Data, gj_Grids, gj_Ipolate, gj_Joins, gj_Measure, gj_Meta, gj_Misc, gj_Random, gj_Units, gj_Xform};

