import {ModuleUtils, IModule} from "../../app/base-classes/code/CodeModule";

//import * as GSS from "gs-modelling";
// import docs from "turf-modelling/docs_json/turf-modelling.json";

// import * as Turf from "turf-modelling";
// let Math: IModule = ModuleUtils.createModule("Math", Turf["math"], "attrib", docs);
// let Feature_Coll: IModule = ModuleUtils.createModule("Feature_Coll", Turf["feature_coll"], "attrib", docs);
// let Properties: IModule = ModuleUtils.createModule("Properties", Turf["properties"], "attrib", docs);
// let Measure: IModule = ModuleUtils.createModule("Measure", Turf["measure"], "attrib", docs);
// 


// export {Math, Feature_Coll, Properties, Measure};

import * as trf from "turf";
let Turf: IModule = ModuleUtils.createModule("Turf", trf, "attrib", undefined);

export {Turf};