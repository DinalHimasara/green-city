import bcrypt from "bcrypt"
import User from "../model/user.js"
import jwt from "jsonwebtoken"
import { response } from "express"
import Schedule from "../model/Schedule.js"
import Vechicle from "../model/vechicle.js"



export function getUser(req,res){
    if(req.user == null || req.user.role != "admin"){
        res.status(401).json({
            message : "Unauthorized Acess"
        })
        return
    }

    const filter = {}

    if(req.query.role){
        filter.role = req.query.role
    }

    User.find(filter).select("-password -image").then(
        (users)=>{
            res.json(users)
        }
    ).catch(
        (err)=>{
            res.status(500).json({
                error : err.message
            })
        }
    )
}

export function createUser(req,res){
    const data = req.body
    const hashedPassword = bcrypt.hashSync(data.password, 10)

    const user = new User(
        {
            nic : data.nic,
            email : data.email,
            firstName : data.firstName,
            lastName : data.lastName,
            password : hashedPassword,
            phone : data.phone,
            address : data.address,
            image : data.image,
            isBlock : data.isBlock,
            role : data.role,
            status : data.status,
            currentLocation : data.currentLocation
        }
    )

    user.save().then(
        ()=>{
            res.json({
                message : "User Createad Sucessfully !"
            })
        }
    ).catch(
        (err)=>{
            console.log(err)
            res.status(400).json({
                error : err.message
            })
        }
    )
}

export function loginUser(req,res){
    const email = req.body.email
    const password = req.body.password

    User.find(
        {email : email}
    ).then(
        (users)=>{
            if(users[0] == null){
                res.status(404).json({
                    message : "user not found!"
                })
            }
            else{
                console.log(users)
                const user = users[0]


                const isPasswordCorrect = bcrypt.compareSync(password, user.password)

                if(isPasswordCorrect){
                    const payload = {
                        _id: user._id,
                        nic : user.nic,
                        email : user.email,
                        firstName : user.firstName,
                        lastName : user.lastName,
                        role : user.role,
                        isBlock : user.isBlock,
                        isEmailVerified :  user.isEmailVerified,
                        status : user.status
                    }

                    const token = jwt.sign(payload, "green&45")

                    res.status(200).json({
                        message : "LOGIN SUCESSFULL !",
                        token : token,
                        role : user.role
                    })
                }
                else{
                    res.status(401).json({
                        message : "Login failed !"
                    })
                }

            }                

               
        }
    )
}

export async function googleLogin(req,res){
    try{
        const res = await axios.get("",{
            headers :{
                Authorization : `Bearer $(req.body.token)`
            }
        })
        console.log(response.data)

        const user = await User.findOne({email : response.data.email})
        if(user == null){
            const newUser = new User({
                email : response.data.email,
                firstName : response.data.given_name,
                lastName : response.data.family_name,
                password : "123",
                image : response.data.picture
            })
            await newUser.save()

            const payload = {
                email : newUser.email,
                firstName : newUser.firstName,
                lastName : newUser.lastName,
                role : newUser.role,
                isEmailVerified : true,
                image : newUser.image
            }

            const token = jwt.sign(payload, "green&45")

                    res.status(200).json({
                        message : "LOGIN SUCESSFULL !",
                        token : token,
                        role : user.role
                    })

        }
        else{
            const payload = {
                        email : user.email,
                        firstName : user.firstName,
                        lastName : user.lastName,
                        role : user.role,
                        isBlock : user.isBlock,
                        isEmailVerified : user.isEmailVerified,
                        status : user.status
                    }

                    const token = jwt.sign(payload, "green&45")

                    res.status(200).json({
                        message : "LOGIN SUCESSFULL !",
                        token : token,
                        role : user.role
                    })
        }
    }
    catch(error){
        res.status(500).json({
            message : "Goggle Login failed",
            error : error.message
        })
    }

}

