const debug = require("debug")("app:database");
const config = require("config");
const { MongoClient, ObjectID } = require("mongodb");
const moment = require("moment");
const { data } = require("jquery");

let _database = null;

const connect = async () => {
  if (!_database) {
    const dbUrl = config.get("db.url");
    const dbName = config.get("db.name");
    const poolSize = config.get("db.poolSize");
    const client = await MongoClient.connect(dbUrl, {
      useUnifiedTopology: true,
      poolSize: poolSize,
    });
    _database = client.db(dbName);
  }
  return _database;
};

const getAllAnimals = async (pipeline) => {
  const database = await connect();
  return database.collection("animals").aggregate(pipeline).toArray();
};

const getAnimalById = async (id) => {
  const database = await connect();
  return database.collection("animals").findOne({ _id: new ObjectID(id) });
};

const addAnimal = async (animal) => {
  const database = await connect();
  return database.collection("animals").insertOne(animal);
};

const addAdoption = async (data) => {
  const database = await connect();
  return database.collection("adoptions").insertOne(data);
};
const editAnimal = async (animal) => {
  const database = await connect();
  return database.collection("animals").updateOne(
    {
      _id: new ObjectID(animal.id),
    },
    {
      $set: animal,
    }
  );
};

const deleteAnimal = async (id) => {
  const database = await connect();
  return database.collection("animals").deleteOne({_id: new ObjectID(id)})
}

module.exports = {
  connect,
  getAllAnimals,
  getAnimalById,
  addAdoption,
  addAnimal,
  editAnimal,
  deleteAnimal
};
