const login_form = document.getElementById('login_form');
const recuperar_password = document.getElementById('recuperar_password');
const password = document.getElementById('password');
const btn_view_password = document.getElementById('btn_view_password');
const password_icon = document.getElementById('password_icon');

login_form.addEventListener('submit', evt=>{
    evt.preventDefault();

    Swal.fire({
        title: 'Loging in',
        html: 'Aguarde unos momentos...',
        didOpen: () => {
            Swal.showLoading()

            const data = new URLSearchParams();
            for (const pair of new FormData(evt.target)) {
                data.append(pair[0], pair[1]);
            }
        
            fetch('/api/sessions/login', {
                method: 'POST',
                body: data
            })
                .then(res=>res.json())
                .then(data=>{
                    if(data.status === 'error'){
                        location.href = `/login?validation=${data.message.valCode}`;
                    }else{
                        location.href = '/';
                    }
                })
        }
    })
})

recuperar_password.addEventListener('click', evt=>{
    Swal.fire({
        title: 'Recuperacion de contraseña',
        text: 'Ingrese su e-mail:',
        input: 'text',
        showCancelButton: true,
        confirmButtonText: 'Recuperar',
        cancelButtonText: 'Cancelar',
        preConfirm: (email) => {
            if(!!!email.length) Swal.showValidationMessage(`Debe indicar un email para la recuperación.`);
        },
    }).then((result) => {
        if(result.isConfirmed){
            Swal.fire({
                title: 'Recuperacion de contraseña',
                html: 'Aguarde unos momentos...',
                didOpen: () => {
                  Swal.showLoading()

                  fetch(`/api/sessions/recover?email=${result.value}`)
                    .then(res=>res.json())
                    .then(data=>{
                        console.log("RESPONSE: ", data);

                        if(data.status === 'success'){
                            Swal.fire({
                                title: 'Recuperacion de contraseña',
                                text: 'Se le ha enviado un mail a la dirección indicada para que pueda recuperar su contraseña',
                                icon: 'success'
                            })
                        }else{
                            Swal.close();
                        }
                    })
                }
            })
        }
    })
})

btn_view_password.addEventListener('click', evt=>{
    let newType;
    let icon;

    if(password.getAttribute('type') === 'password'){
        newType = 'text';
        icon = 'fa-sharp fa-solid fa-lg fa-eye-slash';
    }else{
        newType = 'password';
        icon = 'fa-solid fa-lg fa-eye';
    }

    password.setAttribute('type', newType);
    password_icon.classList = icon;
})