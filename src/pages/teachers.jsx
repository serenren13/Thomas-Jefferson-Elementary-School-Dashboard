import { useState, useEffect } from "react"
import { addTeacher, subscribeToTeachers, subscribeToClasses, deleteTeacher, updateTeacher } from "../services/firestore"
import { Box, Button, Card, CardContent, MenuItem, TextField, Typography, Chip } from "@mui/material"

export default function Teachers() {
    const [teachers, setTeachers] = useState([])
    const [selectedSubject, setSelectedSubject] = useState("all")
    const [editingId, setEditingId] = useState(null)
    const [editForm, setEditForm] = useState({})
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [subject, setSubject] = useState("")
    const [classIds, setClassIds] = useState([])
    const [classes, setClasses] = useState([])

    useEffect(() => {
        const unsubscribe = subscribeToTeachers(setTeachers)
        return unsubscribe
    }, [])

    useEffect(() => {
        const unsubscribe = subscribeToClasses(setClasses)
        return unsubscribe
    }, [])

    const handleSubmit = async (e) => {
                e.preventDefault()
                await addTeacher(
                    firstName,
                    lastName,
                    email,
                    subject,
                    classIds,
                )
                setFirstName("")
                setLastName("")
                setEmail("")
                setSubject("")
                setClassIds([])
            }

    const subjects = ["all", ...new Set(teachers.map(t => t.subject).filter(Boolean))]

    const filteredTeachers = selectedSubject === "all"
        ? teachers
        : teachers.filter(t => t.subject === selectedSubject)

    const removeTeacher = async (teacherId) => {
        await deleteTeacher(teacherId)
    }

    const handleEdit = (teacher) => {
        setEditingId(teacher.id)
        setEditForm({
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            subject: teacher.subject,
            email: teacher.email
        })
    }

    const handleSave = async (teacherId) => {
        await updateTeacher(teacherId, editForm)
        setEditingId(null)
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Teacher Directory
            </Typography>

            <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
                {subjects.map((subject) => (
                    <Chip
                        key={subject}
                        label={subject === "all" ? "All Teachers" : subject}
                        onClick={() => setSelectedSubject(subject)}
                        variant={selectedSubject === subject ? "filled" : "outlined"}
                        color={selectedSubject === subject ? "primary" : "default"}
                    />
                ))}
            </Box>

            <Box sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" },
                gap: 2
            }}>
                {filteredTeachers.map((teacher) => (
                    <Card key={teacher.id} variant="outlined">
                        <CardContent>
                            {editingId === teacher.id ? (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    <TextField label="First Name" value={editForm.firstName ?? ""} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} fullWidth />
                                    <TextField label="Last Name" value={editForm.lastName ?? ""} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} fullWidth />
                                    <TextField label="Subject" value={editForm.subject ?? ""} onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })} fullWidth />
                                    <TextField label="Email" value={editForm.email ?? ""} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} fullWidth />
                                    <Box sx={{ display: "flex", gap: 1 }}>
                                        <Button variant="contained" onClick={() => handleSave(teacher.id)}>Save</Button>
                                        <Button variant="outlined" onClick={() => setEditingId(null)}>Cancel</Button>
                                    </Box>
                                </Box>
                            ) : (
                                <>
                                    <Typography variant="h6" fontWeight="bold">
                                        {teacher.firstName} {teacher.lastName}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        {teacher.subject ?? "—"}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        {teacher.email ?? "—"}
                                    </Typography>
                                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                                        <Button onClick={() => removeTeacher(teacher.id)} color="error" variant="outlined">Delete</Button>
                                        <Button onClick={() => handleEdit(teacher)} variant="outlined">Edit</Button>
                                    </Box>
                                </>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </Box>

            <Box sx={{ mt: 4, p: 3, border: "1px solid #e0e0e0", borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
                Add New Teacher
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField 
                        label="First Name" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        fullWidth />
                    <TextField 
                        label="Last Name" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        fullWidth />
                </Box>
                <TextField 
                    label="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    fullWidth />
                <TextField 
                    label="Subject" 
                    value={subject} 
                    onChange={(e) => setSubject(e.target.value)} 
                    fullWidth />
                <TextField 
                    select
                    SelectProps={{ multiple: true }}
                    label="Classes" 
                    name="classIds" 
                    value={classIds}
                    onChange={(e) => setClassIds(e.target.value)} 
                    fullWidth
                >
                    {classes.map((cls) => (
                        <MenuItem 
                            key={cls.id}
                            value={cls.id}>
                                {cls.name}
                            </MenuItem>
                    ))}
                </TextField>
                <Button type="submit" variant="contained" sx={{ alignSelf: "flex-start" }}>
                    Add Teacher
                </Button>
            </Box>
        </Box>
        </Box>
    )
}