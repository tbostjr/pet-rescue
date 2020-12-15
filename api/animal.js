const express = require("express");
const config = require('config');
const debug = require('debug')('app:api:animal');
const database = require('../database');
const Joi = require('joi');
const multer = require("multer");
const { data } = require("jquery");
const storage = multer.diskStorage({
  destination:  (req, file, cb) => {
    cb(null, "./images");
  },
  filename:  (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

const router = express.Router();


//Functions
const sendError = (err, res) => {
    debug(err);
    if (err.isJoi) {
      res.json({ error: err.details.map((e) => e.message).join("\n") });
    } else {
      res.json({ error: err.message });
    }
  };



router.post('/validate', async (req,res) =>{
    debug(req.body);
    const schema = Joi.object({
        id: Joi.string().required(),
        given_name: Joi.string().min(1).required(),
        family_name: Joi.string().min(1).required(),
        email: Joi.string().email().required(),
        phone: Joi.string().min(10).required()
    }) 

    try{
        const data = await schema.validateAsync(req.body);
        res.json(data);
    }catch(err){
        debug(err);
        sendError(err, res);
    }
});

router.post("/add-animal-validate", upload.single("image"), async (req, res) =>{
  
  try{
    
    const schema = Joi.object({
      name: Joi.string().required().min(1),
      age: Joi.number().required().min(1),
      animal: Joi.string().required().min(1),
      breed: Joi.string().required().min(1),
      image: Joi.string().allow(''),
      description: Joi.string().required().min(1)
    })

    const animal = await schema.validateAsync(req.body);
    animal.image = req.file.originalname;
    debug(animal);
    await database.addAnimal(animal);
    res.json(animal);

  }catch(err){
    debug(err);
    sendError(err, req);
  }
})

router.post("/edit-animal-validate",upload.single("image"), async (req, res) =>{
  try{
    const schema = Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required().min(1),
      age: Joi.number().required().min(1),
      animal: Joi.string().required().min(1),
      breed: Joi.string().required().min(1),
      image: Joi.string().allow(''),
      description: Joi.string().required().min(1)
    })

    const data = await schema.validateAsync(req.body);
    if(req.file){
      data.image = req.file.originalname;
    }
    await database.editAnimal(data);
    res.json(data);

  }catch(err){
    debug(err);
    sendError(err, req);
  }
})

router.delete("/admin/delete/:id", async (req, res) =>{
  const id = req.params.id;
  try{
    await database.deleteAnimal(id);
    res.json({message: "Animal record deleted"})
  }catch (err){
    debug(err);
    sendError(err, res);
  }
})

module.exports = router;
