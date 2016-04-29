$(function() {
  var shell = $("#shell");
  var questionButton = $(".question-button");

  //questionButton.click

  shell.on("click", ".question-button", function() {
    shell.addClass("answer open-bkg");
  });

  shell.on("click", ".cancel-answer", function() {
    shell.removeClass("answer open-bkg");
  });
});