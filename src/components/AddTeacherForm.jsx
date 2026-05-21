import { useState } from "react"
import { addDoc, collection } from "firebase/firestore"
import { db } from "../firebase/firebase"
import { Box, Button, TextField, Typography } from "@mui/material"

export default function AddTeacherForm() {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [subject, setSubject] = useState("")
    const [classIds, setClassIds] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        await addDoc(collection(db, "teachers"), {
            firstName,
            lastName,
            email,
            subject,
            classIds: classIds.split(",").map(id => id.trim())
        })
        setFirstName("")
        setLastName("")
        setEmail("")
        setSubject("")
        setClassIds("")
    }

    return (
        <Box sx={{ mt: 4, p: 3, border: "1px solid #e0e0e0", borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
                Add New Teacher
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} fullWidth />
                    <TextField label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} fullWidth />
                </Box>
                <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
                <TextField label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} fullWidth />
                <TextField label="Class IDs (comma separated)" value={classIds} onChange={(e) => setClassIds(e.target.value)} fullWidth />
                <Button type="submit" variant="contained" sx={{ alignSelf: "flex-start" }}>
                    Add Teacher
                </Button>
            </Box>
        </Box>
    )
}