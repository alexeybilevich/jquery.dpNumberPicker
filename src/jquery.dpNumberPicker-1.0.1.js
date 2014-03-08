/*
	DP Number Picker jQuery Plugin, Version 1.0.1
	Copyright (C) Dustin Poissant 2014
	License CC BY-NC-SA 3.0 US
	http://creativecommons.org/licenses/by-nc-sa/3.0/us/
*/
;(function($){
	$.fn.dpNumberPicker = function(){
		var defaultOptions = {
			min: false,
			max: false,
			value: 0,
			step: 1,
			format: false,
			editable: true,
			addText: "+",
			subText: "-",
			formatter: function(val){return val;},
			beforeIncrease: function(){},
			afterIncrease: function(){},
			beforeDecrease: function(){},
			afterDecrease: function(){},
			beforeChange: function(){},
			afterChange: function(){},
			onMin: function(){},
			onMax: function(){}
		}
		var args = arguments;
		if(arguments.length > 0 && typeof(arguments[0]) == "string"){
			var args = arguments;
			var arg = args[0].toLowerCase();
			if(arg == "increase" || arg == "add" || arg == "addition" || arg == "incrament") this.each(function(){this.increase();});
			if(arg == "decrease" || arg == "sub" || arg == "subtract" || arg == "decrament") this.each(function(){this.decrease();});
			if(args.length > 1 && (arg=="change" || arg == "setvalue" || arg == "value" || arg == "set") ) this.each(function(){this.setValue(args[1]);});
			if(args.length > 1 && (arg=="update" || arg =="refresh") ) this.each(function(){this.update();});
			return this;
		} else if (arguments.length > 0 && typeof(arguments[0]) == "object"){
			this.each(function(){this.options = $.extend(defaultOptions, args[0]);});
		} else this.each(function(){this.options = defaultOptions;});
		this.each(function(){
			var element = this;
			var np = $(this);
			var s = "<div class='dp-numberPicker-sub'>"+element.options.subText+"</div><input type='text' class='dp-numberPicker-input'"
			if(!element.options.editable) s+= " disabled";
			if(element.options.format) s += " value='"+element.options.formatter.call(element, formatter(element.options.value, element.options.format))+"' ";
			else s += " value='"+element.options.formatter.call(element, element.options.value)+"' ";
			s += "' /><div class='dp-numberPicker-add'>"+element.options.addText+"</div>";
			np.addClass("dp-numberPicker").html(s);
			
			element.increase = function(){
				np.children().removeClass("disabled");
				var changed = false;
				var newValue = element.options.value+element.options.step;
				if( element.options.max!==false && element.options.max < newValue) newValue = element.options.max;
				if (newValue != element.options.value){
					element.options.beforeChange.call(element);
					element.options.beforeIncrease.call(element);
					changed = true;
				}
				if( element.options.max!==false && element.options.max == newValue){
					np.children(".dp-numberPicker-add").addClass("disabled");
					element.options.onMax.call(element);
				}
				element.options.value = newValue;
				element.update();
				if(changed) {
					element.options.afterChange.call(element);
					element.options.afterIncrease.call(element);
				}
				return this;
			};
			element.decrease = function(){
				np.children().removeClass("disabled");
				var changed = false;
				var newValue = element.options.value-element.options.step;
				if( element.options.min!==false && element.options.min > newValue) newValue = element.options.min;
				if (newValue != element.options.value){
					element.options.beforeChange.call(element);
					element.options.beforeDecrease.call(element);
					changed = true;
				}
				if( element.options.min!==false && element.options.min == newValue) {
					np.children(".dp-numberPicker-sub").addClass("disabled");
					element.options.onMin.call(element);
				}
				element.options.value = newValue;
				element.update();
				if(changed) {
					element.options.afterChange.call(element);
					element.options.afterDecrease.call(element);
				}
				return this;
			};
			element.setValue = function(value){
				np.children().removeClass("disabled");
				var changed = false;
				var increase = false;
				if( typeof(value) == "string") value = betterParseFloat(value);
				if(isNaN(value)) value = element.options.value;
				if(element.options.max!==false && element.options.max < value) value = element.options.max;
				if(element.options.min!==false && element.options.min > value) value = element.options.min;
				if(element.options.value > value) {
					element.options.beforeChange.call(element);
					element.options.beforeDecrease.call(element);
					changed = true;
				}
				if(element.options.value < value) {
					element.options.beforeChange.call(element);
					element.options.beforeIncrease.call(element);
					changed = true;
					increase = true;
				}
				if( element.options.max!==false && element.options.max == value) {
					np.children(".dp-numberPicker-add").addClass("disabled");
					element.options.onMax.call(element);
				}
				if( element.options.min!==false && element.options.min == value) {
					np.children(".dp-numberPicker-sub").addClass("disabled");
					element.options.onMin.call(element);
				}
				element.options.value = value;
				element.update();
				if(changed){
					element.options.afterChange();
					if(increase) element.options.afterIncrease.call(element);
					else element.options.afterDecrease.call(element);
				}
				return this;
			}
			element.update = function(){
				if(element.options.format && element.options.format.length > 0)
					np.children(".dp-numberPicker-input").val( element.options.formatter.call(element, formatter(element.options.value, element.options.format) ) );
				else np.children(".dp-numberPicker-input").val( element.options.formatter.call(element, element.options.value ) );
				return this;
			};
			np.children(".dp-numberPicker-add").on("click", function(){element.increase();});
			np.children(".dp-numberPicker-sub").on("click", function(){element.decrease();});
			np.children(".dp-numberPicker-input").on("change", function(){element.setValue(betterParseFloat( np.children(".dp-numberPicker-input").val()));});
		});
		function formatter(value, format){
			if(typeof(format) == "string" && format.length > 0){
				var pos = format.indexOf(".");
				if (pos == -1){
					var before = Math.floor(value).toString();
					while(before.length < format.length) before = "0"+before;
					return before;
				}
				var before = Math.floor(value).toString();
				while(before.length < pos) before = "0"+before;
				var after = Math.round((Math.round( Math.pow(10, (format.length-pos)-1) ))*(value-Math.floor(value))).toString();
				while(after.length < (format.length-pos)-1) after += "0";
				return before+"."+after;
			} else return value;
		};
		function betterParseFloat(string){
			while( isNaN( parseFloat(string) ) && string.length > 0) string = string.substring(1);
			return parseFloat(string);
		};
		return this;
	};
}(jQuery));

