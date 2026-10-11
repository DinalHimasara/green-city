import express from "express"
import { createUser, getUser, loginUser, updateUserStatus, updateUser, deleteUser, createDriver, getDriverLocations } from "../controllers/userController.js"

const userRouter = express.Router()

userRouter.get("/",getUser)
userRouter.get("/driver-locations", getDriverLocations)
userRouter.post("/",createUser)
userRouter.post("/driver", createDriver)
userRouter.post("/login", loginUser)
userRouter.put("/toggle-status/:email",updateUserStatus)
userRouter.put("/:id", updateUser)
userRouter.delete("/:id", deleteUser)



export default userRouter