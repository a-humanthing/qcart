let dPrice;
let dCode;
const form = document.querySelector("#couponForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const code = document.getElementById("couponCode").value;
  const userid = document.getElementById("useridhidden").value;
  fetch("/product/coupon", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, userid }),
  })
    .then((res) => res.json())
    .then((data) => {
      dPrice = data.offerPrice;
      dCode = data.code;
      if (data.isVerified) {
        if (data.newToCoupon) {
          document.getElementById("couponStatus").innerHTML =
            "Coupon code Applied";
          document.getElementById("couponStatus").style =
            "display:block;color:green;";
          document.getElementById("priceDiv").style = "visibility:visible";
          document.getElementById("offerPrice").innerHTML = data.offerPrice;
          document.getElementById("offerLabel").innerHTML = "Offer Price";
          document.getElementById("maxDiscount").style = "visibility:visible";
          document.getElementById("maxDiscount").innerHTML = data.totalDiscount;
          document.getElementById("applyButton").disabled = false;
        } else {
          document.getElementById("couponStatus").style =
            "display:block;color:red;";
          document.getElementById("couponStatus").innerHTML =
            "Already Applied This Coupon";
          document.getElementById("priceDiv").style = "visibility:hidden";
          document.getElementById("maxDiscount").style = "visibility:hidden";
          document.getElementById("applyButton").disabled = true;
        }
      } else {
        document.getElementById("couponStatus").style =
          "display:block;color:red;";
        document.getElementById("couponStatus").innerHTML = "Invalid Code";
        document.getElementById("priceDiv").style = "visibility:hidden";
        document.getElementById("maxDiscount").style = "visibility:hidden";
        document.getElementById("applyButton").disabled = true;
      }
    });
});

function applyCoupon() {
  const discountAmount = document.getElementById("maxDiscount").innerHTML;

  document.getElementById("applyCoupon").innerHTML =
    discountAmount + "&nbsp" + "(" + dCode + ")";
  document.getElementById("totalAmount").innerHTML = dPrice;
  const discountTotal = document.getElementById("totalAmount").innerHTML;
  fetch("/product/setdiscount", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ discountAmount, discountTotal }),
  })
    .then((res) => res.json())
    .then((data) => {});
}
