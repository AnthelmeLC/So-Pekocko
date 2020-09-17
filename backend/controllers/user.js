const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.signup = (req, res, next) => {
    //cryptage du mot de passe
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        //création du nouvel utilisateur
        const user = new User({
            email : req.body.email,
            password : hash
        });
        //ajout du nouvel utilisateur à la base de données
        user.save()
        .then(() => res.status(201).json({message : "Utilisateur créé."}))
        .catch(error => res.status(400).json({error}));
    })
    .catch(error => res.status(500).json({error}));
};

exports.login = (req, res, next) => {
    //recherche de l'utilisateur dans la base donnée
    User.findOne({email : req.body.email})
    .then(user => {
        //si l'utilisateur n'existe pas
        if(!user){
            return res.status(401).json({error : "Utilisateur non trouvé."});
        }
        //vérification du mot de passe
        bcrypt.compare(req.body.password, user.password)
        .then(valid => {
            //si le mot de passe est incorrect
            if(!valid){
                return res.status(401).json({error : "Mot de passe incorrect."});
            }
            //si le mot de passe est correct, création du token de session
            res.status(200).json({
                userId : user._id,
                token : jwt.sign({userId : user._id}, "NDUSirG3VSZdvlK", {expiresIn : "24h"}) //Le code de salage est en clair pour un soucis que ça fonctionne pour mon
            });                                                                               //mentor et le jury de OpenClassRooms
        })
        .catch(error => res.status(500).json({error}));
    })
    .catch(error => res.status(500).json({error}));
};