/**
 * Returns the target URL for a user based on their role and profile status.
 */
export function getRoleRedirectUrl(role: string | undefined, hasProfile: boolean): string {
  if (!hasProfile) {
    return "/auth/pending-approval";
  }
  
  if (role === "admin") {
    return "/admin/home";
  }
  
  if (role === "student" || role === "nodal_officer") {
    return "/student/home";
  }
  
  return "/auth/pending-approval";
}
