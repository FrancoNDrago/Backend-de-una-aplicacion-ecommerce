const form_user_documents = document.getElementById('form_user_documents');
const user_id = document.getElementById('user_id').value;

form_user_documents.addEventListener('submit', evt=>{
    evt.preventDefault();

    let data = new URLSearchParams();

    for(const pair of new FormData(evt.target)) {
        data.append(pair[0], pair[1]);
    }

    Swal.fire({
        title: 'Cargando documentación',
        html: 'Aguarde unos momentos...',
        didOpen: () => {
            Swal.showLoading()

            fetch(`/api/users/${user_id}/documents`, {
                method: 'POST',
                body: new FormData(evt.target)
            })
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