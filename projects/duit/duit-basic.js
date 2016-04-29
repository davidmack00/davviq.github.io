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
		var currTmpl = $('#' + duitData.tmpl).text();

		function setData(obj) {
            for (var key in obj) {
                // replace the key in the template with the value in the data
				currTmpl = currTmpl.replace(new RegExp('{{' + key + '}}','g'), obj[key]);
            }
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