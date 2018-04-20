import {ModuleUtils, IModule} from "../../app/base-classes/code/CodeModule";

//import * as GSS from "gs-modelling";
import docs from "turf-modelling/docs_json/turf-modelling.json";

import * as Turf from "turf-modelling";
let Math: IModule = ModuleUtils.createModule("Math", Turf["math"], "attrib", docs);
let Model: IModule = ModuleUtils.createModule("Model", Turf["feature_coll"], "attrib", docs);
let Properties: IModule = ModuleUtils.createModule("Properties", Turf["properties"], "attrib", docs);
let Measure: IModule = ModuleUtils.createModule("Measure", Turf["measure"], "attrib", docs);

export {Math, Model, Properties, Measure};
