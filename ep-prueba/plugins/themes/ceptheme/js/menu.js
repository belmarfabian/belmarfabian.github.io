$("document").ready(function () {
  main();
});

var contador = 1;

function main() {
  $(".bt-menu").click(function () {
    if (contador == 1) {
      $(".bt-menu div").css("margin", "0");
      $(".bt-menu div:nth-child(1)").css("transform", "rotate(40deg)");
      $(".bt-menu div:nth-child(1)").css("top", "31px");
      $(".bt-menu div:nth-child(1)").css("margin-top", "23px");
      $(".bt-menu div:nth-child(2)").css("display", "none");
      $(".bt-menu div:nth-child(3)").css("transform", "rotate(138deg)");

      $("nav").animate({
        right: "0",
      });

      contador = 0;
    } else {
      $(".bt-menu div:nth-child(1)").css("transform", "rotate(0)");
      $(".bt-menu div:nth-child(1)").css("top", "5px");
      $(".bt-menu div:nth-child(2)").css("display", "block");
      $(".bt-menu div:nth-child(3)").css("transform", "rotate(0)");
      $(".bt-menu div").css("margin", "10px 0");

      contador = 1;

      $("nav").animate({
        right: "-100%",
      });
    }
  });
}
