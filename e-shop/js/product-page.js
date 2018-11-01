$(function(){
    var urlParams = new URLSearchParams(window.location.search);
    var id = urlParams.get('id');

    logAPIAccess("produto");
    $.ajax({
        type: "GET",
        url: api_produtos + "/products/" + id,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa("credito:JPfgvQd3"));
        },
        statusCode: {
            200: function(data) {
              applyProduct(data);
            },
            204: function(){
                window.location.href = "./products.html";
            }
          }
    });
});

function applyProduct(data){

    /*data = {
        "id": "3ac9c916-323f-4891-98c4-ebeeda60424f",
        "name": "Fogão de Piso Brastemp",
        "description": "{'images': ['https://images-americanas.b2w.io/produtos/01/00/item/120277/0/120277055_1GG.png']}",
        "weight": 82,
        "category": "ELETRODOMESTICO",
        "type": "Fogao",
        "manufacturer": "Brastemp",
        "quantityInStock": 10,
        "value": 950,
        "promotionalValue": null,
        "availableToSell": true,
        "onSale": false,
        "ownerGroup": "credito",
        "images": [],
        "creationDate": "2018-10-11",
        "updateDate": "2018-10-11",
        "lastModifiedBy": "credito"
    }*/

    //nome
    $(".detalhes .product-name").html(data.name);
    $(".breadcrumb .active").html(data.name);

    //categoria
    $("#categ").html(data.category);
    $("#categ").attr("href", "./products.html?categoria=" + data.category);

    //preco
    if(data.onSale){
        //preco em promocao
        $(".detalhes .product-price").html("R$" + data.promotionalValue.toFixed(2));
        //preco normal
        $(".detalhes .product-price").append(
            " <del class='product-old-price'>R$" + data.value.toFixed(2) + "</del>"
        );
        //tag de % off
        $(".detalhes .product-label span").html("Promoção");
        var percentOff = (1 - (data.promotionalValue / data.value)) * 100;
        $(".detalhes .product-label .sale").html("-" + Math.floor(percentOff) + "%");
        $(".detalhes .product-label").toggle();
        //tags.html("Promoção");
    }else{
        //sem promocao
        $(".detalhes .product-price").html("R$" + data.value.toFixed(2));
    }
    
    //marca
    $(".brand").html(data.manufacturer);

    //estoque
    $(".stock").html(data.quantityInStock);
    if(data.quantityInStock == 1){
        $(".stockS").hide();
    }

    //quantidade para compra
    $(".order-quantity").change(function(){
        var quantity = $(".order-quantity").val();
        var valid = false;
        if($.isNumeric(quantity)){
            quantity = Math.floor(quantity);
            quantity = Math.max(1, quantity);
            quantity = Math.min(data.quantityInStock, quantity);
            valid = true;
        }

        if(!valid){
            quantity = 1;
        }

        $(".order-quantity").val(quantity);
    });

    //adicionar ao carrinho
    if(data.quantityInStock > 0){
        $(".detalhes .add-to-cart").click(function(e){
            e.stopPropagation();
            data.quantity = parseInt($(".order-quantity").val());
            addToCart(data, true);
        });
    }else{
        $(".product-btns").remove();
    }

    //extras
    if(data.description.startsWith("{")){
        var json = data.description.replace(new RegExp("'", 'g'), "\"");
        var extras = JSON.parse(json);

        //descricao
        if(extras.desc !== undefined){
            $(".description").html(data.description.desc);
        }

        if(extras.images !== undefined){
            //imagens
            var append = "<div id=\"product-main-view\">";
            for(var i = 0; i < extras.images.length; i++){
                append += "<div class=\"product-view\">\
                                <img src=\"" + extras.images[i] + "\" alt=\"\">\
                        </div>";
            }
            append += "</div>";
            $("#gallery").append(append);
            $("body").append("<script>setupGallery(3)</script>");
        }
    }

    $(".afterload").fadeIn("slow");
}

function setupGallery(nslides){
    // PRODUCT DETAILS SLICK
    $('#product-main-view').slick({
        infinite: true,
        dots: true
    });
}