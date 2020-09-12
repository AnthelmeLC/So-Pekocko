const Sauce = require("../models/sauce");
const fs = require("fs");

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({error}));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({_id : req.params.id})
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(400).json({error}));
};

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl : `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
        likes : 0,
        dislikes : 0,
        usersLiked : [],
        usersDisliked : []
    });
    sauce.save()
    .then(() => res.status(201).json({message : "Sauce enregistrée!"}))
    .catch(error => res.status(400).json({error}));
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
    {
        ...JSON.parse(req.body.sauce),
        imageUrl : `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
        likes : 0,
        dislikes : 0,
        usersLiked : [],
        usersDisliked : []
    } : 
    {
        ...req.body,
        likes : 0,
        dislikes : 0,
        usersLiked : [],
        usersDisliked : []
    };
    Sauce.updateOne({_id : req.params.id}, {...sauceObject, _id : req.params.id})
    .then(() => res.status(200).json({message : "Sauce modifiée."}))
    .catch(error => res.status(400).json({error}));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id : req.params.id})
    .then(sauce => {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
            Sauce.deleteOne({_id : req.params.id})
            .then(() => res.status(200).json({message : "Sauce supprimée."}))
            .catch(error => res.status(400).json({error}));
        });
    })
    .catch(error => res.status(500).json({error}));
};

exports.likeSauce = (req, res, next) => {
    Sauce.findOne({_id : req.params.id})
    .then(sauce => {
        const like = req.body.like;
        if(like === 1){
            sauce.likes += 1;
            sauce.usersLiked.push(req.body.userId);
            Sauce.updateOne({_id : req.params.id}, sauce)
            .then(() => res.status(200).json({message : "Sauce aimée!"}))
            .catch(error => res.status(400).json({error}));
        }
        else if(like === -1){
            sauce.dislikes += 1;
            sauce.usersDisliked.push(req.body.userId);
            Sauce.updateOne({_id : req.params.id}, sauce)
            .then(() => res.status(200).json({message : "Sauce détestée!"}))
            .catch(error => res.status(400).json({error}));
        }
        else if(like === 0){
            const userId = req.body.userId;
            if(sauce.usersLiked.indexOf(userId) >= 0){
                sauce.likes -= 1;
                sauce.usersLiked.splice(sauce.usersLiked.indexOf(userId), 1);
                Sauce.updateOne({_id : req.params.id}, sauce)
                .then(() => res.status(200).json({message : "La sauce n'est plus aimée!"}))
                .catch(error => res.status(400).json({error}));
            }
            else if(sauce.usersDisliked.indexOf(userId) >= 0){
                sauce.dislikes -= 1;
                sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(userId), 1);
                Sauce.updateOne({_id : req.params.id}, sauce)
                .then(() => res.status(200).json({message : "La sauce n'est plus détestée!"}))
                .catch(error => res.status(400).json({error}));
            };
        };
    })
    .catch(error => res.status(400).json({error}));
};