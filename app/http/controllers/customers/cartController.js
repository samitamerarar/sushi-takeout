function cartController() {
  return {
    index(req, res) {
      res.render("customers/cart");
    },

    update(req, res) {
      if (!req.session.cart) {
        req.session.cart = {
          items: {},
          totalQty: 0,
          totalPrice: 0,
        };
      }
      let cart = req.session.cart;

      // Check if item does not exist in cart
      if (!cart.items[req.body._id]) {
        cart.items[req.body._id] = {
          item: req.body,
          qty: 1,
        };
        cart.totalQty = cart.totalQty + 1;
        cart.totalPrice = parseFloat(cart.totalPrice) + parseFloat(req.body.price);
      } else {
        cart.items[req.body._id].qty = cart.items[req.body._id].qty + 1;
        cart.totalQty = cart.totalQty + 1;
        cart.totalPrice = parseFloat(cart.totalPrice) + parseFloat(req.body.price);
      }
      cart.totalPrice = cart.totalPrice.toFixed(2);
      return res.json({ totalQty: cart.totalQty });
    },

    remove(req, res) {
      if (!req.session.cart) {
        req.session.cart = {
          items: {},
          totalQty: 0,
          totalPrice: 0,
        };
      }

      let cart = req.session.cart;
      // Check if item does not exist in cart
      if (!cart.items[req.body.item._id]) {
        // nothing happens
        cart.totalPrice = parseFloat(cart.totalPrice);
      } else {
        cart.items[req.body.item._id].qty = cart.items[req.body.item._id].qty - 1;
        cart.totalQty = cart.totalQty - 1;
        cart.totalPrice = parseFloat(cart.totalPrice) - parseFloat(req.body.item.price);
      }
      cart.totalPrice = cart.totalPrice.toFixed(2);

      cart.items[req.body.item._id].qty < 0
        ? (cart.items[req.body.item._id].qty = 0)
        : cart.items[req.body.item._id].qty;
      cart.totalQty <= 0 ? (cart.totalQty = 0) : cart.totalQty;
      cart.totalPrice <= 0 ? (cart.totalPrice = 0) : cart.totalPrice;

      let itemQty = cart.items[req.body.item._id].qty;

      for (let key in req.session.cart.items) {
        if (req.session.cart.items[key].qty <= 0) {
          delete req.session.cart.items[key];
        }
      }

      return res.json({
        totalQty: cart.totalQty,
        itemQty: itemQty,
        totalPrice: cart.totalPrice,
      });
    },
  };
}

module.exports = cartController;
