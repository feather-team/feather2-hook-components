'use strict';

var path = require('path');

function _findResource(name, map){
	if(map[name]){
		return name;
	}

	var extList = ['.js', '.jsx', '.coffee', '.css', '.sass', '.scss', '.less', '.html', '.tpl', '.vm'];

	for(var i = 0, len = extList.length; i < len; i++){
		var tmpName = name + extList[i];

		if(map[tmpName]){
			return tmpName;
		}
	}

	return;
}

function findResource(name, map){
	var info, list = [
		name,
		name + '/index',
		name + '/' + path.basename(name)
	];

	while(list.length){
		name = list.shift();

		if(info = _findResource(name, map)){
			break;
		}
	}

	return info;
}

module.exports = function(feather, opts){	
	var moduleName = feather.config.get('project.modulename');

	require('fis3-hook-components')(feather, opts);

	if(moduleName == 'common'){
		feather.on('components:info', function(info){
			feather.releaseInfo.components = info;
		});

		// feather.on('lookup:file', function(info, file){
		// 	if(!info.file){
		// 		info._rest = info.rest;
		// 	}
		// });

		
		
		// feather.on('lookup:file', function(info, file){
		// 	if(info.file && info.file.isComponent && info._rest){
		// 		feather.commonInfo.components[info._rest] = {
		// 			dir: DIR + '/' + info._rest,
		// 			fullName: info.file.id
		// 		};
		// 	}
		// });
	}else if(moduleName){
		var RULE = /^([0-9a-zA-Z\.\-_]+)(?:\/(.+))?\/?$/;
		var DIR = (feather.config.env().get('component.dir') || 'components/').replace(/^\/+|\/+$/, '');
		var componentInfo = feather.releaseInfo.components, map = feather.releaseInfo.map;

		feather.on('lookup:file', function(info, file){
			if(!info.file){
				var fullName = info.rest;

				if(!map[fullName]){
					var match = RULE.exec(info.rest);

					if(match){
						var cName = match[1], subpath = match[2], config = componentInfo[cName] || {};

						if(subpath){
							fullName = findResource(DIR + '/' + cName + '/' + subpath, map);
						}else{
							fullName = findResource(DIR + '/' + cName + '/' + (config.main || 'index'), map);

							if(!fullName){
								fullName = findResource(DIR + '/' + cName + '/' + cName, map);
							}
						}
					}
				}

				if(fullName && map[fullName]){
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

					info.rest = fullName;
				}
			}
		});
	}
};