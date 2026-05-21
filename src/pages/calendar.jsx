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
  TextField,
  Typography,
} from "@mui/material";

import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";

import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function CustomToolbar(toolbar) {
  const goToBack = () => {
    toolbar.onNavigate("PREV");
  };

  const goToNext = () => {
    toolbar.onNavigate("NEXT");
  };

  const goToToday = () => {
    toolbar.onNavigate("TODAY");
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Button variant="outlined" onClick={goToBack}>
          <ChevronLeft />
        </Button>

        <Button variant="outlined" onClick={goToToday}>
          Today
        </Button>

        <Button variant="outlined" onClick={goToNext}>
          <ChevronRight />
        </Button>
      </Box>

      <Typography variant="h5" fontWeight="bold">
        {toolbar.label}
      </Typography>
    </Box>
  );
}

function Calendar() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingEventId, setEditingEventId] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const [form, setForm] = useState({
    title: "",
    date: format(new Date(), "yyyy-MM-dd"),
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

  const selectedDateString = format(selectedDate, "yyyy-MM-dd");

  const calendarEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: new Date(event.date + "T09:00:00"),
    end: new Date(event.date + "T10:00:00"),
    resource: event,
  }));

  const eventsForSelectedDate = events.filter(
    (event) => event.date === selectedDateString
  );

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  function handleSelectSlot(slotInfo) {
    const clickedDate = slotInfo.start;
    const clickedDateString = format(clickedDate, "yyyy-MM-dd");

    setSelectedDate(clickedDate);
    setEditingEventId(null);

    setForm({
      title: "",
      date: clickedDateString,
      location: "",
      description: "",
    });
  }

  function handleSelectEvent(calendarEvent) {
    const schoolEvent = calendarEvent.resource;

    setSelectedDate(new Date(schoolEvent.date + "T09:00:00"));
    setEditingEventId(schoolEvent.id);

    setForm({
      title: schoolEvent.title,
      date: schoolEvent.date,
      location: schoolEvent.location,
      description: schoolEvent.description,
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

    setSelectedDate(new Date(form.date + "T09:00:00"));

    setForm({
      title: "",
      date: form.date,
      location: "",
      description: "",
    });
  }

  async function handleDeleteEvent(id) {
    await deleteDoc(doc(db, "events", id));
  }

  function handleEditEvent(schoolEvent) {
    setEditingEventId(schoolEvent.id);
    setSelectedDate(new Date(schoolEvent.date + "T09:00:00"));

    setForm({
      title: schoolEvent.title,
      date: schoolEvent.date,
      location: schoolEvent.location,
      description: schoolEvent.description,
    });
  }

  return (
    <Box sx={{ p: 3, width: "100%" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        School Calendar
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {editingEventId ? "Edit Event" : "Add Event"}
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(4, 1fr) auto",
              },
              gap: 2,
              alignItems: "center",
            }}
          >
            <TextField
              label="Event Title"
              name="title"
              value={form.title}
              onChange={handleChange}
            />

            <TextField
              type="date"
              label="Date"
              name="date"
              value={form.date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Location"
              name="location"
              value={form.location}
              onChange={handleChange}
            />

            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
            />

            <Button type="submit" variant="contained" sx={{ height: "56px" }}>
              {editingEventId ? "Update" : "Add"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", gap: 3, height: "700px" }}>
        <Card sx={{ flex: 4 }}>
          <CardContent sx={{ height: "100%" }}>
            <BigCalendar
              localizer={localizer}
              components={{
                toolbar: CustomToolbar,
              }}
              date={calendarDate}
              onNavigate={(newDate) => setCalendarDate(newDate)}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              selectable
              views={["month", "week", "day", "agenda"]}
              defaultView="month"
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              style={{ height: "100%",
                fontFamily: "Roboto, sans-serif",
               }}
            />
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, overflowY: "auto" }}>
          <CardContent>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Events
            </Typography>

            <Typography sx={{ mb: 2, fontWeight: "bold" }}>
              {selectedDateString}
            </Typography>

            {eventsForSelectedDate.length === 0 ? (
              <Typography color="text.secondary">
                No events for this date.
              </Typography>
            ) : (
              eventsForSelectedDate.map((schoolEvent) => (
                <Card key={schoolEvent.id} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography fontWeight="bold">
                      {schoolEvent.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {schoolEvent.location}
                    </Typography>

                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {schoolEvent.description}
                    </Typography>

                    <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleEditEvent(schoolEvent)}
                      >
                        Edit
                      </Button>

                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => handleDeleteEvent(schoolEvent.id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default Calendar;