const btnToAdd = document.getElementById('addToCart');
const product_qty = document.getElementById('product_qty');
const qty_btn = document.querySelectorAll('#qty_btn');
const product_stock = document.getElementById('product_stock');

const cart_id = document.getElementById('cart_id');
const product_id = document.getElementById('product_id');

let qty_interval;
let qty_btn_pressed_down = 0;

btnToAdd.addEventListener('click', ()=>{
    Swal.fire({
        title: 'Agregando producto al carrito',
        html: 'Aguarde unos momentos...',
        didOpen: () => {
            Swal.showLoading()
        
            fetch(`/api/carts/${cart_id.value}/product/${product_id.value}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  },
                body: JSON.stringify({qty:Number(product_qty.value)})
            })
                .then(res=>res.json())
                .then(data=>{
                    if(data.status === 'success'){
                        Swal.fire({
                            text: `Producto agregado al carrito.`,
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false
                        }).then(()=>{
                            location.href = '/';
                        })
                    }else if(data.status === 'error'){
                        let text;
        
                        if(!!data.message){
                            text = data.message;
                        }else{
                            text = 'No se pudo agregar el producto a su carrito, solo usuarios pueden realizar esta funcion.';
                        }
        
                        Swal.fire({
                            text,
                            icon: 'warning'
                        })
                    }
                })
        }
    })
})

qty_btn.forEach(btn=>{
    btn.addEventListener('click', evt=>{
        handleQtyBtns(btn.getAttribute('operation'));
    })

    btn.addEventListener('mousedown', evt=>{
        qty_interval = setInterval(() => {
            if(qty_btn_pressed_down < 4){
                handleQtyBtns(btn.getAttribute('operation'));
                qty_btn_pressed_down++;
            }else{
                clearInterval(qty_interval);
                qty_interval = setInterval(() => {
                    handleQtyBtns(btn.getAttribute('operation'));
                }, 100);
            }
        }, 500);
    })
})

document.addEventListener('mouseup', evt=>{
    clearInterval(qty_interval);
    qty_btn_pressed_down = 0;
})


function handleQtyBtns(operation){
    let newValue;
    if(operation === 'plus'){
        newValue = Number(product_qty.value)+1;
        product_qty.value = (newValue > product_stock.innerText) ? product_stock.innerText : newValue;
    }else if(operation === 'minus'){
        newValue = Number(product_qty.value)-1;
        product_qty.value = (newValue < 1) ? 1 : newValue;
    }
}