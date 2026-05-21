import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { classesCollection } from "../services/firestore";
import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

const emptyForm = {
  name: "",
  gradeLevel: "",
  averageGrade: "",
  teacherId: "",
};

export default function ClassesDashboard() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [editingClassId, setEditingClassId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // live list of classes
  useEffect(() => {
    const unsubscribe = onSnapshot(classesCollection, (snapshot) => {
      const classList = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));
      setClasses(classList);
    });

    return () => unsubscribe();
  }, []);

  // teachers for dropdown
  useEffect(() => {
    getDocs(collection(db, "teachers")).then((snapshot) => {
      const teacherList = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));
      setTeachers(teacherList);
    });
  }, []);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  function handleEdit(classItem) {
    setEditingClassId(classItem.id);
    setForm({
      name: classItem.name || "",
      gradeLevel: classItem.gradeLevel ?? "",
      averageGrade: classItem.averageGrade ?? "",
      teacherId: classItem.teacherId || "",
    });
  }

  function handleCancelEdit() {
    setEditingClassId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter a class name.");
      return;
    }

    const classData = {
      name: form.name.trim(),
      gradeLevel: Number(form.gradeLevel) || 0,
      averageGrade: Number(form.averageGrade) || 0,
      teacherId: form.teacherId || "",
      studentIds: [],
      classID: Number(form.gradeLevel) || 0,
    };

    if (editingClassId) {
      const existing = classes.find((c) => c.id === editingClassId);
      // keep roster on edit
      let ids = existing?.studentIds || [];
      if (typeof ids === "string") ids = ids ? [ids] : [];
      if (!Array.isArray(ids)) ids = [];
      classData.studentIds = ids;
      await updateDoc(doc(db, "classes", editingClassId), classData);
      setEditingClassId(null);
    } else {
      await addDoc(classesCollection, classData);
    }

    setForm(emptyForm);
  }

  async function handleDelete(classId) {
    if (!window.confirm("Delete this class?")) return;
    await deleteDoc(doc(db, "classes", classId));
    if (editingClassId === classId) {
      handleCancelEdit();
    }
  }

  return (
    <Box sx={{ p: 3, width: "100%" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Classes Dashboard
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {editingClassId ? "Edit Class" : "Add Class"}
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(4, 1fr) auto auto",
              },
              gap: 2,
              alignItems: "center",
            }}
          >
            <TextField
              label="Class name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <TextField
              label="Grade level"
              name="gradeLevel"
              type="number"
              value={form.gradeLevel}
              onChange={handleChange}
            />

            <TextField
              label="Average grade"
              name="averageGrade"
              type="number"
              value={form.averageGrade}
              onChange={handleChange}
            />

            <TextField
              select
              label="Teacher"
              name="teacherId"
              value={form.teacherId}
              onChange={handleChange}
            >
              <MenuItem value="">No teacher</MenuItem>
              {teachers.map((teacher) => (
                <MenuItem key={teacher.id} value={teacher.id}>
                  {teacher.firstName} {teacher.lastName}
                </MenuItem>
              ))}
            </TextField>

            <Button type="submit" variant="contained" sx={{ height: "56px" }}>
              {editingClassId ? "Update" : "Add"}
            </Button>

            {editingClassId && (
              <Button
                type="button"
                variant="outlined"
                sx={{ height: "56px" }}
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {classes.length === 0 ? (
        <Typography color="text.secondary">No classes yet.</Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" },
            gap: 2,
          }}
        >
          {classes.map((classItem) => {
            const teacher = teachers.find((t) => t.id === classItem.teacherId);

            return (
              <Card key={classItem.id} variant="outlined">
                <CardContent>
                  <Typography variant="h6" fontWeight="bold">
                    {classItem.name || "Unnamed class"}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Grade level: {classItem.gradeLevel ?? "—"}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Average grade: {classItem.averageGrade ?? "—"}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Teacher:{" "}
                    {teacher
                      ? `${teacher.firstName} ${teacher.lastName}`
                      : "—"}
                  </Typography>

                  <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Button
                      variant="contained"
                      component={Link}
                      to={`/class/${classItem.id}`}
                      sx={{ backgroundColor: "#1f2937" }}
                    >
                      Open
                    </Button>

                    <Button
                      variant="outlined"
                      onClick={() => handleEdit(classItem)}
                    >
                      Edit
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(classItem.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
