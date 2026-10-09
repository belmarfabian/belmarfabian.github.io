//FunciÃ³n para igualar el alto de columnas (con padding)
function equalOuterHeight(group) {
  console.log('rum')
  tallest = 0;
  group.each(function () {
    thisHeight = $(this).outerHeight();
    if (thisHeight > tallest) {
      tallest = thisHeight;
    }
  });
  group.outerHeight(tallest);
}
//FunciÃ³n para igualar el alto de columnas (con padding)
function equalOuterHeightResize(group) {
  group.removeAttr('style');   
  tallest = 0;
  group.each(function () {
    thisHeight = $(this).outerHeight();
    if (thisHeight > tallest) {
      tallest = thisHeight;
    }
  });
  group.outerHeight(tallest);
}
/*----- Tabs -----*/
var wizard;
function openTab(evt, tab) {
  var i, x, tablinks;

  x = document.getElementsByClassName("content-tab");

  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }

  tablinks = document.getElementsByClassName("tablink");

  for (i = 0; i < x.length; i++) {
    tablinks[i].className = tablinks[i].className.replace("active", "");
  }

  document.getElementById(tab).style.display = "flex";

  evt.currentTarget.className += " active";
}

$(".options-subscription .option").click(function () {
  $(".options-subscription .option").css("background-color", "#fff");

  $(this).css("background-color", "#FFD200");
});

