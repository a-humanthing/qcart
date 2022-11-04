let count =0;
    function loadProducts(count){
        fetch('/loadproduct/infinitescroll',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({count})
        })
        .then(res=>res.json())
        .then(data=>{
            console.log(data.filterP)
            const product=data.filterP;
            const container = document.getElementById('carousel-related-product');
            for(let pro of product){
            container.innerHTML+= '<div class="p-2 pb-3 mb-4 col-md-4">'

                        
                        +'<div class="product-wap card rounded-0">'
                         +'<div class="card rounded-0">'
                                    +`<a href="/product/${pro._id}"><img class="card-img rounded-0 content-cover" style="object-fit:cover;" width="225px" height="400px" src="${pro.image[0].url}" alt=""> </a>`
                                +'<div class="card-img-overlay rounded-0 product-overlay d-flex align-items-center justify-content-center">'
                                   +'<ul class="list-unstyled">'
                                        +`<form style="display: inline;" action="/product/wishlist/${pro._id}" method="post">`
                                            +'<li><button type="submit" class="btn btn-success text-white"><i class="far fa-heart"></i></button></li>'
                                        +'</form>'
                                        +`<li><a class="btn btn-success text-white mt-2" href="/product/${pro._id}"><i class="far fa-eye"></i></a></li>`
                                        +`<li><button  class="btn btn-success text-white mt-2" onclick="addToCart('${pro._id}')" ><i class="fas fa-cart-plus"></i></button></li>`
                                    +'</ul>'
                                +'</div>'
                            +'</div>'
                            +'<div class="card-body">'
                                +`<p class="p-0 m-0 text-center"><a href="/product/${pro._id}" class="h3 text-decoration-none">${pro.productname}</a></p>`
                                
                               +'<ul class="list-unstyled d-flex justify-content-center mb-1">'
                                    +'<li></li>'
                                    +'<li>'
                                        +'<i class="text-warning fa fa-star"></i>'
                                        +'<i class="text-warning fa fa-star"></i>'
                                        +'<i class="text-warning fa fa-star"></i>'
                                        +'<i class="text-warning fa fa-star"></i>'
                                        +'<i class="text-muted fa fa-star"></i>'
                                    +'</li>'
                                +'</ul>'
                                +`<p class="text-center mb-0">₹${pro.price}</p>`
                            +'</div>'
                        +'</div>'
                   
                    +'</div>'
                            }
        })
        .catch(e=>{
            console.log('e',e);
        })
        
    }
    
    window.onload=(e)=>{
        const baseCount=3;
        fetch('/loadproduct',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({baseCount})
        })
        .then(res=>res.json())
        .then(data=>{
            const products = data.baseLoad;
            const container = document.getElementById('carousel-related-product');
            for(let pro of products){
            container.innerHTML+= '<div class="p-2 pb-3 mb-4 col-md-4">'

                        
                        +'<div class="product-wap card rounded-0">'
                         +'<div class="card rounded-0">'
                                    +`<a href="/product/${pro._id}"><img class="card-img rounded-0 content-cover" style="object-fit:cover;" width="225px" height="400px" src="${pro.image[0].url}" alt=""> </a>`
                                +'<div class="card-img-overlay rounded-0 product-overlay d-flex align-items-center justify-content-center">'
                                   +'<ul class="list-unstyled">'
                                        +`<form style="display: inline;" action="/product/wishlist/${pro._id}" method="post">`
                                            +'<li><button type="submit" class="btn btn-success text-white"><i class="far fa-heart"></i></button></li>'
                                        +'</form>'
                                        +`<li><a class="btn btn-success text-white mt-2" href="/product/${pro._id}"><i class="far fa-eye"></i></a></li>`
                                        
                                        +`<li><button  class="btn btn-success text-white mt-2" onclick="addToCart('${pro._id}')" ><i class="fas fa-cart-plus"></i></button></li>`
                                    
                                    +'</ul>'
                                +'</div>'
                            +'</div>'
                            +'<div class="card-body">'
                                +`<p class="p-0 m-0 text-center"><a href="/product/${pro._id}" class="h3 text-decoration-none">${pro.productname}</a></p>`
                                
                               +'<ul class="list-unstyled d-flex justify-content-center mb-1">'
                                    +'<li></li>'
                                    +'<li>'
                                        +'<i class="text-warning fa fa-star"></i>'
                                        +'<i class="text-warning fa fa-star"></i>'
                                        +'<i class="text-warning fa fa-star"></i>'
                                        +'<i class="text-warning fa fa-star"></i>'
                                        +'<i class="text-muted fa fa-star"></i>'
                                    +'</li>'
                                +'</ul>'
                                +`<p class="text-center mb-0">₹${pro.price}</p>`
                            +'</div>'
                        +'</div>'
                   
                    +'</div>'
                                    }
        })
    }
    
    window.addEventListener('scroll',()=>{
            if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight){
                count++;
                loadProducts(count)
            }
        })