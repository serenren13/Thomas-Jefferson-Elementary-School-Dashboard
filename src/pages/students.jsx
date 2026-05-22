import { useState, useEffect } from "react"
import { collection, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { db } from "../firebase/firebase"
import AddStudentForm from "../components/AddStudentForm"
import { Box, Button, Card, CardContent, TextField, Typography, Chip } from "@mui/material"

export default function Students() {
    const [students, setStudents] = useState([])
    const [classes, setClasses] = useState([])
    const [selectedClass, setSelectedClass] = useState("all")
    const [editingId, setEditingId] = useState(null)
    const [editForm, setEditForm] = useState({})


    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "students"), (snapshot) => {
            const studentList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }))
            setStudents(studentList)
        })
        return unsubscribe
    }, [])

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "classes"), (snapshot) => {
            const classList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }))
            setClasses(classList)
        })
        return unsubscribe
    }, [])

    const filteredStudents = selectedClass === "all"
        ? students
        : students.filter((student) => student.classIds?.includes(selectedClass))

    // removeStudent function
    const removeStudent = async (studentId) => {
        await deleteDoc(doc(db, "students", studentId))
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
        await updateDoc(doc(db, "students", studentId), editForm)
        setEditingId(null)
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
        await updateDoc(doc(db, "students", studentId), editForm)
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
                                    <TextField label="First Name" value={editForm.firstName ?? ""} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} fullWidth />
                                    <TextField label="Last Name" value={editForm.lastName ?? ""} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} fullWidth />
                                    <TextField label="Grade Level" value={editForm.gradeLevel ?? ""} onChange={(e) => setEditForm({ ...editForm, gradeLevel: e.target.value })} fullWidth />
                                    <TextField label="Parent Email" value={editForm.parentEmailContact ?? ""} onChange={(e) => setEditForm({ ...editForm, parentEmailContact: e.target.value })} fullWidth />
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
                                <TextField label="First Name" value={editForm.firstName ?? ""} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} fullWidth />
                                <TextField label="Last Name" value={editForm.lastName ?? ""} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} fullWidth />
                                <TextField label="Grade Level" value={editForm.gradeLevel ?? ""} onChange={(e) => setEditForm({ ...editForm, gradeLevel: e.target.value })} fullWidth />
                                <TextField label="Parent Email" value={editForm.parentEmailContact ?? ""} onChange={(e) => setEditForm({ ...editForm, parentEmailContact: e.target.value })} fullWidth />
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
                                <Button onClick={() => removeStudent(student.id)} color="error" variant="outlined">
                                    Delete
                                </Button>
                                <Button onClick={() => handleEdit(student)} variant="outlined" color="primary">
                                    Edit
                                </Button>
                            </>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </Box>
        <AddStudentForm />
    </Box>
    )
}