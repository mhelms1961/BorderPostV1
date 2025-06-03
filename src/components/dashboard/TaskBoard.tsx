import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, AlertCircle, Plus } from "lucide-react";

interface Task {
  id: string;
  title: string;
  status: "completed" | "in-progress" | "pending";
  dueDate: string;
  priority: "high" | "medium" | "low";
}

export default function TaskBoard() {
  // Sample tasks data
  const tasks: Task[] = [
    {
      id: "1",
      title: "Upload wedding highlight video",
      status: "completed",
      dueDate: "2023-06-15",
      priority: "high",
    },
    {
      id: "2",
      title: "Add borders to client videos",
      status: "in-progress",
      dueDate: "2023-06-18",
      priority: "medium",
    },
    {
      id: "3",
      title: "Review new border templates",
      status: "pending",
      dueDate: "2023-06-20",
      priority: "low",
    },
    {
      id: "4",
      title: "Send preview to Johnson wedding",
      status: "pending",
      dueDate: "2023-06-22",
      priority: "high",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge variant="destructive" className="text-xs">
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge
            variant="outline"
            className="text-xs border-amber-500 text-amber-500"
          >
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge variant="outline" className="text-xs">
            Low
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tasks</CardTitle>
        <Button size="sm" className="h-8">
          <Plus className="mr-1 h-4 w-4" /> Add Task
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(task.status)}
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-gray-500">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div>{getPriorityBadge(task.priority)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
