// Direct UI (requires jQuery)

  //////////////////////////
 //  dui documentation:  //
//////////////////////////

//dui-id		names an element
//dui-toggle	toggles an element
//dui-enable	enables an element
//dui-disable	disasbles an element
//dui-pin		keeps an element active unlesss explicitly disabled
//dui-quiet		makes an element close on the next click

$(function() {
	duiInitialize();
});

function duiInitialize() {

	var duiFlag = false;
	if ($(".dui-active").length) {duiFlag = true;}
	else {duiFlag = false;}

	$(document).on('click', function(e) {

		//find all triggers
		var triggers = $("[dui-toggle], [dui-enable], [dui-disable]");

		//find if trigger is clicked
		if ($(e.target).closest(triggers).length) {

			//find the trigger
			var trigger = $(e.target).closest(triggers);
			var target = $();

			function duiAction(type) {

				if (trigger.is('[' + type + ']')) {

					var id = trigger.attr(type);

					//find target
					//not specified: the target is the parent
					if (!id.trim()) {
						target = trigger.parent();
					}

					//specified: the target is the matching dui-id element
					else {
						//set id to array of target ids
						var id = trigger.attr(type).split(" ");
						
						//build a string to then search for elements
						var str = "";

						//build the string from IDs
						$(id).each(function() {
							var curr = "[dui-id*='"+this+"'],";
							str = str + curr;
						});
						
						//get rid of the last comma
						str = str.slice(0,-1);
						target = $(str);
					}

					//perform action on target
					
					switch (type) {
						case "dui-toggle": target.toggleClass("dui-active");
                        break;
						case "dui-disable": target.removeClass("dui-active");
                        break;
						case "dui-enable": target.addClass("dui-active");
                        break;
					}
				}
			}

			duiAction("dui-toggle"); //first toggle
			duiAction("dui-disable"); //then disable
			duiAction("dui-enable"); //then enable

			//evaluate duiFlag
			if ($(".dui-active").length) {duiFlag = true;}
			else {duiFlag = false;}
		}


		if (duiFlag == true) {

			//find all active
			var active = $(".dui-active");

			//remove all active states except target, target's ancestors, ancestors, pins
			if (target) {
				var toRemove = active
				.not(target)
				.not(target.parents(".dui-active"))
				.not($(e.target).not("[dui-quiet]"))
				.not($(e.target).parents().not("[dui-quiet]"))
				.not("[dui-pin]");
			}

			else {
				var toRemove = active
			 	.not($(e.target).not("[dui-quiet]"))
				.not($(e.target).parents().not("[dui-quiet]"))
				.not("[dui-pin]");
			}

			toRemove.removeClass("dui-active");

			//re-evaluate duiFlag
			if ($(".dui-active").length) {duiFlag = true;}
			else {duiFlag = false;}
		}

		else {
			//console.log("no active duis");
		}
	});
};