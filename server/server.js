import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper to get time ago
const minsAgo = (m) => {
  const now = new Date();
  return new Date(now - m * 60000).toISOString();
};

// Default mock database structure
const DEFAULT_DB = {
  zones: [
    { id: 'zone-a', name: 'Zone A', label: 'Quiet Study', color: '#2563EB', description: 'Silent zone for deep focus. No calls permitted.', features: ['Charging Ports', 'Noise-Free', 'Individual Desks', 'Reading Lamps'], capacity: 20, floorLevel: 2 },
    { id: 'zone-b', name: 'Zone B', label: 'Collaboration Area', color: '#4F46E5', description: 'Group study with whiteboards and collaborative tools.', features: ['Whiteboards', 'Group Tables', 'Projector', 'Charging Ports'], capacity: 20, floorLevel: 1 },
    { id: 'zone-c', name: 'Zone C', label: 'Window Seats', color: '#0891B2', description: 'Best natural light. Great views. Ideal for long sessions.', features: ['Natural Light', 'Charging Ports', 'Window View', 'Ergonomic Chairs'], capacity: 20, floorLevel: 3 },
    { id: 'zone-d', name: 'Zone D', label: 'Tech Hub', color: '#7C3AED', description: 'High-performance workstations with dual monitors and fast WiFi.', features: ['Dual Monitors', 'High-Speed WiFi', 'Charging Ports', 'Standing Desks'], capacity: 20, floorLevel: 1 }
  ],
  students: [
    { id: 'std-001', name: 'Arjun Mehta',      rollNo: 'CS21B001', dept: 'Computer Science',    year: 3 },
    { id: 'std-002', name: 'Priya Sharma',     rollNo: 'EC21B002', dept: 'Electronics',          year: 3 },
    { id: 'std-003', name: 'Rahul Verma',      rollNo: 'ME21B003', dept: 'Mechanical Eng.',      year: 3 },
    { id: 'std-004', name: 'Sneha Nair',       rollNo: 'CS22B004', dept: 'Computer Science',    year: 2 },
    { id: 'std-005', name: 'Vikram Patel',     rollNo: 'CE21B005', dept: 'Civil Engineering',   year: 3 },
    { id: 'std-006', name: 'Ananya Iyer',      rollNo: 'CS22B006', dept: 'Computer Science',    year: 2 },
    { id: 'std-007', name: 'Rohan Das',        rollNo: 'EE21B007', dept: 'Electrical Eng.',     year: 3 },
    { id: 'std-008', name: 'Divya Krishnan',   rollNo: 'CS21B008', dept: 'Computer Science',    year: 3 },
    { id: 'std-009', name: 'Karan Joshi',      rollNo: 'MA22B009', dept: 'Mathematics',          year: 2 },
    { id: 'std-010', name: 'Neha Gupta',       rollNo: 'PH21B010', dept: 'Physics',              year: 3 }
  ],
  desks: [],
  activityFeed: []
};

