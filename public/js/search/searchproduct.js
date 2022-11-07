function searchProduct(){
    const keyword = document.getElementById('inputSearch').value;
    fetch('/loadproduct/search',{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({keyword})
    })
    .then(res=>res.json())
    .then(data=>{
        if(data.notFound){
            alert('item not found')
        }else{
            const matchList = document.getElementById('searchmatch');
            matchList.innerHTML='';
            if(data.matchedProduct.length>0){
                for(let pro of data.matchedProduct){
                    matchList.innerHTML+=`<h3><a href="/product/${pro._id}" style="text-decoration:none" class="text-success">${pro.productname}</a></h3>`
                }
            }else{
                matchList.innerHTML+='<h1 class="text-danger">Match Not Found</h1>'
            }
        }
       

    })
}

function mSearchProduct(){
    const keyword = document.getElementById('inputMobileSearch').value;
    fetch('/loadproduct/search',{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({keyword})
    })
    .then(res=>res.json())
    .then(data=>{
        if(data.notFound){
            alert('item not found')
        }else{
            const matchList = document.getElementById('msearchmatch');
            matchList.innerHTML='';
            if(data.matchedProduct.length>0){
                for(let pro of data.matchedProduct){
                    matchList.innerHTML+=`<h3><a href="/product/${pro._id}" style="text-decoration:none" class="text-success">${pro.productname}</a></h3>`
                }
            }else{
                matchList.innerHTML+='<h3 class="text-danger">Match Not Found</h3>'
            }
        }
       

    })
}