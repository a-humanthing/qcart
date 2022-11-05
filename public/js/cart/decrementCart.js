function rdc(proid) {
  let qty = parseInt(document.getElementById(`${proid}`).innerHTML);
  if (qty > 1) {
    fetch("/product/reduceqty", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proid }),
    })
      .then((res) => res.json())
      .then((data) => {
        let itemc = document.getElementById(`${proid}`);
        let itemquantity = parseInt(itemc.innerHTML) - 1;
        itemc.innerHTML = itemquantity;

        document.getElementById("totalAmount").innerHTML = data.itembill;
        document.getElementById("cartPrice").innerHTML = data.itembill;
      })
      .catch((err) => console.log(err));
  } else {
    fetch(`/product/cart/remove/${proid}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proid }),
    })
      .then((res) => res.json())
      .then((data) => {
        window.location.reload();
      });
  }
}
