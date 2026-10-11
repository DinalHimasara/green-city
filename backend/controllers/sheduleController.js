import Schedule from "../model/Schedule.js"
import User from "../model/user.js"
import Vechicle from "../model/vechicle.js"
import { isAdmin } from "./userController.js"
import { syncToFirebase } from "../nextCollection.js"

function bumpScheduleNumber(scheduleNumber) {
    const number = parseInt(String(scheduleNumber).replace("SC", "")) + 1
    return "SC" + number.toString().padStart(6, "0")
}

export async function addSchedule(req, res) {
    if (!isAdmin(req)) {
        res.status(401).json({
            message: "Unautharized Acess"
        })
        return
    }

    try {
        const latest = await Schedule.findOne().sort({ scheduleNumber: -1 })

        let scheduleNumber = "SC000001"

        if (latest != null) {
            scheduleNumber = bumpScheduleNumber(latest.scheduleNumber)
        }

        const driver = await User.findOne({ email: req.body.driver })

        if (driver == null || driver.role != "driver") {
            res.status(404).json({
                message: "Driver Not Found"
            })
            return
        }

        const vechicle = await Vechicle.findOne({ vechicleNumber: req.body.vechicle })

        if (vechicle == null) {
            res.status(404).json({
                message: "Vechicle Not foumd"
            })
            return
        }

        if (vechicle.assignedDriver == null || vechicle.assignedDriver.toString() !== driver._id.toString()) {
            res.status(400).json({
                message: "This vehicle is not assigned to the selected driver."
            })
            return
        }

        let saved = false

        for (let attempt = 0; attempt < 5 && !saved; attempt++) {
            try {
                const schedule = new Schedule({
                    ...req.body,
                    scheduleNumber,
                    driver: driver._id,
                    vechicle: vechicle._id
                })

                await schedule.save()
                saved = true
            }
            catch (err) {
                if (err.code === 11000 && attempt < 4) {
                    scheduleNumber = bumpScheduleNumber(scheduleNumber)
                }
                else {
                    throw err
                }
            }
        }

        const warning = await syncToFirebase(scheduleNumber, false)

        res.status(201).json({
            message: "Schedule Added Successfully !",
            warning: warning
        })
    }
    catch (err) {
        console.error("[schedule:add]", err)
        res.status(500).json({
            message: "Error Adding Schedule: " + err.message,
            error: err.message
        })
    }
}


export function getSchedule(req, res) {
    if (!isAdmin(req)) {
        res.status(401).json({
            message: "Unautharized Acess"
        })
        return
    }
    Schedule.find()
        .populate("driver", "firstName lastName")
        .populate("vechicle", "vechicleNumber")
        .sort({ collectionDate: -1 }).then(
            (schedules) => {
                res.status(200).json(schedules)
            }
        )
        .catch(
            (error) => {
                res.status(500).json({
                    message: "Error fetching vechicle"
                })
            }
        )
}

export function getScheduleById(req, res) {
    if (!isAdmin(req)) {
        res.status(401).json({
            message: "Unautharized Acess"
        })
        return
    }

    const scheduleNumber = req.params.scheduleNumber
    Schedule.findOne({ scheduleNumber }).populate("driver", "firstName lastName")
        .populate("vechicle", "vechicleNumber").then(
            (schedule) => {
                res.status(200).json(schedule)
            }
        ).catch(
            (error) => {
                res.status(500).json({
                    message: "Error fetching vechicle"
                })
            }
        )
}

export async function updateSchedule(req, res) {
    if (!isAdmin(req)) {
        res.status(401).json({
            message: "Unautharized Acess"
        })
        return
    }

    try {
        const scheduleNumber = req.params.scheduleNumber

        const schedule = await Schedule.findOne({ scheduleNumber })

        if (!schedule) {
            res.status(404).json({
                message: "Schedule not found"
            })
            return
        }

        const driver = await User.findOne({ email: req.body.driver })

        if (driver == null || driver.role != "driver") {
            res.status(404).json({
                message: "Driver Not Found"
            })
            return
        }

        const vechicle = await Vechicle.findOne({ vechicleNumber: req.body.vechicle })

        if (vechicle == null) {
            res.status(404).json({
                message: "Vechicle Not foumd"
            })
            return
        }

        if (vechicle.assignedDriver == null || vechicle.assignedDriver.toString() !== driver._id.toString()) {
            res.status(400).json({
                message: "This vehicle is not assigned to the selected driver."
            })
        }

        await Schedule.updateOne({scheduleNumber : req.params.scheduleNumber},
            {
                ...req.body,
                driver: driver._id,
                vechicle: vechicle._id
            }
        )

        const warning = await syncToFirebase(scheduleNumber, false)

        res.status(200).json({
            message : "Schedule updatead Suessfully!",
            warning : warning
        })

    }
    catch(err){
        res.status(500).json({
            error : err.message
        })
    }
}

export async function deleteSchedule(req,res){
    if (!isAdmin(req)) {
        res.status(401).json({
            message: "Unautharized Acess"
        })
        return
    }

    try{
        const scheduleNumber = req.params.scheduleNumber

        await Schedule.deleteOne({scheduleNumber : scheduleNumber})

        const warning = await syncToFirebase(scheduleNumber, true)

        res.status(200).json({
            message : "Schedule Deletead Successfuly!",
            warning : warning
        })
    }
    catch(err){
        res.status(400).json({
            error : err.message
        })
    }
}