// Initialize Desks (80 desks, matching INITIAL_DESKS from mockData.js)
const initDesks = () => {
  const desks = [];
  
  // Zone A (A01 - A20)
  for (let i = 1; i <= 20; i++) {
    const id = `A${String(i).padStart(2, '0')}`;
    let status = 'available';
    let student = null;
    let checkIn = null;
    let awayStart = null;

    if (i === 2) { status = 'occupied'; student = 'std-002'; checkIn = minsAgo(45); }
    else if (i === 4) { status = 'occupied'; student = 'std-003'; checkIn = minsAgo(90); }
    else if (i === 6) { status = 'occupied'; student = 'std-005'; checkIn = minsAgo(30); }
    else if (i === 7) { status = 'away'; student = 'std-004'; checkIn = minsAgo(60); awayStart = minsAgo(8); }
    else if (i === 8) { status = 'away'; student = 'std-008'; checkIn = minsAgo(120); awayStart = minsAgo(12); }
    else if (i === 9) { status = 'abandoned'; student = 'std-001'; checkIn = minsAgo(150); awayStart = minsAgo(25); }
    else if (i === 11) { status = 'occupied'; student = 'std-005'; checkIn = minsAgo(20); }
    else if (i === 13) { status = 'occupied'; student = 'std-006'; checkIn = minsAgo(55); }
    else if (i === 14) { status = 'away'; student = 'std-009'; checkIn = minsAgo(80); awayStart = minsAgo(5); }
    else if (i === 16) { status = 'abandoned'; student = 'std-007'; checkIn = minsAgo(180); awayStart = minsAgo(30); }
    else if (i === 18) { status = 'occupied'; student = 'std-010'; checkIn = minsAgo(15); }
    else if (i === 20) { status = 'occupied'; student = 'std-003'; checkIn = minsAgo(35); }

    desks.push({ id, zone: 'zone-a', status, student, checkIn, awayStart, features: ['Charging', 'Lamp'] });
  }

  // Zone B (B01 - B20)
  for (let i = 1; i <= 20; i++) {
    const id = `B${String(i).padStart(2, '0')}`;
    let status = 'available';
    let student = null;
    let checkIn = null;
    let awayStart = null;

    if (i === 1) { status = 'occupied'; student = 'std-003'; checkIn = minsAgo(70); }
    else if (i === 3) { status = 'occupied'; student = 'std-010'; checkIn = minsAgo(40); }
    else if (i === 5) { status = 'occupied'; student = 'std-002'; checkIn = minsAgo(95); }
    else if (i === 6) { status = 'away'; student = 'std-006'; checkIn = minsAgo(100); awayStart = minsAgo(15); }
    else if (i === 8) { status = 'away'; student = 'std-009'; checkIn = minsAgo(110); awayStart = minsAgo(18); }
    else if (i === 9) { status = 'abandoned'; student = 'std-008'; checkIn = minsAgo(200); awayStart = minsAgo(35); }
    else if (i === 11) { status = 'occupied'; student = 'std-001'; checkIn = minsAgo(25); }
    else if (i === 13) { status = 'occupied'; student = 'std-007'; checkIn = minsAgo(60); }
    else if (i === 14) { status = 'away'; student = 'std-004'; checkIn = minsAgo(130); awayStart = minsAgo(10); }
    else if (i === 16) { status = 'occupied'; student = 'std-005'; checkIn = minsAgo(50); }
    else if (i === 17) { status = 'abandoned'; student = 'std-003'; checkIn = minsAgo(160); awayStart = minsAgo(28); }
    else if (i === 19) { status = 'occupied'; student = 'std-010'; checkIn = minsAgo(75); }

    desks.push({ id, zone: 'zone-b', status, student, checkIn, awayStart, features: ['Whiteboard', 'Charging'] });
  }

  // Zone C (C01 - C20)
  for (let i = 1; i <= 20; i++) {
    const id = `C${String(i).padStart(2, '0')}`;
    let status = 'available';
    let student = null;
    let checkIn = null;
    let awayStart = null;

    if (i === 2) { status = 'occupied'; student = 'std-006'; checkIn = minsAgo(50); }
    else if (i === 4) { status = 'occupied'; student = 'std-007'; checkIn = minsAgo(85); }
    else if (i === 6) { status = 'occupied'; student = 'std-004'; checkIn = minsAgo(30); }
    else if (i === 7) { status = 'occupied'; student = 'std-001'; checkIn = minsAgo(74); }
    else if (i === 8) { status = 'away'; student = 'std-010'; checkIn = minsAgo(120); awayStart = minsAgo(11); }
    else if (i === 10) { status = 'abandoned'; student = 'std-002'; checkIn = minsAgo(210); awayStart = minsAgo(40); }
    else if (i === 12) { status = 'occupied'; student = 'std-008'; checkIn = minsAgo(45); }
    else if (i === 13) { status = 'away'; student = 'std-009'; checkIn = minsAgo(90); awayStart = minsAgo(7); }
    else if (i === 15) { status = 'occupied'; student = 'std-007'; checkIn = minsAgo(65); }
    else if (i === 17) { status = 'occupied'; student = 'std-008'; checkIn = minsAgo(100); }
    else if (i === 18) { status = 'abandoned'; student = 'std-005'; checkIn = minsAgo(190); awayStart = minsAgo(38); }
    else if (i === 20) { status = 'occupied'; student = 'std-001'; checkIn = minsAgo(55); }

    desks.push({ id, zone: 'zone-c', status, student, checkIn, awayStart, features: ['Window', 'Charging', 'Ergonomic'] });
  }

  // Zone D (D01 - D20)
  for (let i = 1; i <= 20; i++) {
    const id = `D${String(i).padStart(2, '0')}`;
    let status = 'available';
    let student = null;
    let checkIn = null;
    let awayStart = null;

    if (i === 2) { status = 'occupied'; student = 'std-005'; checkIn = minsAgo(60); }
    else if (i === 4) { status = 'occupied'; student = 'std-008'; checkIn = minsAgo(105); }
    else if (i === 5) { status = 'away'; student = 'std-002'; checkIn = minsAgo(80); awayStart = minsAgo(16); }
    else if (i === 6) { status = 'occupied'; student = 'std-008'; checkIn = minsAgo(35); }
    else if (i === 9) { status = 'abandoned'; student = 'std-007'; checkIn = minsAgo(240); awayStart = minsAgo(45); }
    else if (i === 11) { status = 'occupied'; student = 'std-006'; checkIn = minsAgo(20); }
    else if (i === 13) { status = 'occupied'; student = 'std-001'; checkIn = minsAgo(75); }
    else if (i === 14) { status = 'away'; student = 'std-004'; checkIn = minsAgo(115); awayStart = minsAgo(9); }
    else if (i === 16) { status = 'occupied'; student = 'std-003'; checkIn = minsAgo(88); }
    else if (i === 17) { status = 'abandoned'; student = 'std-009'; checkIn = minsAgo(170); awayStart = minsAgo(33); }
    else if (i === 19) { status = 'occupied'; student = 'std-005'; checkIn = minsAgo(42); }
    else if (i === 20) { status = 'occupied'; student = 'std-006'; checkIn = minsAgo(68); }

    desks.push({ id, zone: 'zone-d', status, student, checkIn, awayStart, features: ['Dual Monitor', 'High-Speed WiFi', 'Charging'] });
  }

  return desks;
};

