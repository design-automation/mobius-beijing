import {ModuleUtils, IModule} from "../../app/base-classes/code/CodeModule";

import * as GSS from "gs-modelling";
import docs from "turf-modelling/docs_json/turf-modelling.json";

// let Measure: IModule = ModuleUtils.createModule("Measure", Turf["measure"], "attrib", docs);
// 
import * as TurfModelling from "turf-modelling";
import * as papaparse from "papaparse";
import * as shapefile from "shpjs";
//import * as math from "mathjs";

var mathjs = require('mathjs');
//var tj = require('togeojson');

//let Feature_Coll: IModule = ModuleUtils.createModule("Feature_Coll", TurfModelling["feature_coll"], "attrib", docs);
let Math: IModule = ModuleUtils.createModule("Math", mathjs/*TurfModelling["math"]*/, "attrib", undefined);
//let Togeojson: IModule = ModuleUtils.createModule("Togeojson", tj/*TurfModelling["math"]*/, "attrib", docs);
//let Properties: IModule = ModuleUtils.createModule("Properties", TurfModelling["properties"], "attrib", docs);

let Papaparse: IModule = ModuleUtils.createModule("Papaparse", papaparse, "attrib", undefined);
let Shapefile: IModule = ModuleUtils.createModule("Shapefile", shapefile, "attrib", undefined);


let List: IModule = ModuleUtils.createModule("List", GSS["list"], "attrib", docs);

let Aggregate: IModule = ModuleUtils.createModule("Aggregate", TurfModelling["aggregate"], "attrib", docs);
let Assert: IModule = ModuleUtils.createModule("Assert", TurfModelling["assert"], "attrib", docs);
let Bool: IModule = ModuleUtils.createModule("Bool", TurfModelling["bool"], "attrib", docs);
let Classify: IModule = ModuleUtils.createModule("Classify", TurfModelling["classify"], "attrib", docs);
let Convert: IModule = ModuleUtils.createModule("Convert", TurfModelling["convert"], "attrib", docs);
let Coords: IModule = ModuleUtils.createModule("Coords", TurfModelling["coords"], "attrib", docs);
let Create: IModule = ModuleUtils.createModule("Create", TurfModelling["create"], "attrib", docs);
let Data: IModule = ModuleUtils.createModule("Data", TurfModelling["data"], "attrib", docs);
let Grids: IModule = ModuleUtils.createModule("Grids", TurfModelling["grids"], "attrib", docs);
let Ipolate: IModule = ModuleUtils.createModule("Ipolate", TurfModelling["ipolate"], "attrib", docs);
let Joins: IModule = ModuleUtils.createModule("Joins", TurfModelling["joins"], "attrib", docs);
let Measure: IModule = ModuleUtils.createModule("Measure", TurfModelling["measure"], "attrib", docs);
let Meta: IModule = ModuleUtils.createModule("Meta", TurfModelling["meta"], "attrib", docs);
let Misc: IModule = ModuleUtils.createModule("Misc", TurfModelling["misc"], "attrib", docs);
let Random: IModule = ModuleUtils.createModule("Random", TurfModelling["random"], "attrib", docs);
let Units: IModule = ModuleUtils.createModule("Units", TurfModelling["units"], "attrib", docs);
let Xform: IModule = ModuleUtils.createModule("Xform", TurfModelling["xform"], "attrib", docs);

// export {Turf};
export {Math,  
		Papaparse, 
		Shapefile, 
	    List, 
		Aggregate, Assert, Bool, Classify, Convert, Coords, Create, Data, Grids, Ipolate, Joins, Measure, Meta, Misc, Random, Units, Xform};

