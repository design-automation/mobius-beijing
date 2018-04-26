import {IModule} from "./IModule";

export class ModuleUtils{

	static createModule(name: string, fn_list: any, helpname?: string, help?: any){

		let helpObj;
		if(help && help.children){
			helpObj = help.children.filter(function(child){
				 let name: string = child.name;
				 if(name.substr(1, name.length - 2)  == helpname){
				 	return true;
				 }
				 else{
				 	return false;
				 }
			})
		}

		let obj: IModule  =  {
			_name: name, 
			_version: 0.1, 
			_author: "Patrick",
			_helpObj: helpObj
		};

		for (let prop in fn_list){
			obj[prop] = fn_list[prop];
		}

		return obj;

	}

	static getModuleFromSet(ModuleSet, name: string){
		let imod;
		for(let key in ModuleSet){
			let mod = ModuleSet[key];

			if( key !== name){
				for(let prop in mod){
					let submod = mod[prop]; ;

					if(typeof(submod) == "function"){
						break;
					}

					if(prop == name && typeof(submod) == "object"){
						imod = this.createModule(prop, submod);
					}

				}

			}
			else{
				imod = this.createModule(key, mod);
			}
		}

		return imod;
	}

	static getName(mod: IModule): string{
		return mod["_name"];
	}

	static getAuthor(mod: IModule): string{
		return mod["_author"];
	}

	static getVersion(mod: IModule): string{
		return mod["_version"];
	}

	static isValid(mod: IModule): boolean{
		if(mod == undefined)
			return undefined;
		return !!(this.getName(mod) && this.getVersion(mod) && this.getAuthor(mod));
	}

	static isCompatible(mod1: IModule, mod2: IModule): boolean{
		if(mod1 == undefined || mod2 == undefined)
			return false;
		
		let _nameCheck: boolean = this.getName(mod1)  == this.getName(mod2);
		let _versionCheck: boolean = this.getVersion(mod1)  == this.getVersion(mod2);
		let _authorCheck: boolean = this.getAuthor(mod1)  == this.getAuthor(mod2);

		return _nameCheck  &&  _versionCheck && _authorCheck; 
	}

	
	static getParams(func: Function): {type: string, value: any}[]{

	 	let fnStr = func.toString().replace( /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '');
		let result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).split(",")//.match( /([^\s,]+)/g);
		if(result === null || result[0]==""){
		 	result = [];
		}

		let final_result = result.map(function(r){ 
			r = r.trim();
			let r_value = r.split("=");

			if (r_value.length == 1){
				return {type: r_value[0].trim(), value: r_value[0].trim()} 
			}
			else{
				return {type: r_value[0].trim(), value: r_value[1].trim()} 
			}

		});

		return final_result;
	}

	static getFunctions(mod: IModule): {name: string, module: string, def: Function}[]{

		// default names to exclude
		let fn: {name: string, module: string, def: Function}[] = [];
		let module_name = this.getName(mod);
		let fns = Object.getOwnPropertyNames(mod).filter(function(prop){ 
					return [ "length", "prototype", "name", "_name", "_author", "_version", "_helpObj", "_url"].indexOf(prop) == -1;
				});


		for(let f=0; f < fns.length; f++){
			let function_name = fns[f];
			
			// todo: why!?
			let func = mod[function_name];

			if( mod.hasOwnProperty( function_name )){

				if(typeof(func) == "function"){
					let obj = { name: function_name, 
								module: module_name,
								params: this.getParams( func ),
								def: func
							  }

					fn.push(obj);
				}

			}
			else{
				console.log("Discarded: ", func);
				continue;
			}
		}

		console.log(fn);

		return fn;
	};

}