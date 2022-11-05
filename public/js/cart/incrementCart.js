function increment(d) {
  fetch(`/product/cart/${d}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: d }),
  })
    .then((res) => res.json())
    .then((data) => {
      const cartModal = document.getElementById("cartmodal");
      if (data.qty === true) {
        let itemc = document.getElementById(`${d}`);
        let itemprice = parseInt(document.getElementById(`price${d}`).value);
        let totalPrice = parseInt(
          document.getElementById("totalAmount").innerHTML
        );
        document.getElementById("totalAmount").innerHTML = data.bill;
        document.getElementById("cartPrice").innerHTML = data.bill;
        let itemquantity = parseInt(itemc.innerHTML) + 1;
        itemc.innerHTML = itemquantity;
        cartModal.innerHTML =
          '<p class="text-center">Item Quantity Increased</p>';
        setTimeout(() => {
          cartModal.innerHTML = "";
        }, 3000);
      } else {
        cartModal.innerHTML =
          '<p class="text-center text-danger">Something Went Wrong</p>';
        setTimeout(() => {
          cartModal.innerHTML = "";
        }, 3000);
      }
    });
}
