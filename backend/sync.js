import bcrypt from "bcrypt"
import crypto from "crypto"
import { db } from "./firebase.js"
import User from "./model/user.js"
import Schedule from "./model/Schedule.js"
import Vechicle from "./model/vechicle.js"
import CollectionRequest from "./model/collectionRequest.js"

const unusablePassword = bcrypt.hashSync(crypto.randomUUID(), 10)
const syncedRoles = ["driver", "resident"]

function toDate(value){
    if(value && value.toDate){
        return value.toDate()
    }
    return value ?? null
}

async function upsertUser(id, d){
    if(!syncedRoles.includes(d.role)){
        console.log("[sync:users] skipped " + id + " (role: " + d.role + ")")
        return
    }

    let user = await User.findOne({firebaseUid : id})

    if(user == null && d.email){
        user = await User.findOne({email : d.email})

        if(user != null && user.role !== d.role){
            console.log("[sync:users] skipped " + id + " (email already used by another role)")
            return
        }
    }

    if(user == null){
        user = new User({
            nic : d.nic || "FB-" + id,
            password : unusablePassword,
            createdAt : toDate(d.createdAt) || new Date()
        })
    }

        if(d.name){
        const names = d.name.trim().split(" ")
        user.firstName = names[0]
        user.lastName = names.slice(1).join(" ") || "-"
    }
    else if(!user.firstName){
        user.firstName = "-"
        user.lastName = "-"
    }

    user.firebaseUid = id
    user.email = d.email

    if(d.phoneNo){
        user.phone = d.phoneNo
    }
    else if(!user.phone){
        user.phone = "-"
    }

    if(d.address !== undefined){
        user.address = d.address
    }

    user.role = d.role

    if(d.nic){
        user.nic = d.nic
    }

    const latitude = d.lat ?? d.latitude
    const longitude = d.lon ?? d.longitude

    if(latitude != null && longitude != null){
        user.currentLocation = {
            latitude : latitude,
            longitude : longitude
        }

        if(d.locationUpdatedAt){
            user.locationUpdatedAt = toDate(d.locationUpdatedAt)
        }
    }

    await user.save()
}

async function removeUser(id){
    const user = await User.findOne({firebaseUid : id})

    if(user == null){
        return
    }

    if(user.role == "driver"){
        const scheduleCount = await Schedule.countDocuments({driver : user._id})

        if(scheduleCount > 0){
            console.log("[sync:users] kept " + id + " (driver has " + scheduleCount + " route(s))")
            return
        }

        await Vechicle.updateMany({assignedDriver : user._id}, {assignedDriver : null})
    }

    await User.deleteOne({_id : user._id})
}

function listen(label, query, upsert, remove){
    query.onSnapshot(
        async (snapshot)=>{
            for(const change of snapshot.docChanges()){
                try{
                    if(change.type === "removed"){
                        await remove(change.doc.id)
                    }
                    else{
                        await upsert(change.doc.id, change.doc.data())
                    }
                    if(!(label === "users" && change.type === "modified")){
                        console.log("[sync:" + label + "] " + change.type + " " + change.doc.id)
                    }
                }
                catch(err){
                    console.error("[sync:" + label + "]", err.message)
                }
            }
        },
        (err)=>{
            console.error("[sync:" + label + "]", err.message)
        }
    )
}

export default function startSync(){
    listen(
        "users",
        db.collection("users"),
        upsertUser,
        removeUser
    )

    listen(
        "requests",
        db.collection("requests"),
        (id, d)=>CollectionRequest.findByIdAndUpdate(id, {
            residentUid : d.residentUid,
            residentName : d.residentName,
            address : d.address,
            latitude : d.latitude,
            longitude : d.longitude,
            wasteType : d.wasteType,
            status : d.status,
            createdAt : toDate(d.createdAt),
            completedAt : toDate(d.completedAt)
        }, { upsert : true }),
        (id)=>CollectionRequest.findByIdAndDelete(id)
    )
}