    "use client"
    import { useState } from "react";
    import { Button } from "@/components/ui/button";
    import { Input } from "@/components/ui/input";
    import { Card, CardContent } from "@/components/ui/card";
    import { Trash, Check } from "lucide-react";

    interface Task {
    id: number;
    text: string;
    completed: boolean;
    }

    export default function TodoList() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [task, setTask] = useState("");

    const addTask = () => {
        if (task.trim() === "") return;
        setTasks([...tasks, { id: Date.now(), text: task, completed: false }]);
        setTask("");
    };

    const toggleTask = (id: number) => {
        setTasks(
        tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
        );
    };

    const deleteTask = (id: number) => {
        setTasks(tasks.filter((t) => t.id !== id));
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-4 bg-card rounded-lg shadow-lg">
        <h1 className="text-xl font-bold text-center mb-4">To-Do List</h1>
        <div className="flex gap-2 mb-4">
            <Input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Add a new task"
            />
            <Button onClick={addTask}>Add</Button>
        </div>
        <div className="space-y-2">
            {tasks.map((t) => (
            <Card key={t.id} className="flex items-center justify-between p-2">
                <CardContent
                className={`flex-1 ${t.completed ? "line-through text-muted" : ""}`}
                >
                {t.text}
                </CardContent>
                <div className="flex gap-2">
                <Button size="icon" variant="outline" onClick={() => toggleTask(t.id)}>
                    <Check className="h-5 w-5 text-green-500" />
                </Button>
                <Button size="icon" variant="destructive" onClick={() => deleteTask(t.id)}>
                    <Trash className="h-5 w-5" />
                </Button>
                </div>
            </Card>
            ))}
        </div>
        </div>
    );
    }
