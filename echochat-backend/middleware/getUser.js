const express = require("express")
const jwt = require("jsonwebtoken")

const getUser = (req, res, next) => {
    const authToken = req.header("auth-token")

    if (!authToken) {

        return res.send("Auth Token is required")
    }
    try {

        const data = jwt.verify(authToken, "ChatApplicationSecretKey");
        req.id = data.id;
    } catch (error) {
        return res.status(401).json({ error: "Invalid Auth Token" });
    }
    next();
}

module.exports = getUser;  