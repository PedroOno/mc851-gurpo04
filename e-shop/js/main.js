var CLIENTS_API_URL = "http://ec2-18-231-28-232.sa-east-1.compute.amazonaws.com:3002";
var ENDERECOS_API_URL = "http://wsendereco.tk/api/enderecos";
var SITE_API_URL = "http://ec2-54-233-234-42.sa-east-1.compute.amazonaws.com:4000/api/v1";
var api_produtos = "http://ec2-18-218-218-216.us-east-2.compute.amazonaws.com:8080/api";

var cart;

function loadCart(){
  if(Cookies.get("cart") === undefined){
    cart = {
      products: [
        // {
        //   image: "https://images-americanas.b2w.io/produtos/01/00/item/120277/0/120277055_1GG.png",
        //   id: "1232213213123",
        //   price: 123,
        //   name: "teste",
        //   quantity: 4
        // }
      ]
    };

    Cookies.set("cart", cart);
  }

  cart = Cookies.getJSON("cart");

  for(var i = 0; i < cart.products.length; i++){
    var product = cart.products[i];
    addToCart(product, false);
  }
}

function addToCart(item, updateCart){
  if(updateCart){
    for(var i = 0; i < cart.products.length; i++){
      if(cart.products[i].id === item.id){
        cart.products[i].quantity += item.quantity;
        Cookies.set("cart", cart);
        $("." + item.id + " .qty").html("x" + cart.products[i].quantity);
        updateCartValue();
        return;
      }
    }
  }

  var image = "";

  //imagens
  if(item.description.startsWith("{")){
    var json = item.description.replace(new RegExp("'", 'g'), "\"");
    var extras = JSON.parse(json);
    if(extras.images.length > 0){
        image = extras.images[0];
    }
  }

  var preco = item.onSale? item.promotionalValue : item.value;
  var url = "./product-page.html?id=" + item.id;

  var html = $.parseHTML("<div class=\"product product-widget " + item.id + "\">\
  <div class=\"product-thumb\">\
    <img src=\""+ image +"\" alt=\"\"/>\
  </div>\
  <div class=\"product-body\">\
    <h3 class=\"product-price\">R$" + preco.toFixed(2) + " <span class=\"qty\">x" + item.quantity + "</span></h3>\
    <h2 class=\"product-name\"><a href=\"" + url + "\">" + item.name + "</a></h2>\
  </div>\
  <button class=\"cancel-btn\"><i class=\"fa fa-trash\"></i></button>\
  </div>");
  $(".shopping-cart-list").append(html);

  if(updateCart){
    cart.products.push(item);
    Cookies.set("cart", cart);
  }

  var id = cart.products.length - 1;

  $("." + item.id + " button").click(function(){
    cart.products = jQuery.grep(cart.products, function(value) {
      return value != item;
    });

    Cookies.set("cart", cart);
    $("." + item.id).remove();

    updateCartValue();
  });

  updateCartValue();
}

function updateCartValue(){
  var total = 0;
  for(var i = 0; i < cart.products.length; i++){
    var product = cart.products[i];
    total += (product.onSale? product.promotionalValue : product.value) * product.quantity;
  }
  $(".header-cart .total-value").html("R$" + total.toFixed(2));
  $(".header-cart .total-qty").html(cart.products.length);
}

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
