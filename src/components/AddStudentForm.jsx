import { useState } from "react"
import { addStudent } from "../services/firestore"
import { Box, Button, TextField, Typography } from "@mui/material"

export default function AddStudentForm() {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [birthday, setBirthday] = useState("")
    const [gradeLevel, setGradeLevel] = useState("")
    const [classIds, setClassIds] = useState("")
    const [parentEmailContact, setParentEmailContact] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        await addStudent(
            firstName,
            lastName,
            birthday,
            gradeLevel,
            classIds.split(",").map(id => id.trim()),
            parentEmailContact
        )
        setFirstName("")
        setLastName("")
        setBirthday("")
        setGradeLevel("")
        setClassIds("")
        setParentEmailContact("")
    }

    return (
        <Box sx={{ mt: 4, p: 3, border: "1px solid #e0e0e0", borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
                Add New Student
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} fullWidth />
                    <TextField label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} fullWidth />
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField label="Birthday" type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
                    <TextField label="Grade Level" type="number" value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} fullWidth />
                </Box>
                <TextField label="Class IDs (comma separated)" value={classIds} onChange={(e) => setClassIds(e.target.value)} fullWidth />
                <TextField label="Parent Email" value={parentEmailContact} onChange={(e) => setParentEmailContact(e.target.value)} fullWidth />
                <Button type="submit" variant="contained" sx={{ alignSelf: "flex-start" }}>
                    Add Student
                </Button>
            </Box>
        </Box>
    )
}