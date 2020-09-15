const Menu = require("../../models/menu");
function homeController() {
  return {
    async index(req, res) {
      const sushis = await Menu.find();
      return res.render("home", { sushis: sushis });
    },
  };
}

module.exports = homeController;
