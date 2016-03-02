'use strict';

module.exports = function(feather, opts){	
	var moduleName = feather.config.get('project.modulename');
	var DIR = (feather.config.env().get('component.dir') || 'components/').replace(/\/$/, '');

	if(moduleName == 'common'){
		feather.on('components:info', function(info){
			feather.commonInfo.components = info;
		});

		// feather.on('lookup:file', function(info, file){
		// 	if(!info.file){
		// 		info._rest = info.rest;
		// 	}
		// });

		require('fis3-hook-components')(feather, opts);
		
		// feather.on('lookup:file', function(info, file){
		// 	if(info.file && info.file.isComponent && info._rest){
		// 		feather.commonInfo.components[info._rest] = {
		// 			dir: DIR + '/' + info._rest,
		// 			fullName: info.file.id
		// 		};
		// 	}
		// });
	}else if(moduleName){
		var RULE = /^([0-9a-zA-Z\.\-_]+)(?:\/(.+))?$/;
		var componentInfo = feather.commonInfo.components, map = feather.commonInfo.map;

		require('fis3-hook-components')(feather, opts);

		feather.on('lookup:file', function(info, file){
			if(!info.file){
				var fullName = info.rest;

				if(!map[fullName]){
					var match = RULE.exec(info.rest);

					if(match){
						var cName = match[1], basename = match[2], component;

						if(component = componentInfo[cName]){
							fullName = DIR + '/' + cName + '/' + (basename ? basename : component.main);
						}

						info.rest = fullName;
					}
				}

				if(map[fullName]){
					var resolved = info.file = feather.file.wrap(fullName);
					resolved.url = '/' + fullName;
					resolved.id = fullName;
					resolved.setContent('');
					resolved.useHash = false;
					resolved.useDomain = false;
					resolved.useMap = false;
					resolved.useCompile = false;
					resolved.useCache = false;
					resolved.getUrl = function(){
						return resolved.url;
					};
					resolved.isFile = function(){
						return true;
					};
				}
			}
		});
	}
};