import { useState, useEffect } from "react"
import { addStudent, subscribeToStudents, subscribeToClasses, deleteStudent, updateStudent } from "../services/firestore"
import { Box, Button, Card, CardContent, Chip, MenuItem, TextField, Typography } from "@mui/material"

export default function Students() {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [birthday, setBirthday] = useState("")
    const [gradeLevel, setGradeLevel] = useState("")
    const [classIds, setClassIds] = useState([])
    const [parentEmailContact, setParentEmailContact] = useState("")
    const [students, setStudents] = useState([])
    const [classes, setClasses] = useState([])
    const [selectedClass, setSelectedClass] = useState("all")
    const [editingId, setEditingId] = useState(null)
    const [editForm, setEditForm] = useState({})

    useEffect(() => {
        const unsubscribe = subscribeToStudents(setStudents)
        return unsubscribe
    }, [])

    useEffect(() => {
        const unsubscribe = subscribeToClasses(setClasses)
        return unsubscribe
    }, [])

    const handleSubmit = async (e) => {
            e.preventDefault()
            await addStudent(
                firstName,
                lastName,
                birthday,
                gradeLevel,
                classIds,
                parentEmailContact
            )
            setFirstName("")
            setLastName("")
            setBirthday("")
            setGradeLevel("")
            setClassIds([])
            setParentEmailContact("")
        }

    const filteredStudents = selectedClass === "all"
        ? students
        : students.filter((student) => student.classIds?.includes(selectedClass))

    const removeStudent = async (studentId) => {
        await deleteStudent(studentId)
    }

    const handleEdit = (student) => {
        setEditingId(student.id)
        setEditForm({
            firstName: student.firstName,
            lastName: student.lastName,
            gradeLevel: student.gradeLevel,
            parentEmailContact: student.parentEmailContact
        })
    }

    const handleSave = async (studentId) => {
        await updateStudent(studentId, editForm)
        setEditingId(null)
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Student Directory
            </Typography>

            <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
                <Chip
                    label="All Students"
                    onClick={() => setSelectedClass("all")}
                    variant={selectedClass === "all" ? "filled" : "outlined"}
                    color={selectedClass === "all" ? "primary" : "default"}
                />
                {classes.map((cls) => (
                    <Chip
                        key={cls.id}
                        label={cls.name}
                        onClick={() => setSelectedClass(cls.id)}
                        variant={selectedClass === cls.id ? "filled" : "outlined"}
                        color={selectedClass === cls.id ? "primary" : "default"}
                    />
                ))}
            </Box>

            <Box sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" },
                gap: 2
            }}>
                {filteredStudents.map((student) => (
                    <Card key={student.id} variant="outlined">
                        <CardContent>
                            {editingId === student.id ? (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    <TextField 
                                        label="First Name" 
                                        value={editForm.firstName ?? ""} 
                                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} 
                                        fullWidth />
                                    <TextField 
                                        label="Last Name" 
                                        value={editForm.lastName ?? ""} 
                                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} 
                                        fullWidth />
                                    <TextField 
                                        label="Grade Level" 
                                        value={editForm.gradeLevel ?? ""} 
                                        onChange={(e) => setEditForm({ ...editForm, gradeLevel: e.target.value })} 
                                        fullWidth />
                                    <TextField 
                                        label="Parent Email" 
                                        value={editForm.parentEmailContact ?? ""} 
                                        onChange={(e) => setEditForm({ ...editForm, parentEmailContact: e.target.value })} 
                                        fullWidth />
                                    <Box sx={{ display: "flex", gap: 1 }}>
                                        <Button variant="contained" onClick={() => handleSave(student.id)}>Save</Button>
                                        <Button variant="outlined" onClick={() => setEditingId(null)}>Cancel</Button>
                                    </Box>
                                </Box>
                            ) : (
                                <>
                                    <Typography variant="h6" fontWeight="bold">
                                        {student.firstName} {student.lastName}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Grade level: {student.gradeLevel ?? "-"}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        {student.parentEmailContact ?? "-"}
                                    </Typography>
                                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                                        <Button onClick={() => removeStudent(student.id)} color="error" variant="outlined">Delete</Button>
                                        <Button onClick={() => handleEdit(student)} variant="outlined">Edit</Button>
                                    </Box>
                                </>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </Box>

            <Box sx={{ mt: 4, p: 3, border: "1px solid #e0e0e0", borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
                Add New Student
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
                <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField 
                        label="Birthday" 
                        type="date" value={birthday} 
                        onChange={(e) => setBirthday(e.target.value)} 
                        fullWidth InputLabelProps={{ shrink: true }} />
                    <TextField 
                        label="Grade Level" 
                        type="number" 
                        value={gradeLevel} 
                        onChange={(e) => setGradeLevel(e.target.value)} 
                        fullWidth />
                </Box>
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
                        <MenuItem key={cls.id} value={cls.id}>
                            {cls.name}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField 
                    label="Parent Email" 
                    value={parentEmailContact} 
                    onChange={(e) => setParentEmailContact(e.target.value)} 
                    fullWidth />
                <Button type="submit" variant="contained" sx={{ alignSelf: "flex-start" }}>
                    Add Student
                </Button>
            </Box>
        </Box>
        </Box>
    )
}