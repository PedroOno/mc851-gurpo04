var total = 0;
var pac = 0;
var sedex = 0;

$(function(){
  $("#buscar-endereco").click(function(e){
    e.preventDefault();
    var usuario = Cookies.getJSON("usuario");

    $.get(CLIENTS_API_URL + "/users/" + usuario.cpf + "/addresses", function( data ) {
      if(data.length > 0){
        var endereco = data[0];
        $("#cep").val(endereco.cep);
        $("#endereco").val(endereco.rua);
        $("#bairro").val(endereco.bairro);
        $("#numero-casa").val(endereco.numeroCasa);
        $("#complemento").val(endereco.complemento);
        $("#cidade").val(endereco.cidade);
        $("#estado").val(endereco.estado);
        $("#referencia").val(endereco.referencia);

        calculaFrete();
      }
    });
  });

  $('input[type=radio][name=shipping]').change(function() {
      var frete = 0;
      if (this.id == 'shipping-1') {//sedex
          frete = sedex;
      }
      else if (this.id == 'shipping-2') {//pac
          frete = pac;
      }

      $("#valor-frete").html("R$" + frete.toFixed(2));
      $("#valor-total").html("R$" + (total + frete).toFixed(2));
  });

  createProductList();
});

function createProductList(){
  var cart = Cookies.getJSON("cart");

  total = 0;

  for(var i = 0; i < cart.products.length; i++){
    var product = cart.products[i];
    total += addToFinalCart(product);
  }

  $("#sub-total").html("R$" + total.toFixed(2));
}

function addToFinalCart(item){
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
  var total = item.quantity * preco;
  var url = "./product-page.html?id=" + item.id;

  var html = $.parseHTML(
    "<tr>\
      <td class=\"thumb\"><img src=\"" + image + "\" alt=\"\"></td>\
      <td class=\"details\">\
        <a href=\"" + url + "\">" + item.name + "</a>\
        <ul>\
          <li><span>Marca: " + item.manufacturer + "</span></li>\
        </ul>\
      </td>\
      <td class=\"price text-center\">R$" + preco.toFixed(2) + "</td>\
      <td class=\"qty text-center\">" + item.quantity + "</td>\
      <td class=\"total text-center\"><strong class=\"primary-color\">R$" + total.toFixed(2) + "</strong></td>\
    </tr>"
  );

  $("#lista-produtos").append(html);

  return total;
}

function calculaFrete(){
    $.ajax({
        type: "POST",
        url: FRETE_API_URL,
        contentType: "application/x-www-form-urlencoded",
        data: {
            "CEP": $("#cep").val()
        },
        success: function(data){
            sedex = data.valor;
            pac = 1000;

            $("#precoPAC").html(pac.toFixed(2));
            $("#precoSEDEX").html(sedex.toFixed(2));

            var idFrete = $('input[name=shipping]:checked').attr("id");
            if(idFrete === 'shipping-1'){//sedex
              $("#valor-frete").html("R$" + sedex.toFixed(2));
              $("#valor-total").html("R$" + (total + sedex).toFixed(2));
            }else {//pac
              $("#valor-frete").html("R$" + pac.toFixed(2));
              $("#valor-total").html("R$" + (total + pac).toFixed(2));
            }

            // $("#precoPAC").html(data.pac);
            // $("#precoSEDEX").html(data.sedex);
            $('#aba-frete').css("display", "block");
            $('#aba-pagamentos').css("display", "block");
            $("#resumo").css("visibility", "visible");

        },
        error: function(error){
            $("#alert-cep").css("display", "block");
        }
    });
}