export async function updateUserStatus(req,res){
    if(!isAdmin(req)){
        res.status(401).json({
            message : "Unauthorized"
        })
        return
    }

    const email = req.params.email

    if(req.user.email === email){
        res.status(400).json({
            message : "Admin can't change their own status"
        })
        return
    }

    const isBlock = req.body.isBlock

    try{
        if(req.body.password){
            req.body.password = bcrypt.hashSync(req.body.password, 10)
        }
        await User.updateOne({email : email}, {isBlock:isBlock})
        res.json({
            message : "User Status Changed"
        })
    }
    catch(err){
        res.status(500).json({
            message : "Error updating user status",
            error : "error.message"
        })
    }

}

export function isAdmin(req){
    if(req.user == null || req.user.role != "admin"){
        return false
    }
    return true
}

export async function updateUser(req,res){
    if(!isAdmin(req)){
        res.status(401).json({
            message : "Unauthorized"
        })
        return
    }

    try{
        const newPassword = req.body.password

        if(newPassword){
            req.body.password = bcrypt.hashSync(newPassword, 10)
        }

        await User.updateOne({_id : req.params.id}, req.body)

        const user = await User.findOne({_id : req.params.id})

        const profileChanged = req.body.firstName || req.body.lastName || req.body.email || req.body.phone || newPassword

        if(user != null && user.firebaseUid && profileChanged){
            try{
                const firebase = await import("../firebase.js")

                const fullName = user.lastName && user.lastName !== "-" ? user.firstName + " " + user.lastName : user.firstName

                await firebase.db.collection("users").doc(user.firebaseUid).set({
                    name : fullName,
                    email : user.email,
                    phoneNo : user.phone
                }, { merge : true })

                const authUpdate = {
                    email : user.email,
                    displayName : fullName
                }

                if(newPassword){
                    authUpdate.password = newPassword
                }

                await firebase.auth.updateUser(user.firebaseUid, authUpdate)
            }
            catch(err){
                res.status(500).json({
                    message : "Saved in MongoDB, but the Firebase update failed: " + err.message
                })
                return
            }
        }

        res.json({
            message : "User Updated"
        })
    }
    catch(err){
        res.status(500).json({
            message : "Error updating user",
            error : err.message
        })
    }
}

export async function deleteUser(req,res){
    if(!isAdmin(req)){
        res.status(401).json({
            message : "Unauthorized"
        })
        return
    }

    try{
        const user = await User.findOne({_id : req.params.id})

        if(user == null){
            res.status(404).json({
                message : "User not found"
            })
            return
        }

        if(user.role == "driver"){
            const scheduleCount = await Schedule.countDocuments({driver : user._id})

            if(scheduleCount > 0){
                res.status(400).json({
                    message : "Cannot delete driver " + user.firstName + " " + user.lastName + ". "
                })
                return
            }
        }

        if(user.firebaseUid){
            try{
                const firebase = await import("../firebase.js")

                await firebase.db.collection("users").doc(user.firebaseUid).delete()

                await firebase.auth.deleteUser(user.firebaseUid).catch((err)=>{
                    if(err.code !== "auth/user-not-found"){
                        throw err
                    }
                })
            }
            catch(err){
                res.status(500).json({
                    message : "Could not remove the Firebase account: " + err.message
                })
                return
            }
        }

        if(user.role == "driver"){
            await Vechicle.updateMany({assignedDriver : user._id}, {assignedDriver : null})
        }

        await User.deleteOne({_id : user._id})

        res.json({
            message : "User Deleted"
        })
    }
    catch(err){
        res.status(500).json({
            message : "Error deleting user",
            error : err.message
        })
    }
}

