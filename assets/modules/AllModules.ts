import {ModuleUtils, IModule} from "../../app/base-classes/code/CodeModule";

//import * as GSS from "gs-modelling";
import docs from "turf-modelling/docs_json/turf-modelling.json";

// let Measure: IModule = ModuleUtils.createModule("Measure", Turf["measure"], "attrib", docs);
// 



import * as TurfModelling from "turf-modelling";
import * as trf from "turf";
import * as papaparse from "papaparse";
import * as shapefile from "shpjs";
//import * as math from "mathjs";

var mathjs = require('mathjs');
//var tj = require('togeojson');

let Feature_Coll: IModule = ModuleUtils.createModule("Feature_Coll", TurfModelling["feature_coll"], "attrib", docs);
let Math: IModule = ModuleUtils.createModule("Math", mathjs/*TurfModelling["math"]*/, "attrib", docs);
//let Togeojson: IModule = ModuleUtils.createModule("Togeojson", tj/*TurfModelling["math"]*/, "attrib", docs);
let Properties: IModule = ModuleUtils.createModule("Properties", TurfModelling["properties"], "attrib", docs);
let Turf: IModule = ModuleUtils.createModule("Turf", trf, "attrib", undefined);
let Papaparse: IModule = ModuleUtils.createModule("Papaparse", papaparse, "attrib", undefined);
let Shapefile: IModule = ModuleUtils.createModule("Shapefile", shapefile, "attrib", undefined);

// export {Turf};
export {Feature_Coll, Properties, Turf, Math, Papaparse, Shapefile/*Togeojson*/};

