var total = 0;
var pac = 0;
var sedex = 0;
var json_endereco = {};

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

    $("#calc-frete").click(function(e){
        e.preventDefault();

        var valid = true;
        valid &= $("#cep").cleanVal().length == 8;
        valid &= $("#endereco").val().length > 0;
        valid &= $("#bairro").val().length > 0;
        valid &= $("#numero-casa").val().length > 0;
        valid &= $("#cidade").val().length > 0;
        valid &= $("#estado").val().length > 0;
        valid &= $("#referencia").val().length > 0;

        if(valid){
            $("#alert-cep").css("display", "none");
            json_endereco = {
                cep: $("#cep").cleanVal(),
                endereco: $("#endereco").val(),
                cidade: $("#cidade").val(),
                estado: $("#estado").val(),
                bairro: $("#bairro").val(),
                referencia: $("#referencia").val(),
                "numero-casa": $("#numero-casa").val(),
                complemento: $("#complemento").val(),
            }
            calculaFrete();
        }else{
            $("#alert-cep").css("display", "block");
        }
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

    $("#cep").mask("00000-000");
    $("#numero-cartao").mask("0000 0000 0000 0000");
    $("#vencimento-cartao").mask("00/00/0000");
    $("#ccv").mask("000");

    $("#botao-comprar").click(function(e){
        e.preventDefault();
        comprar();
    });

    createProductList();
});

function comprar(){
    var cartao = $("#payments-1").is(":checked"); //true: cartao, false: boleto

    if(cartao){
        var valid = true;
        valid &= $("#numero-cartao").cleanVal().length == 16;
        valid &= $("#vencimento-cartao").cleanVal().length == 8;
        valid &= $("#ccv").cleanVal().length == 3;
        valid &= $("#nome-cartao").val().length > 0;

        if(valid){
            $("#alert-cartao").css("display", "hidden");

            var credito = !$("#parcelas-0").is(":checked");
            var num_parcelas = 1;
            if($("#parcelas-2").is(":checked")){
                num_parcelas = 2;
            }
            if($("#parcelas-3").is(":checked")){
                num_parcelas = 3;
            }
            if($("#parcelas-4").is(":checked")){
                num_parcelas = 4;
            }
            var card_details = {
                "cpf_comprador": Cookies.getJSON("usuario").cpf,
                "numero_cartao": $("#numero-cartao").cleanVal(),
                "nome_cartao": $("#nome-cartao").val(),
                "cvv_cartao": $("#ccv").cleanVal(),
                "data_vencimento_cartao": $("#vencimento-cartao").val(),
                "credito": credito? "1" : "0",
                "num_parcelas": "" + num_parcelas,
                "data_emissao_pedido": moment().format("DD/MM/YYYY"),
            };

            $.ajax({
                type: "PUT",
                url: SITE_API_URL + "/comprar/cartao",
                data: {
                    "cart": Cookies.get("cart"),
                    "card_details": JSON.stringify(card_details),
                    "endereco": JSON.stringify(json_endereco)
                }
            }).always(function(data){
                console.log(data);
                clearCart();
                window.location.href = "./history.html";
            });
        }else{
            $("#alert-cartao").css("display", "block");
            $('body').scrollTo('#aba-pagamentos > div:nth-child(1)', 300);
        }
    }else{//boleto
        $.ajax({
            type: "PUT",
            url: SITE_API_URL + "/comprar/boleto",
            data: {
                "cart": Cookies.get("cart"),
                "cpf": Cookies.getJSON("usuario").cpf,
                "data": moment().format("DD/MM/YYYY"),
                "endereco": JSON.stringify(json_endereco)
            }
        }).always(function(data){
            console.log(data);
            clearCart();
            window.location.href = "./history.html";
        });
    }
}

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
      <td class=\"thumb\"><img src=\"" + image + "\" alt=\"\" style=\"width:60px;height:60px;\"></td>\
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
  if($("#cep") !== ""){
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
            $("#botao-comprar").css("display", "block");

            $('body').scrollTo('.shiping-methods > div:nth-child(1)', 300);
        },
        error: function(error){
            $("#alert-cep").css("display", "block");
        }
    });
  }
}
