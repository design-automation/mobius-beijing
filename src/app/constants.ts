export class Constants {
	public static get GALLERY_URL(): string 
		{ return "https://api.github.com/repos/design-automation/mobius-cesium/contents/src/assets/json-files?ref=master"; 
	};

	public static get FILE_URL(): string { 
			return "https://raw.githubusercontent.com/design-automation/mobius-cesium/master/src/assets/json-files/"
	};
}