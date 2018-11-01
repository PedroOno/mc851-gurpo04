function loadHistory(){
    var cpf = Cookies.getJSON("usuario").cpf;

    $.get( SITE_API_URL + "/pedidos/" + cpf, function( data ) {
        var html = "";
        for(var i = 0; i < data.length; i++){
            var pedido = data[i];
            var card_details = JSON.parse(pedido.card_details);
            var pag_response = JSON.parse(pedido.pag_response);
            var cart = JSON.parse(pedido.cart);

            var pagamento = pedido.pag_type == 1? "Cartão de " : "Boleto Bancário";
            if(pedido.pag_type == 1){
                pagamento += card_details.credito == 1? "crédito" : "débito";
            }

            var situacao = "Indeterminada";
            switch(pedido.status){
                case 0:
                    situacao = "Processando pagamento";
                    break;
                case 1:
                    if(pedido.pag_type == 1){//cartao
                        if(pag_response.pagamento == 1){
                            situacao = "Pagamento Aprovado";
                        }else{
                            situacao = "Pagamento Recusado";
                        }
                    }else{//boleto
                        if(pag_response.status === true){
                            //TODO: verificar situação do boleto
                            situacao = "<a href='#' style='color:blue;' onclick=\"alert('Número do boleto: " + pag_response.num_boleto + "')\">Aguardando Pagamento</a>";
                        }else{
                            situacao = "Boleto Inválido";
                        }
                    }
                    break;
                case 2:
                    situacao = "Envio Pendente";
                    break;
                case 3:
                    situacao = "Enviado";
                    break;
                case 99:
                    situacao = "Pedido Cancelado";
                    break;
            }

            var href = "./orders.html?pedido=" + encodeURIComponent(JSON.stringify(pedido));

            html += 
            "<tr>\
                <td><a style=\"color:blue;\" href=\"" + href + "\">SDZ" + pedido.id + "</a></td>\
                <td>" + card_details.data_emissao_pedido + "</td>\
                <td>" + pagamento + "</td>\
                <td>" + situacao + "</td>\
                <td>-</td>\
                <td>-</td>\
            </tr>"
        }

        $("#history-table").append(html);
    });
}