// Seed Activity Feed
const initActivityFeed = () => {
  const now = new Date();
  const formatTime = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const timeAgo = (h, m) => new Date(now - h * 3600000 - m * 60000);
  
  return [
    { id: 'act-001', time: formatTime(timeAgo(3, 40)), desk: 'A02', action: 'Occupied', student: 'Priya Sharma', icon: 'check-in' },
    { id: 'act-002', time: formatTime(timeAgo(3, 30)), desk: 'B01', action: 'Occupied', student: 'Rahul Verma', icon: 'check-in' },
    { id: 'act-003', time: formatTime(timeAgo(3, 20)), desk: 'C06', action: 'Occupied', student: 'Sneha Nair', icon: 'check-in' },
    { id: 'act-004', time: formatTime(timeAgo(3, 10)), desk: 'A04', action: 'Occupied', student: 'Rahul Verma', icon: 'check-in' },
    { id: 'act-005', time: formatTime(timeAgo(3, 0)),  desk: 'D02', action: 'Occupied', student: 'Vikram Patel', icon: 'check-in' },
    { id: 'act-006', time: formatTime(timeAgo(2, 50)), desk: 'A07', action: 'Away',     student: 'Sneha Nair', icon: 'away' },
    { id: 'act-011', time: formatTime(timeAgo(2, 25)), desk: 'A09', action: 'Abandoned',student: 'Arjun Mehta', icon: 'abandoned' },
    { id: 'act-013', time: formatTime(timeAgo(2, 15)), desk: 'C10', action: 'Released',  student: 'Priya Sharma', icon: 'release' }
  ];
};

// Read Database
const readDB = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const db = { ...DEFAULT_DB, desks: initDesks(), activityFeed: initActivityFeed() };
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
      return db;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Database read error, returning defaults:", error);
    return { ...DEFAULT_DB, desks: initDesks(), activityFeed: initActivityFeed() };
  }
};

// Write Database
const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error("Database write error:", error);
  }
};

// Log action to activity feed
const logActivity = (db, deskId, action, studentName) => {
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const iconMap = {
    'Occupied': 'check-in',
    'Away': 'away',
    'Released': 'release',
    'Abandoned': 'abandoned'
  };
  
  const newActivity = {
    id: `act-${Date.now()}`,
    time,
    desk: deskId,
    action,
    student: studentName || 'Unknown Student',
    icon: iconMap[action] || 'check-in'
  };
  
  db.activityFeed.unshift(newActivity);
  // Keep only last 50 events
  if (db.activityFeed.length > 50) {
    db.activityFeed.pop();
  }
};

// API Endpoints
app.get('/api/seats', (req, res) => {
  const db = readDB();
  res.json(db.desks);
});

app.get('/api/zones', (req, res) => {
  const db = readDB();
  res.json(db.zones);
});

app.get('/api/students', (req, res) => {
  const db = readDB();
  res.json(db.students);
});

app.get('/api/activity', (req, res) => {
  const db = readDB();
  res.json(db.activityFeed);
});

// Student check-in
app.post('/api/seats/checkin', (req, res) => {
  const { deskId, studentId } = req.body;
  const db = readDB();
  
  const deskIndex = db.desks.findIndex(d => d.id === deskId);
  if (deskIndex === -1) return res.status(404).json({ error: 'Seat not found' });
  
  const desk = db.desks[deskIndex];
  if (desk.status === 'occupied' && desk.student !== studentId) {
    return res.status(400).json({ error: 'Seat already occupied by another student' });
  }

  const student = db.students.find(s => s.id === studentId);
  const studentName = student ? student.name : 'Student';

  desk.status = 'occupied';
  desk.student = studentId;
  desk.checkIn = new Date().toISOString();
  desk.awayStart = null;

  logActivity(db, deskId, 'Occupied', studentName);
  writeDB(db);

  res.json({ success: true, desk });
});

