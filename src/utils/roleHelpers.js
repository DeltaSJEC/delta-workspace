/**
 * Check if a user is a head
 * @param {object} user
 * @returns {boolean}
 */
export function isHead(user) {
  return user?.role === 'head'
}

/**
 * Check if a user is a member
 * @param {object} user
 * @returns {boolean}
 */
export function isMember(user) {
  return user?.role === 'member'
}

/**
 * Get role display label
 * @param {string} role
 * @returns {string}
 */
export function getRoleLabel(role) {
  if (role === 'head') return 'Head'
  if (role === 'member') return 'Member'
  return 'Unknown'
}

/**
 * Check if a post is visible to a user based on department targeting
 * @param {string[]} targetDepartments
 * @param {string} userDepartment
 * @param {string} userRole
 * @returns {boolean}
 */
export function isVisibleToUser(targetDepartments, userDepartment, userRole) {
  if (userRole === 'head') return true
  if (!targetDepartments || targetDepartments.length === 0) return true
  if (targetDepartments.includes('all')) return true
  return targetDepartments.includes(userDepartment)
}
