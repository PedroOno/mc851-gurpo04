$(function(){
    var urlParams = new URLSearchParams(window.location.search);
    var pedido = JSON.parse(decodeURIComponent(urlParams.get('pedido')));
    var cart = JSON.parse(pedido.cart);

    for(var i = 0; i < cart.products.length; i++){
        var product = cart.products[i];
        addToFinalCart(product);
    }

    var card_details = JSON.parse(pedido.card_details);
    var pag_response = JSON.parse(pedido.pag_response);

    var pagamento = pedido.pag_type == 1? "Cartão de " : "Boleto Bancário";
    if(pedido.pag_type == 1){
        pagamento += card_details.credito == 1? "crédito em " + card_details.num_parcelas + "x" : "débito";
    }

    $("#metodo-pagamento").html(pagamento);
    $("#cod-pedido").html("SDZ" + pedido.id);
    $("#data-pedido").html(card_details.data_emissao_pedido);

    var endereco = JSON.parse(decodeURIComponent(pedido.endereco));
    $("#rua").html(endereco.endereco + ", nº" + endereco["numero-casa"]);
    $("#bairro").html(endereco.bairro);
    $("#cidade").html(endereco.cidade + "/" + endereco.estado);
    $("#cep").html(endereco.cep);

    logAPIAccess("pagamento");
    $.ajax({
        "async": true,
        "crossDomain": true,
        "url": "http://pagamento.4pmv2bgufu.sa-east-1.elasticbeanstalk.com/servico/busca_pedido",
        "method": "POST",
        "headers": {
          "Content-Type": "application/json",
        },
        "processData": false,
        "data": "{\n\t\"pk_pagamento\": " + pag_response.pk_pedido +"\n}"
    }).done(function (response) {
        $("#total-pedido").html("R$" + response.valor.toFixed(2));
    });

    if(pedido.status == 0){
        $("#status-pagamento").html("Processando Pedido");
    }

    if(pedido.status > 0){
        if(pedido.pag_type == 0){//boleto
            if(pag_response.status === true){
                if(pedido.status >= 2 && pedido.status != 99){
                    $("#status-pagamento").html("Boleto Pago");
                }else{
                    $("#status-pagamento").html("Aguardando Boleto: " + pag_response.num_boleto);
                }
            }else{
                $("#status-pagamento").html("<span style=\"color:red;\">Erro ao gerar boleto</span>");
            }
        }else{//cartao
            if(pag_response.pagamento === 1){
                $("#status-pagamento").html("Aprovado");
            }else{
                $("#status-pagamento").html("<span style=\"color:red;\">Recusado</span>");
            }
        }

        if(pedido.status >= 2 && pedido.status != 99){
            if(pedido.rastreio === null){
                $("#status-envio").html("Em Separação");
            }else{
                $("#status-envio").html("Enviado");
                $("#codigo-rastreio").html(pedido.rastreio);
                  
                logAPIAccess("logistica");
                $.ajax({
                    "crossDomain": true,
                    "url": "http://shielded-caverns-17296.herokuapp.com:80/search",
                    "method": "POST",
                    "headers": {
                      "Content-Type": "application/json",
                    },
                    "data": "{\n\t\"codigo\": \"" + pedido.rastreio + "\"\n}\t"
                }).done(function (response) {
                    var updates = response.query.updates;
                    var lastUpdate = updates[updates.length - 1];
                    var data = lastUpdate.date;
                    var desc = lastUpdate.string;
                    $("#tr-rastreio").after(
                        "<tr>\
                            <th class=\"empty\" colspan=\"3\"></th>\
                            <th>ÚLTIMA ATUALIZAÇÃO</th>\
                            <th colspan=\"2\">" + data + ": " + desc + "</th>\
                        </tr>");
                });
            }
        }
    }
});

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

    $("#carrinho").append(html);

    return total;
}
