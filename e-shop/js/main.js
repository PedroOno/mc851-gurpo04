var CLIENTS_API_URL = "http://ec2-18-231-28-232.sa-east-1.compute.amazonaws.com:3002";
var ENDERECOS_API_URL = "http://wsendereco.tk/api/enderecos";
var SITE_API_URL = "http://ec2-54-233-234-42.sa-east-1.compute.amazonaws.com:4000/api/v1";
var api_produtos = "http://ec2-18-218-218-216.us-east-2.compute.amazonaws.com:8080/api";

function verifyLogin(){
  var token = Cookies.get("token");
  if(token !== undefined){
      var email = token.split(":")[0];
      var usuario = Cookies.getJSON("usuario");
      if(usuario !== undefined){
          if(usuario.email === email){
              populateUserData(usuario);
              return;
          }
      }

      $.get( SITE_API_URL + "/cpf/" + email, function( data ) {
          var json = JSON.parse(data);
          if(json.status == 200){
              $.post( CLIENTS_API_URL + "/users/" + json.cpf, 
                      { tokenSessao : token }, function( data ) {

                  data.cpf = json.cpf;
                  Cookies.set("usuario", data);
                  populateUserData(data);
              });
          }
      });
  }
}

function populateUserData(usuario){
  var accountHeader = $(".header-account");
  if(accountHeader.length > 0){
    $("#userid").replaceWith("<a>Olá " + usuario.nome + "!</a>");
  }

  $("#headerconta").show();
  $("#minhaconta").show();
}

(function($) {
  "use strict"

  // NAVIGATION
  var responsiveNav = $('#responsive-nav'),
    catToggle = $('#responsive-nav .category-nav .category-header'),
    catList = $('#responsive-nav .category-nav .category-list'),
    menuToggle = $('#responsive-nav .menu-nav .menu-header'),
    menuList = $('#responsive-nav .menu-nav .menu-list');

  catToggle.on('click', function() {
    menuList.removeClass('open');
    catList.toggleClass('open');
  });

  menuToggle.on('click', function() {
    catList.removeClass('open');
    menuList.toggleClass('open');
  });

  $(document).click(function(event) {
    if (!$(event.target).closest(responsiveNav).length) {
      if (responsiveNav.hasClass('open')) {
        responsiveNav.removeClass('open');
        $('#navigation').removeClass('shadow');
      } else {
        if ($(event.target).closest('.nav-toggle > button').length) {
          if (!menuList.hasClass('open') && !catList.hasClass('open')) {
            menuList.addClass('open');
          }
          $('#navigation').addClass('shadow');
          responsiveNav.addClass('open');
        }
      }
    }
  });

  // HOME SLICK
  $('#home-slick').slick({
    autoplay: true,
    infinite: true,
    speed: 300,
    arrows: true,
  });

  // PRODUCTS SLICK
  $('#product-slick-1').slick({
    slidesToShow: 3,
    slidesToScroll: 2,
    autoplay: true,
    infinite: true,
    speed: 300,
    dots: true,
    arrows: false,
    appendDots: '.product-slick-dots-1',
    responsive: [{
        breakpoint: 991,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 480,
        settings: {
          dots: false,
          arrows: true,
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      },
    ]
  });

  $('#product-slick-2').slick({
    slidesToShow: 3,
    slidesToScroll: 2,
    autoplay: true,
    infinite: true,
    speed: 300,
    dots: true,
    arrows: false,
    appendDots: '.product-slick-dots-2',
    responsive: [{
        breakpoint: 991,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 480,
        settings: {
          dots: false,
          arrows: true,
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      },
    ]
  });

  // PRICE SLIDER
  var slider = document.getElementById('price-slider');
  if (slider) {
    noUiSlider.create(slider, {
      start: [1, 999],
      connect: true,
      tooltips: [true, true],
      format: {
        to: function(value) {
          return value.toFixed(0);
        },
        from: function(value) {
          return value
        }
      },
      range: {
        'min': 1,
        'max': 999
      }
    });
  }

})(jQuery);
