
(function ($) {
    "use strict";

    function doLogin(){
        $('.alert').css("display", "none");

        var email = $("#email").val();
        var password = $("#password").val();

        $.ajax({
            type: "POST",
            url: CLIENTS_API_URL + "/login",
            contentType : "application/json",
            data: JSON.stringify({ email: email, senha: password }),
            success: function(data){
                Cookies.set('token', data.sessionToken, { expires: 7 });
                alert("token setado: " + data.sessionToken);
                window.location.href = "./products.html";
            },
            error: function(error){
                $('.alert').css("display", "block");
            },
        });
    }

    /*==================================================================
    [ Validate ]*/
    var input = $('.validate-input .input100');

    $('.validate-form').on('submit', function(){
        var check = true;

        for(var i=0; i<input.length; i++) {
            if(validate(input[i]) == false){
                showValidate(input[i]);
                if(check == true){
                    input[i].focus();
                }
                check=false;
            }
        }

        if(check){
            doLogin();
        }

        return false;
    });


    $('.validate-form .input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });

    function validate (input) {
        if($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        }
        else {
            if($(input).val().trim() == ''){
                return false;
            }
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }

    /*==================================================================
    [ Show pass ]*/
    var showPass = 0;
    $('.btn-show-pass').on('click', function(){
        if(showPass == 0) {
            $(this).next('input').attr('type','text');
            $(this).find('i').removeClass('fa-eye');
            $(this).find('i').addClass('fa-eye-slash');
            showPass = 1;
        }
        else {
            $(this).next('input').attr('type','password');
            $(this).find('i').removeClass('fa-eye-slash');
            $(this).find('i').addClass('fa-eye');
            showPass = 0;
        }

    });


})(jQuery);
