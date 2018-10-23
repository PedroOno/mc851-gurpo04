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
});

function calculaFrete(){
    $.ajax({
        type: "POST",
        url: FRETE_API_URL,
        contentType: "application/x-www-form-urlencoded",
        data: {
            "CEP": $("#cep").val()
        },
        success: function(data){
            $("#precoPAC").html(data.valor);
            $("#precoSEDEX").html(data.valor);
            // $("#precoPAC").html(data.pac);
            // $("#precoSEDEX").html(data.sedex);
        },
        error: function(error){
            $("#alert-cep").css("display", "block");
        }
    });
}
