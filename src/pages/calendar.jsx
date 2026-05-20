import { useEffect, useState } from "react";
import {
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "../firebase";
import { eventsCollection } from "../services/firestore";

import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

function Calendar() {
  const [events, setEvents] = useState([]);

  const [form, setForm] = useState({
    title: "",
    date: "",
    location: "",
    description: "",
  });

  useEffect(() => {
    const q = query(eventsCollection, orderBy("date"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventData = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));

      setEvents(eventData);
    });

    return () => unsubscribe();
  }, []);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleAddEvent(event) {
    event.preventDefault();

    if (!form.title || !form.date) {
      alert("Please enter at least a title and date.");
      return;
    }

    await addDoc(eventsCollection, form);

    setForm({
      title: "",
      date: "",
      location: "",
      description: "",
    });
  }

  async function handleDeleteEvent(id) {
    await deleteDoc(doc(db, "events", id));
  }

  async function handleEditEvent(id) {
    
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        School Calendar
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Add Event
          </Typography>

          <Box component="form" onSubmit={handleAddEvent}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Event Title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <Button type="submit" variant="contained">
                  Add Event
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Events Database
          </Typography>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {events.map((schoolEvent) => (
                <TableRow key={schoolEvent.id}>
                  <TableCell>{schoolEvent.title}</TableCell>
                  <TableCell>{schoolEvent.date}</TableCell>
                  <TableCell>{schoolEvent.location}</TableCell>
                  <TableCell>{schoolEvent.description}</TableCell>
                  <TableCell>
                    <Button
                      color="error"
                      variant="outlined"
                      onClick={() => handleDeleteEvent(schoolEvent.id)}
                    >
                      Delete
                    </Button>
                    <Button
                      color="primary"
                      variant="outlined"
                      onClick={() => handleEditEvent(schoolEvent.id)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {events.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>No events found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Calendar;