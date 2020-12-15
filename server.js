require("dotenv").config();

/*[ START -- Library Imports ]*/
const express = require("express");
const handlebars = require("express-handlebars");
const debug = require("debug")("app:server");
const cookieParser = require("cookie-parser");
const moment = require("moment");
const database = require("./database");
const morgan = require('morgan');

/*[ END -- Library Imports ]*/

/*[ START -- Functions ]*/

/*[ END -- Functions ]*/

/*[ START -- Server Config ]*/
morgan('tiny');
const app = express();
app.engine(
  "handlebars",
  handlebars({
    helpers: {
      formatPrice: (price) => {
        return price == undefined ? "$0.00" : "$" + price.toFixed(2);
      },
      formatDate: (date) => moment(date).format("MMMM Do YYYY"),
      fromNow: (date) => moment(date).fromNow(),
      not: (value) => !value,
      eq: (a, b) => a == b,
      or: (a, b) => a || b,
      and: (a, b) => a && b,
      tern: (condition, a, b) => (condition ? a : b),
      formatAge: (months) => {
        const years = (months / 12).toString().split(".")[0];
        const remainder = months % 12;
        return `${
          years < 1 ? "" : years > 1 ? `${years} years` : `${years} year`
        } ${
          remainder > 0
            ? remainder > 1
              ? `${remainder} months`
              : `${remainder} month`
            : ""
        }`;
      },
    },
  })
);

app.set("view engine", "handlebars");
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/*[ END -- Server Config ]*/

/*[ START -- Routes ]*/
app.get("/", async (req, res) => {
  debug(req.query);
  const animal = req.query.animal;
  const breed = req.query.breed;
  const age = req.query.age;
  const sort = req.query.sort;
  const search = req.query.search;
  const animals = {
    selected: animal || "",
    options: [
      { value: "", text: "All" },
      { value: "dog", text: "Dogs" },
      { value: "cat", text: "Cats" },
      { value: "tortoise", text: "Tortoises" },
      { value: "parrot", text: "Parrots" },
    ],
  };
  const breeds = {
    selected: breed || "",
    options: [
      { value: "", text: "All" },
      { value: "pittbull", text: "Pittbulls" },
      { value: "rottweiler", text: "Rottweilers" },
      { value: "parakeet", text: "Parakeets" },
      { value: "tortoise", text: "Tortoises" },
    ],
  };
  const ages = {
    selected: age || "",
    options: [
      { value: "", text: "All" },
      { value: ".9", text: "<1" },
      { value: "13", text: "1-3" },
      { value: "35", text: "3-5" },
      { value: "57", text: "5-7" },
      { value: "7.1", text: ">7" },
    ],
  };
  const sorts = {
    selected: sort || "",
    options: [
      { value: "", text: "All" },
      { value: "name", text: "Name" },
      { value: "animal", text: "Animal" },
      { value: "breed", text: "Breed" },
    ],
  };
  const matchStage = {};
  let sortStage = null;

  try {
    if (animal) {
      matchStage.animal = animal;
    }
    if (breed) {
      matchStage.breed = breed;
    }
    if (age) {
      switch (age) {
        case ".9":
          matchStage.age = { $lte: 12 };
          break;
        case "13":
          matchStage.age = { $gte: 12, $lte: 36 };
          break;
        case "35":
          matchStage.age = { $gte: 36, $lte: 60 };
          break;
        case "57":
          matchStage.age = { $gte: 60, $lte: 84 };
          break;
        case "7.1":
          matchStage.age = { $gte: 84 };
          break;
        default:
          matchStage.age = { $gte: 1 };
      }
    }
    if (search) {
      matchStage.$text = { $search: search };
    }

    switch (sort) {
      case "name":
        sortStage = { name: 1 };
        break;
      case "animal":
        sortStage = { animal: 1 };
        break;
      case "breed":
        sortStage = { breed: 1 };
        break;
      default:
        sortStage = { breed: 1 };
    }

    const pipeline = [{ $match: matchStage }, { $sort: sortStage }];
    const results = await database.getAllAnimals(pipeline);
    res.render("home", {
      title: "Pet Rescue",
      style: "home",
      results,
      animals,
      breeds,
      ages,
      sorts,
      search,
    });
  } catch (err) {
    results = {
      name: "No animals found",
      image: "error.png",
    };
    res.render("home", {
      title: "Pet Rescue",
      style: "home",
      results,
      animals,
      breeds,
      ages,
      sorts,
    });
    debug(err);
  }
});

app.get("/admin", async (req, res) => {
  const animals = await database.getAllAnimals([{ $sort: { name: 1 } }]);
  res.render("admin", { title: "Admin Page", style: "admin", animals });
});

app.get("/admin/add", async (req, res) => {
  const animals = {
    selected: "",
    options: [
      { value: "dog", text: "Dogs" },
      { value: "cat", text: "Cats" },
      { value: "tortoise", text: "Tortoises" },
      { value: "parrot", text: "Parrots" },
    ],
  };
  const breeds = {
    selected: "",
    options: [
      { value: "pittbull", text: "Pittbulls" },
      { value: "rottweiler", text: "Rottweilers" },
      { value: "parakeet", text: "Parakeets" },
      { value: "tortoise", text: "Tortoises" },
    ],
  };
  res.render("add", { title: "Add Pet", style: "pet", animals, breeds });
});

app.get("/admin/edit/:id", async (req, res) => {
  try {
    const animal = await database.getAnimalById(req.params.id);

    const animals = {
      selected: animal.animal || "",
      options: [
        { value: "", text: "All" },
        { value: "dog", text: "Dogs" },
        { value: "cat", text: "Cats" },
        { value: "tortoise", text: "Tortoises" },
        { value: "parrot", text: "Parrots" },
      ],
    };
    const breeds = {
      selected: animal.breed || "",
      options: [
        { value: "", text: "All" },
        { value: "pittbull", text: "Pittbulls" },
        { value: "rottweiler", text: "Rottweilers" },
        { value: "parakeet", text: "Parakeets" },
        { value: "tortoise", text: "Tortoises" },
      ],
    };

    res.render("edit", { title: `Edit ${animal.name}`, animal , animals, breeds});
  } catch (err) {
    debug(err);
    res.render("error400", { title: "Something went wrong" });
  }
});


/*[ END -- Routes ]*/

/*[ START -- API Routers ]*/
app.use("/api/animal", require("./api/animal"));
/*[ END -- API Routers ]*/

/*[ START -- Route Routers ]*/
app.use("/animal", require("./routes/animal"));
/*[ END -- Route Routers ]*/

/*[ START -- Static Files ]*/
app.use(express.static("public"));
app.use("/bootstrap", express.static("node_modules/bootstrap/dist"));
app.use("/jquery", express.static("node_modules/jquery/dist"));
app.use("/bootswatch", express.static("node_modules/bootswatch/dist"));
app.use("/images", express.static("images"));
/*[ END -- Static Files ]*/

/*[ START -- Server Start ]*/
const port = process.env.PORT || 3000;
const hostname = process.nextTick.HOSTNAME || "localhost";
app.listen(
  port,
  debug(
    `Server start at http://${hostname}:${port} @ ${moment().format(
      "h:mm:ss a"
    )}`
  )
);
/*[ END -- Server Start ]*/
