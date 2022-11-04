function addToCart(d){
    fetch(`/product/cart/${d}`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({id:d})
    })
    .then(res=>res.json())
    .then(data=>{
        const cartModal = document.getElementById('cartmodal');
        if(data.qty===true){
            cartModal.innerHTML='<p class="text-center">Item Quantity Increased</p>'
            setTimeout(() => {
                cartModal.innerHTML='';
            }, 3000);
        }
        else{
            const cartQty = document.getElementById('cartQty');
            cartQty.innerHTML++;

            cartModal.innerHTML='<p class="text-center">Item added to Cart</p>'
            setTimeout(() => {
                cartModal.innerHTML='';
            }, 3000);
        }
    })
}