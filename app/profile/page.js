function getBadge(points) {
  if (points >= 500) return "🌟 City Hero";
  if (points >= 201) return "🥇 Gold Guardian";
  if (points >= 51) return "🥈 Silver Watchdog";
  return "🥉 Bronze Reporter";
}

// JSX inside profile
<p className="font-medium">Level: {getBadge(user.points)}</p>;