export async function createDriver(req,res){
    if(!isAdmin(req)){
        res.status(401).json({
            message : "Unauthorized"
        })
        return
    }

    const data = req.body

    if(!data.email || !data.nic || !data.firstName || !data.phone){
        res.status(400).json({
            message : "Name, NIC, email and phone are required."
        })
        return
    }

    if(!data.password || data.password.length < 8){
        res.status(400).json({
            message : "Password must be at least 8 characters."
        })
        return
    }

    if(!data.vechicleNumber){
        res.status(400).json({
            message : "Please select a truck for the driver."
        })
        return
    }

    let firebase = null
    let firebaseUser = null
    let mongoUser = null

    try{
        const existing = await User.findOne({$or : [{email : data.email}, {nic : data.nic}]})

        if(existing != null){
            res.status(400).json({
                message : "A user with this email or NIC already exists."
            })
            return
        }

        const vechicle = await Vechicle.findOne({vechicleNumber : data.vechicleNumber})

        if(vechicle == null){
            res.status(404).json({
                message : "Truck not found."
            })
            return
        }

        if(vechicle.assignedDriver != null){
            const currentDriver = await User.findOne({_id : vechicle.assignedDriver})

            if(currentDriver != null){
                res.status(400).json({
                    message : "Truck " + data.vechicleNumber + " is already assigned to another driver."
                })
                return
            }
        }

        firebase = await import("../firebase.js")

        const lastName = data.lastName || "-"
        const fullName = lastName !== "-" ? data.firstName + " " + lastName : data.firstName

        firebaseUser = await firebase.auth.createUser({
            email : data.email,
            password : data.password,
            displayName : fullName
        })

        mongoUser = new User({
            nic : data.nic,
            email : data.email,
            firstName : data.firstName,
            lastName : lastName,
            password : bcrypt.hashSync(data.password, 10),
            phone : data.phone,
            address : data.address || "",
            role : "driver",
            status : data.status || "active",
            firebaseUid : firebaseUser.uid
        })

        await mongoUser.save()

        await firebase.db.collection("users").doc(firebaseUser.uid).set({
            uid : firebaseUser.uid,
            name : fullName,
            email : data.email,
            phoneNo : data.phone,
            role : "driver",
            createdAt : new Date()
        })

        vechicle.assignedDriver = mongoUser._id
        await vechicle.save()

        res.status(201).json({
            message : "Driver Created Successfully !",
            id : mongoUser._id
        })
    }
    catch(err){
        if(mongoUser != null){
            await User.deleteOne({_id : mongoUser._id}).catch(()=>{})
        }

        if(firebaseUser != null && firebase != null){
            await firebase.db.collection("users").doc(firebaseUser.uid).delete().catch(()=>{})
            await firebase.auth.deleteUser(firebaseUser.uid).catch(()=>{})
        }

        let message = err.message

        if(err.code === "auth/email-already-exists"){
            message = "This email is already registered in Firebase."
        }
        if(err.code === "auth/invalid-password"){
            message = "Password must be at least 6 characters."
        }
        if(err.code === "auth/invalid-email"){
            message = "Invalid email address."
        }

        res.status(400).json({
            message : message
        })
    }
}

export async function getDriverLocations(req,res){
    if(!isAdmin(req)){
        res.status(401).json({
            message : "Unauthorized"
        })
        return
    }

    try{
        const drivers = await User.find({
            role : "driver",
            "currentLocation.latitude" : {$ne : null},
            locationUpdatedAt : {$ne : null}
        }).select("firstName lastName status currentLocation locationUpdatedAt")

        const vechicles = await Vechicle.find({
            assignedDriver : {$in : drivers.map((d)=>d._id)}
        })

        const result = drivers.map((driver)=>{
            const truck = vechicles.find((v)=>String(v.assignedDriver) === String(driver._id))

            return {
                id : driver._id,
                name : driver.firstName + " " + driver.lastName,
                vehicleNo : truck ? truck.vechicleNumber : "-",
                status : driver.status,
                latitude : driver.currentLocation.latitude,
                longitude : driver.currentLocation.longitude,
                updatedAt : driver.locationUpdatedAt
            }
        })

        res.status(200).json(result)
    }
    catch(err){
        res.status(500).json({
            error : err.message
        })
    }
}