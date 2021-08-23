const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");

//update user 
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    //here we r checking thet if the user id is matching with the id we have given or
    // if he is the admin of the account or not
    if (req.body.password) {
      //here we r taking the new password
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
        //here we adding random text to the password so that no body understands it
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      //here we r updating the body
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
        //here we r giving the id as parameter and updating any parameters of the body
      });
      res.status(200).json("Account has been updated");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can update only your account!");
  }
});

//delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
     //here we r checking thet if the user id is matching with the id we have given or
    // if he is the admin of the account or not
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can delete only your account!");
  }
});

//get a user
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
      //here we r finding the user by using user n username
    const { password, updatedAt, ...other } = user._doc;
    // before returning we r hiding some papameters which r not be shown to every one like password
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get friends
router.get("/friends/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
      user.followings.map((friendId) => {
        return User.findById(friendId);
        //here we r mapping all the the friends and finding the friend with the given user it
      })
    );
    let friendList = [];
    //here we r creating an empty array
    friends.map((friend) => {
      const { _id, username, profilePicture } = friend;
      friendList.push({ _id, username, profilePicture });
      //here we r mapping the friend id ,user name and dp of the the friend and storing it in the array
    });
    res.status(200).json(friendList)
  } catch (err) {
    res.status(500).json(err);
  }
});

//follow a user

router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    //here we r checking that the user is not following himself
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        //here we are checking that if already we have followed or not i.e the 
        //followers array is containig the user id or not
        await user.updateOne({ $push: { followers: req.body.userId } });
        //updating followers by pushing the user id
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        //updating followings by pushing the user id
        res.status(200).json("user has been followed");
      } else {
        res.status(403).json("you allready follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant follow yourself");
  }
});

//unfollow a user

router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
     //here we r checking that the user is not following himself
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        //here we are checking that if already we have followed or not i.e the 
        //followers array is containig the user id or not
        await user.updateOne({ $pull: { followers: req.body.userId } });
        //updating followers by pulling the user id
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
         //updating followings by pulling the user id
        res.status(200).json("user has been unfollowed");
      } else {
        res.status(403).json("you dont follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant unfollow yourself");
  }
});

module.exports = router;
