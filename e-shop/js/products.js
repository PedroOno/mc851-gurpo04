$(function(){
    getProducts();
});

function getProducts(){
    var urlParams = new URLSearchParams(window.location.search);
    var nome = urlParams.get('nome');
    var categoria = urlParams.get('categoria');
    var marca = urlParams.get('marca');
    var pagina = urlParams.get('pagina');

    var data = {
        page: pagina == null? 0 : pagina,
        itemsPerPage: 9        
    }

    if(nome != null){
        data.name = nome;
    }

    if(categoria != null){
        data.category = categoria;
    }

    if(marca != null){
        data.manufacturer = marca; // <-- esse filtro nao funciona (problema da api deles)
    }

    $.ajax({
        type: "GET",
        url: api_produtos + "/products",
        data: data,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa("credito:JPfgvQd3"));
        },
        statusCode: {
            200: function(data) {
              for(var i = 0; i < data.content.length; i++){
                  var item = data.content[i];
                  if(item.availableToSell){
                    addProduct(item);
                  }
              }
            }
          }
    }); 
}

function addProduct(item){
    //cria clone do modelo de produto
    var stub = $("#productStub").clone();
    //tira o id de stub
    stub.removeAttr("id");

    var productUrl = "./product-page.html?id=" + item.id;

    //popula informacoes do produto
    //id
    stub.attr("prod-id", item.id);
    //nome
    stub.find(".product-name a").html(item.name);
    stub.find(".product-name a").attr("href", productUrl);
    //preco
    if(item.onSale){
        //preco em promocao
        stub.find(".product-price").html("R$" + item.promotionalValue.toFixed(2));
        //preco normal
        stub.find(".product-price").append(
            " <del class='product-old-price'>R$" + item.value.toFixed(2) + "</del>"
        );
        //tag de % off
        stub.find(".product-label span").html("Promoção");
        var percentOff = (1 - (item.promotionalValue / item.value)) * 100;
        stub.find(".product-label .sale").html("-" + Math.floor(percentOff) + "%");
        stub.find(".product-label").toggle();
        //tags.html("Promoção");
    }else{
        //sem promocao
        stub.find(".product-price").html("R$" + item.value.toFixed(2));
    }

    //imagens
    if(item.description.startsWith("{")){
        var json = item.description.replace(new RegExp("'", 'g'), "\"");
        var extras = JSON.parse(json);
        if(extras.images.length > 0){
            stub.find(".product-image").css("background-image", "url(" + extras.images[0] + ")");
        }
    }
    
    //botoes
    stub.find(".main-btn").click(function(){
        window.location.href = productUrl;
    });;

    stub.find(".add-to-cart").click(function(){
        item.quantity = 1;
        addToCart(item, true);
    });

    //adiciona na lista de produtos
    stub.appendTo("#productsList");
    //torna o clone visivel
    stub.toggle();
}