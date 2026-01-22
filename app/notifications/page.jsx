"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const email = user?.emailAddresses?.[0]?.emailAddress;

  useEffect(() => {
    if (!isSignedIn || !email) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`/api/notifications?email=${email}`);
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications);
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [isSignedIn, email]);

  const handleClickNotification = async (notification) => {
    try {
      // Mark as read
      if (!notification.isRead) {
        await fetch(`/api/notifications/${notification._id}/read`, {
          method: "PATCH",
        });
      }

      // Redirect to issue page
      if (notification.issueId) {
        router.push(`/dashboard/view-issue?id=${notification.issueId}`);
      }
    } catch (err) {
      console.error("Error handling notification", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications/read-all", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all read", err);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="mt-20 text-center text-gray-600">
        Please sign in to view notifications.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mt-20 text-center text-gray-600">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 mt-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm text-blue-600 hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center text-gray-500 mt-20">
          No notifications yet 🎉
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleClickNotification(n)}
              className={`p-4 rounded-lg shadow cursor-pointer transition ${
                n.isRead
                  ? "bg-gray-100"
                  : "bg-blue-50 border-l-4 border-blue-500"
              }`}
            >
              <p className="text-sm text-gray-800">{n.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
