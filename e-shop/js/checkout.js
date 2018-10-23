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

  createProductList();
});

function createProductList(){
  var cart = Cookies.getJSON("cart");
  var total = 0;
  for(var i = 0; i < cart.products.length; i++){
    var product = cart.products[i];
    total += addToFinalCart(product);
  }

  var frete = 0;

  $("#valor-frete").html("R$" + frete.toFixed(2));
  $("#sub-total").html("R$" + total.toFixed(2));
  $("#valor-total").html("R$" + (total + frete).toFixed(2));
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
