const recover_form = document.getElementById('recover_form');
const message = document.getElementById('message');

recover_form.addEventListener('submit', (evt)=>{
    evt.preventDefault();

    const pass = document.getElementById('password').value;
    const re_pass = document.getElementById('re_password').value;

    if(pass !== re_pass) return message.innerText = 'Las contraseñas indicadas no coinciden, vuelva a intentar.';

    const timestamp = Number(document.getElementById('timestamp').value);
    const timestampData = new Date(timestamp);
    const hourDiff = new Date().getHours() - timestampData.getHours();
    const minutesDiff = (60 - timestampData.getMinutes()) + new Date().getMinutes();

    if(hourDiff > 1 || (hourDiff == 1 && minutesDiff > 60)){
        message.innerHTML = 'Se excedio el tiempo de recuperacion de contraseña, por favor vuelva a generar un mail haciendo click <a href="#" id="recover_btn">aquí</a>.';

        document.getElementById('recover_btn').addEventListener('click', evt=>{
            const email = document.getElementById('email').value;
        
            Swal.fire({
                title: 'Recuperacion de contraseña',
                html: 'Aguarde unos momentos...',
                didOpen: () => {
                  Swal.showLoading()
        
                  fetch(`/api/sessions/recover?email=${email}`)
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
        })
    }

    Swal.fire({
        title: 'Restableciendo contraseña',
        html: 'Aguarde unos momentos...',
        didOpen: () => {
          Swal.showLoading()

          const user = document.getElementById('user').value;
      
          fetch(`/api/sessions/recover`, {
              method: 'POST',
              body: new URLSearchParams({user, new_password: pass})
          })
              .then(res => res.json())
              .then(data=>{
                  if(data.status === 'success'){
                      window.location = '/login?validation=3';
                  }else{
                      message.innerText = data.message;
                  }
              })
        }
    })
})