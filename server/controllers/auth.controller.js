const bcrypt = require("bcryptjs");
const userM = require("../models/users");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const userLogin = (req, res) => {
  var loginType;
  if (req.body.emailPhone != "" && req.body.password != "") {
    if (isNaN(req.body.emailPhone)) loginType = "email";
    else loginType = "phoneNo";
    userM
      .findOne()
      .where(loginType, req.body.emailPhone)
      .then((data) => {
        if (data) {
          bcrypt.compare(req.body.password, data.password, function(
            err,
            passMatch
          ) {
            if (err) res.status(400).send(err);
            else if (passMatch) {
              let jwtData = {
                _id: data["_id"],
                fname: data["fname"],
                lname: data["lname"],
                email: data["email"],
                isAdmin: data["isAdmin"]
              };
              var token = jwt.sign({ user: jwtData }, config.auth.secretKey, {
                expiresIn: config.auth.tokenExpiresIn,
              });
              res
                .status(200)
                .json({ message: "Login Successful", token: token });
            } else res.status(401).json({ message: "Invalid Credentials1" });
          });
        } else res.status(401).json({ message: "Invalid Credentials2" });
      })
      .catch((err) => res.status(400).send(err));
  } else res.status(400).json({ message: "Provide all Credentials" });
}

const userRegistration = (req, res) => {
  users = new userM();
  users.fname = req.body.fname;
  users.lname = req.body.lName;
  users.email = req.body.email;
  users.phoneNo = req.body.phoneNo;
  users.state = req.body.state;
  users.city = req.body.city;
  users.pincode = req.body.pincode;
  users.userType = req.body.user_type;
  users.createdOn = new Date();

  bcrypt.hash(req.body.password, 10, function(err, hash) {
    if (err) res.status(400).send(err);
    else {
      users.password = hash;

      users.save((err, data) => {
        if (err) res.status(400).send(err);
        else
          res
            .status(200)
            .json({ message: "User Added Successfully", id: data._id });
      });
    }
  });
}

const userList = async (req, res) => {
  try {
    const data = await userM.find().select("-password");
    res.status(200).json({ message: "Success", data });
  } catch (err) {
    res.status(400).json({ message: "Something Went Wrong", data: err });
  }
}

const changePass = async (req, res) => {
  const targetUserId = req.user && req.user.isAdmin ? (req.body._id || req.user._id) : req.user._id;

  if (!req.body.password) {
    return res.status(400).json({ message: "Password is required" });
  }

  try {
    const resp = await userM.findOne({ _id: targetUserId });
    if (!resp) {
      return res.status(404).json({ message: "User not found" });
    }

    bcrypt.hash(req.body.password, 10, async (err, hash) => {
      if (err) {
        return res.status(400).send(err);
      }

      try {
        const updateResp = await userM.updateOne({ _id: targetUserId }, { password: hash });
        return res.status(200).json({
          message: "Password Changed Successfully",
          id: updateResp
        });
      } catch (updateErr) {
        return res
          .status(400)
          .json({ message: "Something Went Wrong", data: updateErr });
      }
    });
  } catch (err) {
    res.status(400).json({ message: "Something Went Wrong", data: err });
  }
}

module.exports = {
  userLogin, 
  userRegistration,
  userList,
  changePass
}
