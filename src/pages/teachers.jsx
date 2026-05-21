import { useState, useEffect } from "react"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "../firebase/firebase"
import AddTeacherForm from "../components/AddTeacherForm"
import { Box, Card, CardContent, Typography, Chip } from "@mui/material"

export default function Teachers() {
    const [teachers, setTeachers] = useState([])
    const [selectedSubject, setSelectedSubject] = useState("all")

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "teachers"), (snapshot) => {
            const teacherList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }))
            setTeachers(teacherList)
        })
        return unsubscribe
    }, [])

    // get unique subjects for filter tabs
    const subjects = ["all", ...new Set(teachers.map(t => t.subject).filter(Boolean))]

    // filter teachers based on selected subject
    const filteredTeachers = selectedSubject === "all"
        ? teachers
        : teachers.filter(t => t.subject === selectedSubject)

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Teacher Directory
            </Typography>

            {/* Filter tabs */}
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

            {/* Teacher cards grid */}
            <Box sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" },
                gap: 2
            }}>
                {filteredTeachers.map((teacher) => (
                    <Card key={teacher.id} variant="outlined">
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold">
                                {teacher.firstName} {teacher.lastName}
                            </Typography>
                            <Typography color="text.secondary">
                                {teacher.subject ?? "—"}
                            </Typography>
                            <Typography color="text.secondary">
                                {teacher.email ?? "—"}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            <AddTeacherForm />
        </Box>
    )
}