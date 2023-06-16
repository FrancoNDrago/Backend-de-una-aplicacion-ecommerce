const btn_change_rol = document.getElementById('btn_change_rol');
const user_id = document.getElementById('user_id').value;

change_rol.addEventListener('click', evt=>{
    Swal.fire({
        title: 'Cambiando rol de usuario',
        html: 'Aguarde unos momentos...',
        didOpen: () => {
            Swal.showLoading()

            fetch(`/api/users/premium/${user_id}`)
                .then(res=>res.json())
                .then(data=>{
                    console.log(data);
        
                    if(data.status === 'success'){
                        Swal.fire({
                            title:data.message,
                            icon: "success",
                            timer: 2000,
                            showConfirmButton: false
                        }).then(()=>{
                            location.reload();
                        })
                    }else if(data.status === 'error') {
                        Swal.fire({
                            text: data.message,
                            icon: 'error'
                        });
                    }
                })
        }
    })
})