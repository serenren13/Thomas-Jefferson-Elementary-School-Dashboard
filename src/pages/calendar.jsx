import { useEffect, useState } from "react";
import {
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
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

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

function Calendar() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [editingEventId, setEditingEventId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    date: dayjs().format("YYYY-MM-DD"),
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

  const selectedDateString = selectedDate.format("YYYY-MM-DD");

  const eventsForSelectedDate = events.filter(
    (event) => event.date === selectedDateString
  );

  function handleDateChange(newDate) {
    setSelectedDate(newDate);

    setForm({
      title: "",
      date: newDate.format("YYYY-MM-DD"),
      location: "",
      description: "",
    });

    setEditingEventId(null);
  }

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title || !form.date) {
      alert("Please enter at least a title and date.");
      return;
    }

    if (editingEventId) {
      await updateDoc(doc(db, "events", editingEventId), form);
      setEditingEventId(null);
    } else {
      await addDoc(eventsCollection, form);
    }

    setForm({
      title: "",
      date: selectedDateString,
      location: "",
      description: "",
    });
  }

  async function handleDeleteEvent(id) {
    await deleteDoc(doc(db, "events", id));
  }

  function handleEditEvent(schoolEvent) {
    setEditingEventId(schoolEvent.id);

    setForm({
      title: schoolEvent.title,
      date: schoolEvent.date,
      location: schoolEvent.location,
      description: schoolEvent.description,
    });

    setSelectedDate(dayjs(schoolEvent.date));
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        School Calendar
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={20} md={20}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Select Date
              </Typography>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                  value={selectedDate}
                  onChange={handleDateChange}
                />
              </LocalizationProvider>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={20} md={20}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {editingEventId ? "Edit Event" : "Add Event"}
              </Typography>

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Event Title"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12}>
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

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Location"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12}>
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
                      {editingEventId ? "Update Event" : "Add Event"}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Events on {selectedDateString}
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
              {eventsForSelectedDate.map((schoolEvent) => (
                <TableRow key={schoolEvent.id}>
                  <TableCell>{schoolEvent.title}</TableCell>
                  <TableCell>{schoolEvent.date}</TableCell>
                  <TableCell>{schoolEvent.location}</TableCell>
                  <TableCell>{schoolEvent.description}</TableCell>
                  <TableCell>
                    <Button
                      color="primary"
                      variant="outlined"
                      onClick={() => handleEditEvent(schoolEvent)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>

                    <Button
                      color="error"
                      variant="outlined"
                      onClick={() => handleDeleteEvent(schoolEvent.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {eventsForSelectedDate.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>No events for this date.</TableCell>
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