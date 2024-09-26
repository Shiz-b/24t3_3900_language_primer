import express, { Request, Response } from 'express';
import cors from 'cors';


// NOTE: you may modify these interfaces
interface Student {
  id: number;
  name: string;
}

interface GroupSummary {
  id: number;
  groupName: string;
  members: number[];
}

interface Group {
  id: number;
  groupName: string;
  members: Student[];
}

// Data stored here for persistance
let totalStudents: number = 0;
const groups: Group[] = [];

const app = express();
const port = 3902;

app.use(cors());
app.use(express.json());

/**
 * Route to get all groups
 * @route GET /api/groups
 * @returns {Array} - Array of group objects
 */
app.get('/api/groups', (req: Request, res: Response) => {
  const allGroups: GroupSummary[] = [];
  for (const group of groups) {

    // Collect student ids of all students in a group
    const studentNumber: number[] = [];
    for (const student of group.members) {
      studentNumber.push(student.id);
    }

    // Add group summary to list of groups
    allGroups.push({
      id: group.id,
      groupName: group.groupName,
      members: studentNumber
    })
  }
  
  res.json(allGroups);
});

/**
 * Route to get all students (ensuring no duplicates -> edge case)
 * @route GET /api/students
 * @returns {Array} - Array of student objects
 */
app.get('/api/students', (req: Request, res: Response) => {
  const allStudents: Student[] = [];

  for (const group of groups) {
    for (const student of group.members) {
      allStudents.push(student);
    }
  }

  res.json(allStudents);
});

/**
 * Route to add a new group (assuming every student in the group is unique)
 * @route POST /api/groups
 * @param {string} req.body.groupName - The name of the group
 * @param {Array} req.body.members - Array of member names
 * @returns {Object} - The created group object
 */
app.post('/api/groups', (req: Request, res: Response) => {
  const groupName = req.body.groupName;
  const studentNames = req.body.members;
  const studentIds: number[] = [];
  const groupMembers: Student[] = []

  // Create every student in the group's list
  for (const studentName of studentNames) {
    studentIds.push(totalStudents);
    groupMembers.push({
      id: totalStudents,
      name: studentName
    })
    totalStudents += 1;
  }

  // Create the actual group
  const newGroup: Group = {
    id: groups.length,
    groupName: groupName,
    members: groupMembers
  }
  groups.push(newGroup);

  res.json({
    id: newGroup.id,
    groupName: newGroup.groupName,
    members: studentIds
  });
});

/**
 * Route to delete a group by ID
 * @route DELETE /api/groups/:id
 * @param {number} req.params.id - The ID of the group to delete
 * @returns {void} - Empty response with status code 204
 */
app.delete('/api/groups/:id', (req: Request, res: Response) => {
  const groupId = Number(req.body.id);
  groups.splice(groupId, 1);

  res.sendStatus(204); // send back a 204 (do not modify this line)
});

/**
 * Route to get a group by ID (for fetching group members)
 * @route GET /api/groups/:id
 * @param {number} req.params.id - The ID of the group to retrieve
 * @returns {Object} - The group object with member details
 */
app.get('/api/groups/:id', (req: Request, res: Response) => {
  const groupId = Number(req.params.id);

  // Checking and returning error for invalid groupIds
  if (groupId < 0 || groupId >= groups.length) {
    res.status(404).send("Group not found");
  }

  res.json(groups[groupId]);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
