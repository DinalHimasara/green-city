import User from "../model/user.js";
import Vechicle from "../model/vechicle.js";
import { isAdmin } from "./userController.js";
import Schedule from "../model/Schedule.js"


export function addVechicle(req,res){
    if(!isAdmin(req)){
        res.status(401).json({
            message : "Unauthrized Acess"
        })
        return
    }

    const vechicle = new Vechicle(req.body)

    vechicle.save().then(
        ()=>{
            res.json({
                message : "New Vechicle Aded"
            })
        }
    )
}

export function getVechicle(req,res){
    if(!isAdmin(req)){
        res.status(401).json({
            message : "Unautharized Acess"
        })
        return
    }

    Vechicle.find().populate("assignedDriver", "firstName lastName").then(
        (vechicles)=>{
           res.json(vechicles)
        }
    ).catch(
        (err)=>{
            res.status(500).json({
                message : err.message
            })
        }
    )
}


export function getVechicleById(req,res){
    const vechicleNumber = req.params.vechicleNumber

    if(!isAdmin(req)){
        res.status(401).json({
            message : "Unautharized Acess"
        })
        return
    }

    Vechicle.findOne({vechicleNumber : vechicleNumber}).populate("assignedDriver", "firstName lastName").then(
        (vechicle)=>{
            if(vechicle == null){
                res.status(400).json({
                    message : "Vechicle Not found"
                })
            }
            else{
                res.json(vechicle)
            }
        }
    ).catch(
        (error)=>{
            res.status(500).json({
                message : "Error fetching vechicle"
            })
        }
    )
}

export function updateVechicle(req,res){
    const vechicleNumber = req.params.vechicleNumber

    if(!isAdmin(req)){
        res.status(401).json({
            message : "Unautharized Acess"
        })
        return
    }

    Vechicle.updateOne({vechicleNumber : vechicleNumber}, req.body).then(
        ()=>{
            res.status(200).json({
                message : "Vechicle Updated Sucessfully !"
            })
        }
    ).catch((err)=>{
        console.log(err)
        res.status(400).json({
            error : err.message
        })
    })

}

export async function deleteVechicle(req,res){
    if(!isAdmin(req)){
        res.status(401).json({
            message : "Unautharized Acess"
        })
        return
    }

    try{
        const vechicleNumber = req.params.vechicleNumber

        const vechicle = await Vechicle.findOne({vechicleNumber : vechicleNumber})

        if(vechicle == null){
            res.status(404).json({
                message : "Vechicle not found"
            })
            return
        }

        if(vechicle.assignedDriver != null){
            const driver = await User.findOne({_id : vechicle.assignedDriver})

            if(driver != null){
                res.status(400).json({
                    message : "Cannot delete truck " + vechicleNumber + ". "
                })
                return
            }
        }

        const scheduleCount = await Schedule.countDocuments({vechicle : vechicle._id})

        if(scheduleCount > 0){
            res.status(400).json({
                message : "Cannot delete truck " + vechicleNumber + ". It is used in " + scheduleCount + " route(s)."
            })
            return
        }

        await Vechicle.deleteOne({vechicleNumber : vechicleNumber})

        res.status(200).json({
            message : "Vechicle Delete Sucessfully"
        })
    }
    catch(err){
        res.status(500).json({
            message : err.message
        })
    }
}

export async function assignDriver(req,res){
    if(!isAdmin(req)){
        res.status(401).json({
            message : "Unautharized Acess"
        })
        return
    }

    try {
        const vechicleNumber = req.params.vechicleNumber
        const email = req.body.email

        const driver = await User.findOne({email})

        if(!driver){
            res.status(404).json({
                message : "Driver not found"
            })
            return
        }

        if(driver.role !== "driver"){
            res.status(400).json({
                message : "user is not a driver"
            })
            return
        }

        const vechicle = await Vechicle.findOne({vechicleNumber : vechicleNumber})

        if(!vechicle){
            res.status(404).json({
                message : "vechicle not found"
            })
            return
        }

        if(vechicle.assignedDriver != null && vechicle.assignedDriver.toString() !== driver._id.toString()){
            const other = await User.findOne({_id : vechicle.assignedDriver})

            if(other != null){
                res.status(400).json({
                    message : "Truck " + vechicleNumber + " is already assigned to another driver."
                })
                return
            }
        }

        await Vechicle.updateMany(
            {assignedDriver : driver._id, _id : {$ne : vechicle._id}},
            {assignedDriver : null}
        )

        vechicle.assignedDriver = driver._id

        await vechicle.save()

        res.status(200).json({
            message : "Driver assigned Sucessfully"
        })
    }
    catch(err){
        res.status(500).json({
            message : err.message
        })
    }
}