const express = require('express');
const { register, login, profile } = require("../controllers/auth.controller");
const authenticate = require("../middleware/auth.middleware");


const router = express.Router();


router.get("/",(req,res)=>{
    res.json({
        message:"Auth route working"
    })
});

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authenticate, profile);

module.exports = router;