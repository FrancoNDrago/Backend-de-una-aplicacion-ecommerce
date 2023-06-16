const register_form = document.getElementById('register_form');
const password = document.getElementById('password');
const btn_view_password = document.getElementById('btn_view_password');
const password_icon = document.getElementById('password_icon');

register_form.addEventListener('submit', evt=>{
    evt.preventDefault();

    Swal.fire({
        title: 'Registrando sus datos',
        html: 'Aguarde unos momentos...',
        didOpen: () => {
          Swal.showLoading()

          const data = new URLSearchParams();
          for (const pair of new FormData(evt.target)) {
              data.append(pair[0], pair[1]);
          }
      
          fetch('/api/sessions/register', {
              method: 'POST',
              body: new FormData(evt.target)
          })
              .then(res=>res.json())
              .then(data=>{
                  console.log(data);
                  if(data.status === 'error'){
                      location.href = `/register?validation=${data.message.valCode}`;
                  }else{
                      location.href = '/login?register=1';
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