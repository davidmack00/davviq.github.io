// duit.js - Direct UI Templates (requires jQuery)

$(function () {
	duitInitialize();
});

function duitInitialize() {

	// find all the placeholders
	var placeholders = $("[data-duit]");

	// put the templates in the placeholders with data
	placeholders.each(function () {
		var curr = $(this),
            duitData = curr.data('duit'),
            currData = duitData.data;

		// find the related template and turn it into a string
		var currTmpl = $('#' + duitData.tmpl).text().replace(/\r?\n|\r/g," ").replace(/ +/g, " ");

		function setData(obj) {

            // called with every property and it's value
            function process(key,value) {

            	var re = '<!-- duit-loop ' + key + ' -->(.*)<!-- /duit-loop ' + key + ' -->';

            	// if it's an array, need to make a new sub tree search
                if (Array.isArray(value)) {

                    //make a copy of the mini-template
                    var mini = currTmpl.match(re),
                    	miniSrc = mini[0], // with the selectors
                    	miniTmpl = mini[1]; // the mini template

                	$.each(value, function () {
            		//for (var i in value) {
                		traverse(this, process);

                		// add a copy of the mini template to the string
                		var existingTmpl = currTmpl.match(re)[1],
            			NewMini = existingTmpl + miniTmpl;

                		currTmpl = currTmpl.replace(existingTmpl, NewMini);
                		//console.log((currTmpl));
                	});

                	// remove the last copy
                	currTmpl = currTmpl.replace(miniTmpl, "");

                	// remove the parent array bits
                	var existingTmpl = currTmpl.match(re);
        			currTmpl = currTmpl.replace(existingTmpl[0], existingTmpl[1]);
        			//console.log((currTmpl));
                }

                // replace the key in the template with the value in the data
                else {
					currTmpl = currTmpl.replace(new RegExp('{{' + key + '}}','g'), value);
					//console.log((currTmpl));
                }

                //cleanup empty data sets
                // var blankTmpl = currTmpl.match(re);
                // if (blankTmpl) {
                // 	currTmpl = currTmpl.replace(blankTmpl[0], "");
                // }
                // else {}
            }

            function traverse(o,func) {
                for (var i in o) {
                    func.apply(this,[i,o[i]]);  
                    // if (o[i] !== null && typeof(o[i])=="object") {
                    //     // going on step down in the object tree!!
                    //     traverse(o[i],func);
                    // }
                }
            }

            traverse(obj, process);            
		}

		function replaceHTML(html) {
			// replace the placeholder with the data'd template
			curr.replaceWith($.parseHTML(html));
		}
		
		// if template is to be used multiple times as an array
		if ($.isArray(currData)) {
			var tmplCopy = currTmpl;
			currTmpl = "";

			// loop through each sub item (one template per item)
			$.each(currData, function () {
				currTmpl = currTmpl + tmplCopy;
				setData(this);
			});
			replaceHTML(currTmpl);
		}

		// if template is to be used as one occurance
		else {
			setData(currData);
			replaceHTML(currTmpl);
		}
	});
}