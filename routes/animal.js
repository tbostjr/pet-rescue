/*[ START -- Library Imports ]*/
const express = require("express");
const debug = require("debug")("app:server");
const moment = require("moment");
const config = require("config");
const database = require("../database");
/*[ END -- Library Imports ]*/

/*[ START -- Functions ]*/

/*[ END -- Functions ]*/

/*[ START -- Server Config ]*/
const router = express.Router();

/*[ END -- Server Config ]*/

/*[ START -- Routes ]*/
router.get("/adoption-success", (req, res) => {
  debug("success");
  res.render("adoption-success", { title: "Success!" });
});
router.get("/error-400", (req, res) => {
  res.render("/errors/error400", { title: "Something went wrong..." });
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const animal = await database.getAnimalById(id);
    debug(animal);
    res.render("animal", { title: animal.name, style: "animal", animal });
  } catch (err) {
    debug(err);
  }
});

router.get("/adopt/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const animal = await database.getAnimalById(id);
    debug(animal);
    res.render("adopt", {
      title: `Adopt ${animal.name}`,
      style: "animal",
      animal,
    });
  } catch (err) {
    debug(err);
  }
});

router.post("/adopt/submission", async (req, res) => {
  try {
    await database.addAdoption(req.body);
    res.redirect("/animal/adoption-success");
  } catch (err) {
    res.redirect("/animal/error-400");
  }
});

/*[ END -- Routes ]*/

module.exports = router;
