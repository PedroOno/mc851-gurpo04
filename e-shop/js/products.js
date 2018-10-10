var api_produtos = "http://ec2-18-218-218-216.us-east-2.compute.amazonaws.com:8080/api";

$(function(){
    getProducts();
});

function getProducts(){
    $.ajax({
        type: "GET",
        url: api_produtos + "/products",
        data: {
            page: 1,
            itemsPerPage: 9,            
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + btoa("credito:JPfgvQd3"));
        },
      }).done(function(data){
        alert(data);
      }).fail(function(data)  {
        alert(data);
    }); 
}

function addProduct(){
    //cria clone do modelo de produto
    var stub = $("#productStub").clone();
    //tira o id de stub
    stub.removeAttr("id");
    //adiciona na lista de produtos
    stub.appendTo("#productsList");
    //torna o clone visivel
    stub.toggle();
}