/*----- Sliders -----*/
$(document).ready(function () {

  

  $('.search-full').click(function(e){
    if($('#advanced').hasClass('d-none') || $('#advanced').css('display')=='none'){
      $('#advanced').removeClass('d-none').css('display','block').css('opacity','0.2').animate({
        opacity: 1,
      }, {duration: 1000,});
    }
    else{
      $('#advanced').animate({opacity: 0,}, {duration: 1000,}).addClass('d-none').css('display','none');
    }
  })
  $( window ).resize(function() {
    equalOuterHeightResize($('.img-number'));
  });

  $(window).scroll(function() {
    /*if($(window).width() > 1180){
        if ($(this).scrollTop() > 0 ) {
        $('.menu-top').fadeOut();
        } else {
        $('.menu-top').fadeIn();
        }
    }*/
  });

  $('#load-more-videos').click(function(e){
    e.preventDefault();
    let lenguaje = $('html').attr('lang')
    let page = $(e.currentTarget).attr('data-page')
    page = parseInt(page);
    console.log(page)
    $.get('/ep-prueba/ep-datos/audiovisuales/video-'+page+'.json',function(data){
      if(data.length == 0){
        $(e.currentTarget).fadeOut();
      }
      else{
        $(e.currentTarget).attr('data-page', page+1)
        let title
        for(var i  in data){
          if(lenguaje=='es_ES'){title = data[i]._data.title.es_ES}
          else{title = data[i]._data.title.en_EN}
          $('.contentMoreVideos').append('<div class="StyleSingleItem itemVideo"><span class="tagCat">Videos</span><img src="'+data[i]._data.image_url+'" class="imgItem"><div class="contentDescripSingle"><h4>'+title+'</h4><p>DURACIÃ“N '+data[i]._data.duration+'</p><a href="/index.php/cep/audioVisuals/view/'+data[i]._data.id+'" class="view-more">Ver mÃ¡s <img src="/ep-prueba/plugins/themes/ceptheme/img/arrow-right-new.png" class="arrow-view-more"></a></div></div>')
        }        
      } 
    })
  })
  $('#load-more-podcast').click(function(e){
    e.preventDefault();
    let page = $(e.currentTarget).attr('data-page')
    page = parseInt(page);
    $.get('/ep-prueba/ep-datos/audiovisuales/podcast-'+page+'.json',function(data){
      if(data.length == 0){
        $(e.currentTarget).fadeOut();
      }
      else{
        $(e.currentTarget).attr('data-page', page+1)
        for(var i  in data){
          $('.PodcastItems .grid-column-4').append('<div class="PodcastItem">'+data[i]._data.iframe+'</div>')
        }        
      } 
    })
  })
  AOS.init();
  $(".slider-1").on("init", function (event, slick, direction) {
    if (!($(".slider-1 .slick-slide").length > 1)) {
      $(".slick-dots").hide();
    }
  });
  var $slider = $(".slider-1");
  if ($(".slider-1").length) {
    $(".slider-1")
      .slick({
        dots: false,
        speed: 300,
        arrows: true,
        autoplay: true,
        autoplaySpeed: 10000,
        pauseOnHover: false,
        pauseOnFocus: false,
        responsive: [
          {
            breakpoint: 851,
            settings: {
              arrows: false,
            },
          },
        ],
      })
      .on({
        afterChange: function (event, slick, nextSlide) {
          $(
            ".slick-current.slick-active .title, .slick-current.slick-active .description, .slick-current.slick-active a"
          ).addClass("aos-animate");
        },
      })
      .on({
        beforeChange: function (event, slick, currentSlide) {
          $(
            ".slider-1 .slide .title, .slider-1 .slide .description, .slider-1 .slide a"
          ).removeClass("aos-animate");
        },
      });
  }
  $(".slider-1.slick-initialized").css({
    opacity: "1",
    height: "auto",
  });
  equalOuterHeight($(".slider-1 .slide .content"));
  /*---------- Inicio ----------*/
  $(".slider-selection").slick({
    arrows: true,
    infinite: true,
    dots: false,
    draggable: false,
    slidesToShow: 3,
    slidesToScroll: 3,
    appendArrows: $(".arrows-slide2"),

    responsive: [
      {
        breakpoint: 1024,
        arrows: true,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },

      {
        breakpoint: 768,
        arrows: true,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  });
  $(".slider-most-read").slick({
    arrows: true,
    infinite: true,
    dots: false,
    draggable: false,
    slidesToShow: 4,
    slidesToScroll: 4, 
    appendArrows: $(".arrows-slide3"),

    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },

      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  });
  $(".slider-first").slick({
    arrows: true,
    infinite: true,
    dots: false,
    draggable: false,
    slidesToShow: 4,
    slidesToScroll: 4,
    autoplay: true,
    autoplaySpeed: 2000,
    appendArrows: $(".arrows-first"),

    responsive: [
      {
        breakpoint: 1024,
        settings: {
          draggable: true,
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },

      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  });

  wizard = $(".slider-steps").slick({
    arrows: true,
    infinite: true,
    dots: false,
    draggable: false,
    prevArrow: $("#btn-volver"),
    nextArrow: $("#btn-siguiente"),
    adaptiveHeight: true,
  });
  
  

  /*---------- NÃºmeros ----------*/
  $(".slider-numbers").slick({
    arrows: false,
    infinite: true,
    dots: false,
    draggable: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    appendArrows: $(".arrows-numbers"),

    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },

      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  });

  /*---------- Single NÃºmeros ----------*/
  var slidesToShow = 1;
  var childElements = $(".slider-notes").children().length;

  if (slidesToShow > childElements) {
    slidesToShow = childElements;
  }
  $(".slider-notes").slick({
    dots: false,
    infinite: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    // infinite: true,
    // dots: true,
    // draggable: false,
    // slidesToShow: 1,
    // slidesToScroll: 1,
    // arrows: false,
    // // slidesToScroll: 3,
    // appendArrows: $(".arrows-notes"),

    // responsive: [
    //   {
    //     breakpoint: 1024,
    //     settings: {
    //       slidesToScroll: 1,
    //       slidesToShow: 1,
    //     },
    //   },

    //   {
    //     breakpoint: 768,
    //     settings: {
    //       slidesToScroll: 1,
    //       slidesToShow: 1,
    //     },
    //   },
    // ],
  });

  // $(".slider-review").slick({
  //   arrows: true,
  //   infinite: true,
  //   dots: true,
  //   draggable: true,
  //   rows: 3,
  //   slidesPerRow: 1,
  //   appendArrows: $(".arrows-review"),
  // });

  /*---------- Suscribete ----------*/
  // $('.slider-steps').slick({
  //
  //   	arrows: true,
  //   	infinite: true,
  //   	dots: true,
  //   	draggable: false,
  //   	prevArrow: $('#btn-volver'),
  // 	nextArrow: $('#btn-siguiente')
  //
  // });
  $('.citation_formats_styles li a').click(function(e){
    e.preventDefault();
    var query=$(e.currentTarget).attr('data-json-href');

    $.get(query, function(data){
      $('.contentModal h3 span').text($(e.currentTarget).text())
      $('#staticModal').css('display', 'flex');
      $('.contentModal').append(data.content);
    })

  })
  $('.contentModal .remove_field').click(function(e){
    $('#staticModal').css('display', 'none');
    $('.contentModal .csl-bib-body').remove();
    $('.contentModal h3 span').text('')
  })
  $(".section-review button").on("click", function (e) {
    var href = $(this).attr("href");
    if (href != undefined && href != "") {
      window.open(href, "_self");
    }
  });
  $('.citation_formats_button').click(function(e){
    
    if($('.citation_formats_styles').css('display')=='none'){
      $('.citation_formats_styles').css('display','grid');
      $('.citation_formats_button span').text('-')
    }
    else{
      $('.citation_formats_styles').css('display','none');
      $('.citation_formats_button span').text('+')
    }
  })
  
  $(".galley-link").on("click", function (e) {
    var href = $(this).attr("href");
    if (href != undefined && href != "") {
      window.open(href, "_self");
    }
  });

  $("#subscriptions_individual_purchase").on("click", function (e) {
    var href = $(this).attr("href");
    if (href != undefined && href != "") {
      window.open(href, "_self");
    }
  });

  $(".last-number button").on("click", function (e) {
    var href = $(this).attr("href");

    if (href != undefined && href != "") {
      window.open(href, "_self");
    }
  });

  // var href = $(".section-review button").attr("href");
  // console.log(href);
});

$(".lenguaje span").on("click", function (e) {
  var href = $(this).attr("href");

  if (href != undefined && href != "") {
    window.open(href, "_self");
  }
});

$(".section-definitions .box-sections").on("click", function (e) {
  var href = $(this).attr("href");

  if (href != undefined && href != "") {
    window.open(href, "_self");
  }
});

$("#home .featured-article").on("click", function (e) {
  var href = $(this).attr("href");

  if (href != undefined && href != "") {
    window.open(href, "_self");
  }
});

$("span").on("click", function (e) {
  var href = $(this).attr("href");

  if (href != undefined && href != "") {
    window.open(href, "_self");
  }
});

$("[data-href]").on("click", function (e) {
  var href = $(this).attr("data-href");

  if (href != undefined && href != "") {
    window.open(href, "_self");
  }
});

// Compose information page
function composeInformationPageLayout() {
  var sidebar = $("#informacion .sidebar.desktop-sidebar");
  var firstSection = $("#informacion .section").first();
  var loginBox = $("#informacion .container-form");
  var articleSection = $("#informacion .section-articles");

  sidebar.appendTo(firstSection);
  loginBox.appendTo(articleSection);
}

composeInformationPageLayout();

function composeJournalPageLayout() {
  var sidebar = $("#revista .sidebar.desktop-sidebar");
  var firstSection = $("#revista .section").first();
  sidebar.appendTo(firstSection);
}

composeJournalPageLayout();

if ($(".registration_complete_actions").length > 0) {
  if (sessionStorage.getItem("selectedFormat")) {
    window.location = "/index.php/cep/about/subscriptions";
  }
  //
  // console.log(sessionStorage.getItem("selectedFormat"));
}

function onSubmitContact(e) {
  grecaptcha.ready(function () {
    grecaptcha
      .execute("6LfvK5wcAAAAAPpBZn0Q8Z3EDMIJJnFX3oRsiScr", { action: "submit" })
      .then(function (token) {
        document.getElementById("recaptcha").value = token;
        $("#form-contact").submit();
      });
  });
}
$(window).load(function(e){
  equalOuterHeight($('.img-number'));
  var heightElement = $('#secound-other-numbers > a:nth-child(2) > div > div').height();
  var heightElementImage = $('#secound-other-numbers > a:nth-child(1) > div > div > img').height();
  $('.box-last-number .last-number').height(heightElement);
  if($( window ).width()>550){
    $('.last-number .last-number-image .number-img').height(heightElement+60);
  }
  else{
    $('.last-number .last-number-image .number-img').height(heightElementImage);
  }
  
  if($('.StyleSingleItem').length<9){
    $('#load-more-videos').hide();
  }
  if($('.PodcastItem').length<3){
    $('#load-more-podcast').hide();
  }
  $('.content-spinner img').animate({width: 'toggle'}, {duration: 500,})
  $('.content-spinner .spinner').animate({width: 'toggle'}, {duration: 500,})
  $('.content-spinner').animate({width: 'toggle'}, {duration: 1000,})
})