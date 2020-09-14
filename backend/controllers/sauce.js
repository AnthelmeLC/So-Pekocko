const Sauce = require("../models/sauce");
const fs = require("fs");

//GET ALL
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({error}));
};

//GET ONE
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({_id : req.params.id})
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(400).json({error}));
};

//POST NEW
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    //création de la nouvelle sauce
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl : `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
        likes : 0,
        dislikes : 0,
        usersLiked : [],
        usersDisliked : []
    });
    //ajout de la nouvelle sauce à la base de données
    sauce.save()
    .then(() => res.status(201).json({message : "Sauce enregistrée!"}))
    .catch(error => res.status(400).json({error}));
};

//MODIFY ONE
exports.modifySauce = (req, res, next) => {
    //si l'utilisateur modifie l'image de la sauce
    if(req.file){
        Sauce.findOne({_id : req.params.id})
        .then(sauce => {
            //suppression de l'ancienne image
            const filename = sauce.imageUrl.split("/images/")[1];
            fs.unlink(`images/${filename}`, () => {
                //nouvelles valeurs de la sauce
                const sauceObject = {
                    ...JSON.parse(req.body.sauce),
                    imageUrl : `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
                    likes : 0,
                    dislikes : 0,
                    usersLiked : [],
                    usersDisliked : []
                };
                //mise à jour de la sauce dans la base de données
                Sauce.updateOne({_id : req.params.id}, {...sauceObject, _id : req.params.id})
                .then(() => res.status(200).json({message : "Sauce modifidée."}))
                .catch(error => res.status(400).json({error}));
            });
        })
        .catch(error => res.status(400).json({error}));
    }
    //si l'utilisateur ne modifie pas l'image de la sauce
    else{
        //nouvelles valeurs de la sauce
        const sauceObject = {
            ...req.body,
            likes : 0,
            dislikes : 0,
            usersLiked : [],
            usersDisliked : []
        };
        //mise à jour de la sauce dans la base de donnée
        Sauce.updateOne({_id : req.params.id}, {...sauceObject, _id : req.params.id})
        .then(() => res.status(200).json({message : "Sauce modifidée."}))
        .catch(error => res.status(400).json({error}));
    };
};

//DELETE ONE
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id : req.params.id})
    .then(sauce => {
        //suppression de l'image correspondante
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
            //suppression de la sauce
            Sauce.deleteOne({_id : req.params.id})
            .then(() => res.status(200).json({message : "Sauce supprimée."}))
            .catch(error => res.status(400).json({error}));
        });
    })
    .catch(error => res.status(500).json({error}));
};

//POST LIKE
exports.likeSauce = (req, res, next) => {
    Sauce.findOne({_id : req.params.id})
    .then(sauce => {
        const like = req.body.like;
        //si l'utilisateur like
        if(like === 1){
            sauce.likes += 1;
            sauce.usersLiked.push(req.body.userId);
            Sauce.updateOne({_id : req.params.id}, sauce)
            .then(() => res.status(200).json({message : "Sauce aimée!"}))
            .catch(error => res.status(400).json({error}));
        }
        //si l'utilisateur dislike
        else if(like === -1){
            sauce.dislikes += 1;
            sauce.usersDisliked.push(req.body.userId);
            Sauce.updateOne({_id : req.params.id}, sauce)
            .then(() => res.status(200).json({message : "Sauce détestée!"}))
            .catch(error => res.status(400).json({error}));
        }
        //si l'utilisateur annule un like ou dislike
        else if(like === 0){
            const userId = req.body.userId;
            //si l'utilisateur annule un like
            if(sauce.usersLiked.indexOf(userId) >= 0){
                sauce.likes -= 1;
                sauce.usersLiked.splice(sauce.usersLiked.indexOf(userId), 1);
                Sauce.updateOne({_id : req.params.id}, sauce)
                .then(() => res.status(200).json({message : "La sauce n'est plus aimée!"}))
                .catch(error => res.status(400).json({error}));
            }
            //si l'utilisateur annule un dislike
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