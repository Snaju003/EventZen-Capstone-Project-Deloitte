export function downloadJson(fileName, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function buildUsersById(users) {
  return new Map(users.map((user) => [user.id, user]));
}

export function enrichAttendees(attendees, usersById) {
  return attendees.map((attendee) => {
    const userById = usersById.get(attendee.userId);
    return {
      ...attendee,
      resolvedName:
        attendee.userName || attendee.name || attendee.user?.name || userById?.name || "Unknown",
      resolvedEmail:
        attendee.userEmail || attendee.email || attendee.user?.email || userById?.email || "Unknown",
    };
  });
}