// Student Away Mode
app.post('/api/seats/away', (req, res) => {
  const { deskId } = req.body;
  const db = readDB();
  
  const deskIndex = db.desks.findIndex(d => d.id === deskId);
  if (deskIndex === -1) return res.status(404).json({ error: 'Seat not found' });
  
  const desk = db.desks[deskIndex];
  if (desk.status !== 'occupied') {
    return res.status(400).json({ error: 'Seat is not currently occupied' });
  }

  const student = db.students.find(s => s.id === desk.student);
  const studentName = student ? student.name : 'Student';

  desk.status = 'away';
  desk.awayStart = new Date().toISOString();

  logActivity(db, deskId, 'Away', studentName);
  writeDB(db);

  res.json({ success: true, desk });
});

// Student checkout/release
app.post('/api/seats/checkout', (req, res) => {
  const { deskId } = req.body;
  const db = readDB();
  
  const deskIndex = db.desks.findIndex(d => d.id === deskId);
  if (deskIndex === -1) return res.status(404).json({ error: 'Seat not found' });
  
  const desk = db.desks[deskIndex];
  const student = db.students.find(s => s.id === desk.student);
  const studentName = student ? student.name : 'Student';

  desk.status = 'available';
  desk.student = null;
  desk.checkIn = null;
  desk.awayStart = null;

  logActivity(db, deskId, 'Released', studentName);
  writeDB(db);

  res.json({ success: true, desk });
});

// Librarian override/reset manual
app.post('/api/seats/reset', (req, res) => {
  const { deskId } = req.body;
  const db = readDB();
  
  const deskIndex = db.desks.findIndex(d => d.id === deskId);
  if (deskIndex === -1) return res.status(404).json({ error: 'Seat not found' });
  
  const desk = db.desks[deskIndex];
  const student = db.students.find(s => s.id === desk.student);
  const studentName = student ? student.name : 'Student';

  desk.status = 'available';
  desk.student = null;
  desk.checkIn = null;
  desk.awayStart = null;

  logActivity(db, deskId, 'Released', `${studentName} (Librarian Override)`);
  writeDB(db);

  res.json({ success: true, desk });
});

// Librarian reset all abandoned seats
app.post('/api/seats/reset-all-abandoned', (req, res) => {
  const db = readDB();
  let count = 0;

  db.desks.forEach(desk => {
    if (desk.status === 'abandoned') {
      const student = db.students.find(s => s.id === desk.student);
      const studentName = student ? student.name : 'Student';

      desk.status = 'available';
      desk.student = null;
      desk.checkIn = null;
      desk.awayStart = null;

      logActivity(db, desk.id, 'Released', `${studentName} (Bulk Reset)`);
      count++;
    }
  });

  if (count > 0) {
    writeDB(db);
  }

  res.json({ success: true, count });
});

// Dashboard analytics
app.get('/api/analytics', (req, res) => {
  const db = readDB();
  
  // Calculate summary stats
  const totalDesks = db.desks.length;
  const available = db.desks.filter(d => d.status === 'available').length;
  const occupied = db.desks.filter(d => d.status === 'occupied').length;
  const away = db.desks.filter(d => d.status === 'away').length;
  const abandoned = db.desks.filter(d => d.status === 'abandoned').length;
  const occupancyPercent = Math.round(((occupied + away + abandoned) / totalDesks) * 100);

  res.json({
    summary: {
      totalDesks,
      occupancyPercent,
      available,
      occupied,
      away,
      abandoned
    }
  });
});

// Expired Seats Timer (runs every 30 seconds for quick updates during hackathon)
setInterval(() => {
  const db = readDB();
  const now = new Date();
  let modified = false;

  db.desks.forEach(desk => {
    // 20 minutes limit for away status
    if (desk.status === 'away' && desk.awayStart) {
      const awayTime = new Date(desk.awayStart);
      const diffMins = (now - awayTime) / 60000;
      
      if (diffMins >= 20) {
        desk.status = 'abandoned';
        const student = db.students.find(s => s.id === desk.student);
        const studentName = student ? student.name : 'Student';
        
        logActivity(db, desk.id, 'Abandoned', studentName);
        modified = true;
        console.log(`Seat ${desk.id} marked as abandoned (Away for ${Math.round(diffMins)} minutes)`);
      }
    }
  });

  if (modified) {
    writeDB(db);
  }
}, 30000);

app.listen(PORT, () => {
  console.log(`StudySpot backend running on port ${PORT}`);
});
