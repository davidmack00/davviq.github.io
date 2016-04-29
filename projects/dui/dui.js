// Direct UI (requires jQuery)

  //////////////////////////
 //  dui documentation:  //
//////////////////////////

// TRIGGER DUI ATTRIBUTES:
// dui-toggle	toggles an element
// dui-enable	enables an element
// dui-disable	disasbles an element

// TARGET DUI ATTRIBUTES:
// dui-id		names an element
// dui-pin		keeps an element active unlesss explicitly disabled
// dui-quiet	makes an element close on the next click

$(function() {

	var activeClass = "dui-active";

	var duiFlag,
		toRemove,
		triggerClickedFlag;

	var targetObjects = {},
		allHandlers = {};

	function evaluateFlag() {
		if ($(".dui-active").length) {duiFlag = true;}
		else {duiFlag = false;}
	}

	function clearActiveElements(element, targets) {

		evaluateFlag();

		if (duiFlag == true) {

			toRemove = $(".dui-active");

			//remove all active states except on the target and its ancestors, the event.target and it's ancestors, and pins
			if (targets) {
				toRemove = toRemove
					.not(targets)
					.not(targets.parents(".dui-active"))
			}

			toRemove = toRemove
				.not($(element).not("[dui-quiet]"))
				.not($(element).parents().not("[dui-quiet]"))
				.not("[dui-pin]");

			toRemove.removeClass("dui-active");

			//re-set duiFlag
			evaluateFlag();
		}
	}

	function setActions() {

		function findTargets(trigger, type) {
			if (trigger.is('[' + type + ']')) {

				var ids = trigger.attr(type),
					targets = $();

				//find targets
				if (!ids.trim()) {
					targets = trigger.parent();
				}

				else {
					var str = "";

					//set ids to array of target ids
					ids = trigger.attr(type).split(" ");

					//build the string from IDs
					$(ids).each(function() {
						var curr = "[dui-id*='"+this+"'],";
						str = str + curr;
					});

					//get rid of the last comma
					str = str.slice(0,-1);
					targets = $(str);
				}
				return targets;
			}
		}

		function getAllKeys(counter) {
			var toggleKey = "toggle-" + counter,
				disableKey = "disable-" + counter,
				enableKey = "enable-" + counter;

			return {toggleKey: toggleKey, disableKey: disableKey, enableKey: enableKey};
		}

		function actionHandler(element, targets) {
			var counter = element.attr("dui-dynamic-id");
			var allKeys = getAllKeys(counter);

			if (targetObjects[allKeys.toggleKey]) {targetObjects[allKeys.toggleKey].toggleClass(activeClass);}
			if (targetObjects[allKeys.disableKey]) {targetObjects[allKeys.disableKey].removeClass(activeClass);}
			if (targetObjects[allKeys.enableKey]) {targetObjects[allKeys.enableKey].addClass(activeClass);}
			
			clearActiveElements(element, targets);
			triggerClickedFlag = true;
		}
		
		var triggers = $("[dui-toggle], [dui-enable], [dui-disable]");

		var counter = 1;

		triggers.each(function() {
			var curr = $(this);
			
			var toggleTargets,
				disableTargets,
				enableTargets,
				allTargets,
				handlerName;

			toggleTargets = findTargets(curr, "dui-toggle");
			disableTargets = findTargets(curr, "dui-disable");
			enableTargets = findTargets(curr, "dui-enable");
			allTargets = $(toggleTargets).add($(disableTargets)).add($(enableTargets));

			var allKeys = getAllKeys(counter);
			if (toggleTargets) {targetObjects[allKeys.toggleKey] = toggleTargets;}
			if (disableTargets) {targetObjects[allKeys.disableKey] = disableTargets;}
			if (enableTargets) {targetObjects[allKeys.enableKey] = enableTargets;}

			curr.attr("dui-dynamic-id", counter)

			//build allHandlers object containing each handler
			handlerName = "handler-" + counter;
			allHandlers[handlerName] = function() {
				actionHandler(curr, allTargets);
			}

			//set event on the trigger
			curr.on('click', allHandlers[handlerName]);
			counter++;
		});
	}

	function removeHandlers() {

		var triggers = $("[dui-dynamic-id]");
		triggers.each(function() {
			var curr = $(this);
			var counter = curr.attr("dui-dynamic-id");

			curr.off("click", allHandlers["handler-" + counter]);
		});
	}

	function duiInitialize() {

		//set flag initial state
		evaluateFlag();

		//initialize triggers and targets
		setActions();

		//clear elements on a document click
		$(document).on('click', function(e) {
			if (!triggerClickedFlag) {
				clearActiveElements(e.target);
			}
			triggerClickedFlag = false;
		});

		//watch for DOM change
		var numberOfThings = $("[dui-toggle], [dui-enable], [dui-disable], [dui-id]").length;

		var observer = new MutationObserver(function(mutations) {
			var numberOfNewThings = $("[dui-toggle], [dui-enable], [dui-disable], [dui-id]").length;

			if (numberOfNewThings !== numberOfThings) {
				removeHandlers();
				targetObjects = {};
				allHandlers = {};
				setActions();

				numberOfThings = numberOfNewThings;
			}
		});

		var config = {childList: true, subtree: true};
		observer.observe(document, config);
	}

	duiInitialize();
});