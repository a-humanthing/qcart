function updateItems(subid){
    const checkbox = document.getElementById(`check${subid}`);
    if(checkbox.checked){
        fetch('/loadproducts/checkupdate',{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({subid})
        })
        .then(res=>res.json())
        .then(data=>{
            const product = data.updatedProducts;
            const container = document.getElementById('catItems');
            //container.innerHTML
            for(let pro of product){
    
                    container.innerHTML +=
                    '<div class="p-2 pb-3 mb-4 col-md-4">' +
                    '<div class="product-wap card rounded-0">' +
                    '<div class="card rounded-0">' +
                    `<a href="/product/${pro._id}"><img class="card-img rounded-0 content-cover" style="object-fit:cover;" width="225px" height="400px" src="${pro.image[0].url}" alt=""> </a>` +
                    '<div class="card-img-overlay rounded-0 product-overlay d-flex align-items-center justify-content-center">' +
                    '<ul class="list-unstyled">' +
                    `<form style="display: inline;" action="/product/wishlist/${pro._id}" method="post">` +
                    '<li><button type="submit" class="btn btn-success text-white"><i class="far fa-heart"></i></button></li>' +
                    "</form>" +
                    `<li><a class="btn btn-success text-white mt-2" href="/product/${pro._id}"><i class="far fa-eye"></i></a></li>` +
                    `<li><button  class="btn btn-success text-white mt-2" onclick="addToCart('${pro._id}')" ><i class="fas fa-cart-plus"></i></button></li>` +
                    "</ul>" +
                    "</div>" +
                    "</div>" +
                    '<div class="card-body">' +
                    `<p class="p-0 m-0 text-center"><a href="/product/${pro._id}" class="h3 text-decoration-none">${pro.productname}</a></p>` +
                    '<ul class="list-unstyled d-flex justify-content-center mb-1">' +
                    "<li></li>" +
                    "<li>" +
                    '<i class="text-warning fa fa-star"></i>' +
                    '<i class="text-warning fa fa-star"></i>' +
                    '<i class="text-warning fa fa-star"></i>' +
                    '<i class="text-warning fa fa-star"></i>' +
                    '<i class="text-muted fa fa-star"></i>' +
                    "</li>" +
                    "</ul>" +
                    `<p class="text-center mb-0">₹${pro.price}</p>` +
                    "</div>" +
                    "</div>" +
                    "</div>";
            }
        })
    }
    else{
        alert('no')
    }
    
}