import axios from "axios";
import Noty from "noty";
import { initAdmin } from "./admin";
import moment from "moment";

let addToCart = document.querySelectorAll(".add-to-cart");
let removeFromCart = document.querySelectorAll(".remove-from-cart");
let cartCounter = document.querySelector("#cart-counter");
let cartTotal = document.querySelector(".amount");
let qtyField;

function findSushi(sushi) {
  var sushiInCart = document.querySelectorAll(".sushi-list"),
    i,
    j;
  for (i = 0; i < sushiInCart.length; i++) {
    var element = sushiInCart[i];

    for (j = 0; j < element.children.length; j++) {
      var child = element.children[j];
      var sushiName = child.children[1].children[0].innerText;
      if (sushi.item.name === sushiName) {
        qtyField = child.children[2].children[0];
      }
    }
  }
}

function updateCartAdd(sushi) {
  axios
    .post("/update-cart", sushi)
    .then((res) => {
      cartCounter.innerText = res.data.totalQty;
      new Noty({
        type: "success",
        timeout: 2000,
        progressBar: false,
        text: "Sushi added to the cart!",
        layout: "topCenter",
      }).show();
    })
    .catch((err) => {
      new Noty({
        type: "error",
        timeout: 2000,
        progressBar: false,
        text: "Something went wrong 😔",
        layout: "topCenter",
      }).show();
    });
}

addToCart.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    let sushi = JSON.parse(btn.dataset.sushi);
    updateCartAdd(sushi);
  });
});

function updateCartRemove(sushi) {
  axios
    .post("/remove-from-cart", sushi)
    .then((res) => {
      cartCounter.innerText = res.data.totalQty;
      qtyField.innerText = parseInt(qtyField.innerText.slice(0, -1));
      qtyField.innerText = res.data.itemQty + "x";
      cartTotal.innerText = res.data.totalPrice + "$";
      new Noty({
        type: "success",
        timeout: 2000,
        progressBar: false,
        text: "Sushi removed from the cart.",
        layout: "topCenter",
      }).show();
    })
    .catch((err) => {
      new Noty({
        type: "error",
        timeout: 2000,
        progressBar: false,
        text: "Something went wrong 😔",
        layout: "topCenter",
      }).show();
    });
}

removeFromCart.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    let sushi = JSON.parse(btn.dataset.sushi);
    findSushi(sushi);
    updateCartRemove(sushi);
  });
});

// Remove the alert from the orders page
const alertMsg = document.querySelector("#success-alert");
if (alertMsg) {
  setTimeout(() => {
    alertMsg.remove();
  }, 6000);
}

// Change order status
let statuses = document.querySelectorAll(".status_line");
let hiddenInput = document.querySelector("#hiddenInput");
let order = hiddenInput ? hiddenInput.value : null;
order = JSON.parse(order);
let time = document.createElement("small");

function updateStatus(order) {
  statuses.forEach((status) => {
    status.classList.remove("step-completed");
    status.classList.remove("current");
  });
  let stepCompleted = true;
  statuses.forEach((status) => {
    let dataProp = status.dataset.status;
    if (stepCompleted) {
      status.classList.add("step-completed");
    }
    if (dataProp === order.status) {
      stepCompleted = false;
      time.innerText = moment(order.updatedAt).format("hh:mm A");
      status.appendChild(time);
      if (status.nextElementSibling) {
        status.nextElementSibling.classList.add("current");
      }
    }
  });
}

updateStatus(order);

// Socket
let socket = io();
initAdmin(socket);
// Join
if (order) {
  socket.emit("join", `order_${order._id}`);
}

let adminAreaPath = window.location.pathname;
if (adminAreaPath.includes("admin")) {
  socket.emit("join", "adminRoom");
}

socket.on("orderUpdated", (data) => {
  const updatedOrder = { ...order };
  updatedOrder.updatedAt = moment().format();
  updatedOrder.status = data.status;
  updateStatus(updatedOrder);
  new Noty({
    type: "info",
    progressBar: false,
    text: "Order Updated!",
    layout: "topCenter",
  }).show();
});
