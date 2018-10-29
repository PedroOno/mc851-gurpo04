
(function ($) {
    if(Cookies.get("usuario") !== undefined){
        window.location.href = "./products.html";
    }

    function doLogin(email, password, sendAddress){
        $('#alert-login').css("display", "none");

        if(email == null){
            email = $("#email").val();
        }

        if(password == null){
            password = $("#password").val();
        }

        $.get( SITE_API_URL + "/cpf/" + email, function( data ) {
            var json = JSON.parse(data);
            if(json.status == 200){
                $.ajax({
                    type: "POST",
                    url: CLIENTS_API_URL + "/login",
                    contentType : "application/json",
                    data: JSON.stringify({ email: email, senha: password }),
                    success: function(data){
                        Cookies.set('token', data.sessionToken, { expires: 7 });
                        console.log("token de login: " + data.sessionToken);
                        window.location.href = "./products.html";

                        if(sendAddress){
                          registerAddress(data.sessionToken);
                        }
                    },
                    error: function(error){
                        $('#alert-login').css("display", "block");
                    },
                });
            }else{
                $('#alert-login').css("display", "block");
            }
        });
    }

    function doRegister(){
        $('#alert-register').css("display", "none");
        $.ajax({
            type: "POST",
            url: CLIENTS_API_URL + "/register",
            contentType : "application/json",
            data: JSON.stringify({
                email: $("#email2").val(),
                senha: $("#password2").val(),
                cpf: $("#cpf").cleanVal(),
                nome: $("#nome").val(),
                dataDeNascimento: $("#nascimento").val(),
                telefone: $("#telefone").cleanVal(),
                idGrupo: 0
            }),
            success: function(data){
                registerAddress();
                registerOnSite();

                Cookies.set('token', data.registerToken, { expires: 7 });
                console.log("token de cadastro: " + data.registerToken);
                confirmRegister(data.registerToken);
            },
            error: function(error){
                $('#alert-register').css("display", "block");
            },
        });
    }

    $("#cpf").mask("000.000.000-00");
    $("#cep").mask("00000-000");
    $("#telefone").mask("(00)000000000");

    function registerAddress(sessionToken){
      $.ajax({
          type: "POST",
          url: CLIENTS_API_URL + "/addresses/" + $("#cpf").cleanVal() + "/add",
          contentType : "application/json",
          data: JSON.stringify({
              "tokenSessao": sessionToken,
              "cep": $("#cep").cleanVal(),
              "rua": $("#endereco").val(),
              "bairro": $("#bairro").val(),
              "numeroCasa": $("#numero-casa").val(),
              "complemento": $("#complemento").val(),
              "cidade": $("#cidade").val(),
              "estado": $("#estado").val(),
              "referencia": $("#referencia").val()
          }),
          success: function(data){
            console.log("endereco cadastrado. id: " + data.id);
          },
          error: function(error){
            console.log("nao foi possivel cadastrar endereco: " + error);
          },
      });
    }

    function registerOnSite(){
        $.ajax({
            type: "PUT",
            url: SITE_API_URL + "/cpf",
            data: {
                "email": $("#email2").val(),
                "cpf": $("#cpf").cleanVal(),
            },
            success: function(data){
                console.log("site register response: " + data);
            }
        });
    }

    function confirmRegister(registerToken){
        $.ajax({
            type: "POST",
            url: CLIENTS_API_URL + "/confirm",
            contentType : "application/json",
            data: JSON.stringify({
                registerToken: registerToken
            }),
            success: function(data){
                console.log(data.message);
                doLogin($("#email2").val(), $("#password2").val(), true);
            },
            error: function(error){
                $('#alert-register').css("display", "block");
            },
        });
    }

    $('#cep').change(function(){
        var cep = $(this).val();
        $.ajax({
            type: "GET",
            url: ENDERECOS_API_URL + "/cep/" + cep,
            contentType : "application/json",
            success: function(data){
                if(data.Endereco.length > 0){
                    var dados = data.Endereco[0];
                    $("#estado").val(dados.estado);
                    $("#cidade").val(dados.cidade);
                    $("#endereco").val(dados.logradouro);
                    $("#endereco").focus();
                }
            }
        });
    });

    /*==================================================================
    [ Validate ]*/

    var input_login = $('.validate-input-login .input100-login');
    var input_register = $('.validate-input-register .input100-register');

    $('.validate-form-login').on('submit', function(){
        var check = true;

        for(var i=0; i<input_login.length; i++) {
            if(validate(input_login[i]) == false){
                showValidate(input_login[i]);
                if(check == true){
                    input_login[i].focus();
                }
                check=false;
            }else{
                hideValidate(input_login[i]);
            }
        }

        if(check){
            doLogin(null, null, false);
        }

        return false;
    });

    $('.validate-form-register').on('submit', function(){
        var check = true;

        for(var i=0; i<input_register.length; i++) {
            if(validate(input_register[i]) == false){
                showValidate(input_register[i]);
                if(check == true){
                    input_register[i].focus();
                }
                check=false;
            }else{
                hideValidate(input_register[i]);
            }
        }

        if(check){
            doRegister();
        }

        return false;
    });

    $('.validate-form-login .input100-login').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });

    $('.validate-form-register .input100-register').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });

    function validate (input) {
        if($(input).val().trim() == ''){
            return false;
        }

        if($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        } else if($(input).attr('type') == 'date'){
            var dateString = $(input).val().trim();
            // First check for the pattern
            if(!/^\d{4}\-\d{1,2}\-\d{1,2}$/.test(dateString))
                return false;

            // Parse the date parts to integers
            var parts = dateString.split("-");
            var day = parseInt(parts[2], 10);
            var month = parseInt(parts[1], 10);
            var year = parseInt(parts[0], 10);

            // Check the ranges of month and year
            if(year < 1000 || year > parseInt(moment().format('YYYY'),10) || month == 0 || month > 12)
                return false;

            var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

            // Adjust for leap years
            if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
                monthLength[1] = 29;

            // Check the range of the day
            if(!(day > 0 && day <= monthLength[month - 1])){
                return false;
            }

            // Check if date is in the future
            if(moment().diff(moment([year, month - 1, day])) < 0)
                return false;

        }else if($(input).attr('type') == 'ncpf'){
            var strCPF = $(input).val().trim();
            strCPF = strCPF.replace(/[^\d]+/g,'');
            var Soma;
            var Resto;
            Soma = 0;
            if (strCPF.length != 11 ||
                strCPF === "00000000000" ||
                strCPF === "11111111111" ||
                strCPF === "22222222222" ||
                strCPF === "33333333333" ||
                strCPF === "44444444444" ||
                strCPF === "55555555555" ||
                strCPF === "66666666666" ||
                strCPF === "77777777777" ||
                strCPF === "88888888888" ||
                strCPF === "99999999999") return false;

            for (var i=1; i<=9; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (11 - i);
            Resto = (Soma * 10) % 11;

            if ((Resto == 10) || (Resto == 11))  Resto = 0;
            if (Resto != parseInt(strCPF.substring(9, 10)) ) return false;

            Soma = 0;
            for (var i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (12 - i);
            Resto = (Soma * 10) % 11;

            if ((Resto == 10) || (Resto == 11))  Resto = 0;
            if (Resto != parseInt(strCPF.substring(10, 11) ) ) return false;
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
