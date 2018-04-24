import {ModuleUtils, IModule} from "../../app/base-classes/code/CodeModule";

//import * as GSS from "gs-modelling";
import docs from "turf-modelling/docs_json/turf-modelling.json";

// let Measure: IModule = ModuleUtils.createModule("Measure", Turf["measure"], "attrib", docs);
// 



import * as TurfModelling from "turf-modelling";
import * as trf from "turf";
let Feature_Coll: IModule = ModuleUtils.createModule("Feature_Coll", TurfModelling["feature_coll"], "attrib", docs);
let Math: IModule = ModuleUtils.createModule("Math", TurfModelling["math"], "attrib", docs);
let Properties: IModule = ModuleUtils.createModule("Properties", TurfModelling["properties"], "attrib", docs);
let Turf: IModule = ModuleUtils.createModule("Turf", trf, "attrib", undefined);

// export {Turf};
export {Math, Feature_Coll, Properties, Turf};