/**
 * Official Delta SJEC Member Registry
 * Source of truth for Club Members, Branches, Departments, and Roles.
 */

export const CLUB_MEMBERS = [
  {
    name: 'Anish Dsouza',
    login_id: 'DEL0126847',
    email: 'del0126847@delta.sjec.ac.in',
    branch: 'AIML',
    department: 'ICBS',
    role_title: 'Computing Engineer',
    role: 'member',
    is_club_wide: false,
  },
  {
    name: 'Sanmith S Joseph',
    login_id: 'DEL0126193',
    email: 'del0126193@delta.sjec.ac.in',
    branch: 'AIML',
    department: 'ICBS',
    role_title: 'Computing Engineer',
    role: 'member',
    is_club_wide: false,
  },
  {
    name: 'Shawn Vas',
    login_id: 'DEL0126528',
    email: 'del0126528@delta.sjec.ac.in',
    branch: 'AIML',
    department: 'ICBS',
    role_title: 'Media Head',
    role: 'head',
    is_club_wide: true,
  },
  {
    name: 'Nikhitha HL',
    login_id: 'DEL0326419',
    email: 'del0326419@delta.sjec.ac.in',
    branch: 'ECE',
    department: 'ECE',
    role_title: 'Vice president of ECE',
    role: 'head',
    is_club_wide: true,
  },
  {
    name: 'Jawahar Lawrence Rodrigues',
    login_id: 'DEL0326936',
    email: 'del0326936@delta.sjec.ac.in',
    branch: 'ECE',
    department: 'ECE',
    role_title: 'President',
    role: 'head',
    is_club_wide: true,
  },
  {
    name: 'Norman Daran Dsouza',
    login_id: 'DEL0426731',
    email: 'del0426731@delta.sjec.ac.in',
    branch: 'MECH',
    department: 'MECH',
    role_title: 'Founder & VP, Mechanical Engineering',
    role: 'head',
    is_club_wide: true,
  },
  {
    name: 'Melria Smitha Gonsalves',
    login_id: 'DEL0126385',
    email: 'del0126385@delta.sjec.ac.in',
    branch: 'AIML',
    department: 'ICBS',
    role_title: 'Computing Engineer',
    role: 'member',
    is_club_wide: false,
  },
  {
    name: 'Vanyashree',
    login_id: 'DEL0326164',
    email: 'del0326164@delta.sjec.ac.in',
    branch: 'ECE',
    department: 'ECE',
    role_title: 'Electronics Engineer',
    role: 'member',
    is_club_wide: false,
  },
  {
    name: 'Anika Chrisal Patrao',
    login_id: 'DEL0226592',
    email: 'del0226592@delta.sjec.ac.in',
    branch: 'CSE',
    department: 'CSE',
    role_title: 'Digital Systems Engineer',
    role: 'member',
    is_club_wide: false,
  },
  {
    name: 'Anjali R Rai',
    login_id: 'DEL0126473',
    email: 'del0126473@delta.sjec.ac.in',
    branch: 'AIML',
    department: 'ICBS',
    role_title: 'Management Head',
    role: 'head',
    is_club_wide: true,
  },
  {
    name: 'Ananya Amarnath',
    login_id: 'DEL0226148',
    email: 'del0226148@delta.sjec.ac.in',
    branch: 'CSE',
    department: 'CSE',
    role_title: 'Digital Systems Engineer',
    role: 'member',
    is_club_wide: false,
  },
  {
    name: 'Melrick Prith Dsouza',
    login_id: 'DEL0126839',
    email: 'del0126839@delta.sjec.ac.in',
    branch: 'AIML',
    department: 'ICBS',
    role_title: 'Vice president of CSE',
    role: 'head',
    is_club_wide: true,
  },
  {
    name: 'Darren Merce Aranha',
    login_id: 'DEL0226916',
    email: 'del0226916@delta.sjec.ac.in',
    branch: 'CSE',
    department: 'CSE',
    role_title: 'Creative Editor',
    role: 'member',
    is_club_wide: false,
  },
]

export const MEMBERS_BY_ID = Object.fromEntries(
  CLUB_MEMBERS.map(m => [m.login_id.toUpperCase(), m])
)

export const MEMBERS_BY_EMAIL = Object.fromEntries(
  CLUB_MEMBERS.map(m => [m.email.toLowerCase(), m])
)

export function getMemberDetails(identifier) {
  if (!identifier) return null
  const cleaned = identifier.trim()
  if (cleaned.includes('@')) {
    return MEMBERS_BY_EMAIL[cleaned.toLowerCase()] || null
  }
  return MEMBERS_BY_ID[cleaned.toUpperCase()] || null
}

