"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { PlusCircle, Trophy, Flame, Award, Sparkles, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import Particles from "./components/particles"

// Types
interface Habit {
  id: string
  name: string
  completed: boolean
  streak: number
  lastCompleted: string | null
}

interface UserStats {
  level: number
  points: number
  totalCompleted: number
  badges: string[]
}

export default function HabitTracker() {
  // State
  const [habits, setHabits] = useState<Habit[]>(() => {
    // Load from localStorage if available
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("habits")
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  const [newHabit, setNewHabit] = useState("")
  const [stats, setStats] = useState<UserStats>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("stats")
      return saved
        ? JSON.parse(saved)
        : {
            level: 1,
            points: 0,
            totalCompleted: 0,
            badges: [],
          }
    }
    return {
      level: 1,
      points: 0,
      totalCompleted: 0,
      badges: [],
    }
  })

  const [showReward, setShowReward] = useState(false)
  const [rewardMessage, setRewardMessage] = useState("")
  const [isLevelUp, setIsLevelUp] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [showParticles, setShowParticles] = useState(false)
  const [particleOrigin, setParticleOrigin] = useState({ x: 0, y: 0 })

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const levelUpAudioRef = useRef<HTMLAudioElement | null>(null)

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits))
    localStorage.setItem("stats", JSON.stringify(stats))
  }, [habits, stats])

  // Check streaks on load
  useEffect(() => {
    checkStreaks()
  }, [])

  // Initialize audio elements
  useEffect(() => {
    // Try to create audio elements but handle potential errors
    try {
      audioRef.current = new Audio()
      audioRef.current.src = "/complete-sound.mp3"

      levelUpAudioRef.current = new Audio()
      levelUpAudioRef.current.src = "/level-up-sound.mp3"

      // Add error event listeners to handle missing files
      audioRef.current.addEventListener("error", () => {
        console.log("Complete sound could not be loaded")
      })

      levelUpAudioRef.current.addEventListener("error", () => {
        console.log("Level up sound could not be loaded")
      })
    } catch (e) {
      console.error("Audio initialization failed:", e)
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (levelUpAudioRef.current) {
        levelUpAudioRef.current.pause()
        levelUpAudioRef.current = null
      }
    }
  }, [])

  // Add a new habit
  const addHabit = () => {
    if (newHabit.trim() === "") return

    const newHabitObj: Habit = {
      id: Date.now().toString(),
      name: newHabit,
      completed: false,
      streak: 0,
      lastCompleted: null,
    }

    setHabits([...habits, newHabitObj])
    setNewHabit("")

    // Show notification
    setNotificationMessage("New Quest Added!")
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 2000)
  }

  // Toggle habit completion
  const toggleHabit = (id: string, event?: React.MouseEvent) => {
    const today = new Date().toISOString().split("T")[0]

    // Set particle origin if event is provided
    if (event) {
      setParticleOrigin({
        x: event.clientX,
        y: event.clientY,
      })
    }

    setHabits(
      habits.map((habit) => {
        if (habit.id === id) {
          // If completing the habit
          if (!habit.completed) {
            // Play sound effect
            if (audioRef.current) {
              try {
                audioRef.current.currentTime = 0
                const playPromise = audioRef.current.play()

                if (playPromise !== undefined) {
                  playPromise.catch((e) => {
                    console.log("Audio play failed, continuing without sound")
                  })
                }
              } catch (e) {
                console.log("Audio play failed, continuing without sound")
              }
            }

            // Show particles
            setShowParticles(true)
            setTimeout(() => setShowParticles(false), 1000)

            // Update stats
            const newPoints = stats.points + 10
            const newTotalCompleted = stats.totalCompleted + 1
            let newLevel = stats.level
            const newBadges = [...stats.badges]

            // Check for level up (every 100 points)
            if (Math.floor(newPoints / 100) > Math.floor(stats.points / 100)) {
              newLevel++
              setIsLevelUp(true)
              setShowReward(true)
              setRewardMessage(`Level Up! You're now level ${newLevel}`)

              // Play level up sound
              if (levelUpAudioRef.current) {
                try {
                  levelUpAudioRef.current.currentTime = 0
                  const playPromise = levelUpAudioRef.current.play()

                  if (playPromise !== undefined) {
                    playPromise.catch((e) => {
                      console.log("Level up audio play failed, continuing without sound")
                    })
                  }
                } catch (e) {
                  console.log("Level up audio play failed, continuing without sound")
                }
              }

              // Hide reward message after 5 seconds
              setTimeout(() => {
                setShowReward(false)
                setIsLevelUp(false)
              }, 5000)
            } else {
              // Show simple notification for completion
              setNotificationMessage(`Quest Complete! +10 points`)
              setShowNotification(true)
              setTimeout(() => setShowNotification(false), 2000)
            }

            // Check for streak badges
            const newStreak = habit.lastCompleted === getYesterday() ? habit.streak + 1 : 1

            if (newStreak === 7 && !newBadges.includes("week-streak")) {
              newBadges.push("week-streak")
              setShowReward(true)
              setRewardMessage("New Badge: 7 Day Streak!")
              setTimeout(() => setShowReward(false), 3000)
            }

            if (newStreak === 30 && !newBadges.includes("month-streak")) {
              newBadges.push("month-streak")
              setShowReward(true)
              setRewardMessage("New Badge: 30 Day Streak!")
              setTimeout(() => setShowReward(false), 3000)
            }

            // Check for completion badges
            if (newTotalCompleted === 10 && !newBadges.includes("starter")) {
              newBadges.push("starter")
              setShowReward(true)
              setRewardMessage("New Badge: Habit Starter!")
              setTimeout(() => setShowReward(false), 3000)
            }

            if (newTotalCompleted === 50 && !newBadges.includes("achiever")) {
              newBadges.push("achiever")
              setShowReward(true)
              setRewardMessage("New Badge: Habit Achiever!")
              setTimeout(() => setShowReward(false), 3000)
            }

            setStats({
              level: newLevel,
              points: newPoints,
              totalCompleted: newTotalCompleted,
              badges: newBadges,
            })

            return {
              ...habit,
              completed: true,
              streak: newStreak,
              lastCompleted: today,
            }
          }

          // If uncompleting the habit
          return {
            ...habit,
            completed: false,
          }
        }
        return habit
      }),
    )
  }

  // Delete a habit
  const deleteHabit = (id: string) => {
    setHabits(habits.filter((habit) => habit.id !== id))
  }

  // Get yesterday's date in YYYY-MM-DD format
  const getYesterday = () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday.toISOString().split("T")[0]
  }

  // Check and update streaks
  const checkStreaks = () => {
    const today = new Date().toISOString().split("T")[0]

    setHabits(
      habits.map((habit) => {
        // Reset completion status at the start of a new day
        if (habit.lastCompleted !== today) {
          return {
            ...habit,
            completed: false,
          }
        }
        return habit
      }),
    )
  }

  // Calculate progress percentage for level
  const levelProgress = () => {
    const pointsInCurrentLevel = stats.points % 100
    return pointsInCurrentLevel
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl relative">
      {/* Background effect */}
      <div className="fixed inset-0 bg-gradient-to-b from-blue-900 to-black z-[-1]" />

      {/* Particles effect when completing habits */}
      {showParticles && (
        <Particles origin={particleOrigin} count={30} colors={["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"]} />
      )}

      <div className="flex flex-col items-center mb-8">
        <h1 className="text-4xl font-bold mb-2 text-white text-center relative">
          <span className="absolute inset-0 blur-md text-blue-400 animate-pulse">Habit Hero</span>
          <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            Habit Hero
          </span>
        </h1>
        <p className="text-blue-200 mb-6 text-center">Turn your daily habits into a game!</p>

        {/* User Stats Card */}
        <Card className="w-full mb-6 border-2 border-blue-500 bg-blue-900/30 backdrop-blur-sm text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-blue-100 flex items-center">
                <span className="text-2xl font-bold mr-2">Level {stats.level}</span>
                <span className="text-xs px-2 py-1 bg-blue-600 rounded-full animate-pulse">SYSTEM</span>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
                <span className="font-bold text-yellow-200">{stats.points} points</span>
              </div>
            </div>
            <CardDescription className="text-blue-200">{100 - levelProgress()} points until next level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative h-2 mb-4">
              <Progress
                value={levelProgress()}
                className="h-2 bg-blue-950 [&>div]:bg-gradient-to-r [&>div]:from-blue-400 [&>div]:to-cyan-300 shadow-[0_0_10px_rgba(59,130,246,0.7)]"
              />
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div
                  className="h-full bg-gradient-to-r from-transparent to-blue-300/50 animate-pulse"
                  style={{ width: `${levelProgress()}%` }}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {stats.badges.includes("starter") && (
                <Badge
                  variant="outline"
                  className="bg-blue-800/50 text-blue-200 border-blue-400 shadow-[0_0_5px_rgba(59,130,246,0.5)]"
                >
                  <Award className="h-3 w-3 mr-1 text-yellow-300" /> Starter
                </Badge>
              )}
              {stats.badges.includes("achiever") && (
                <Badge
                  variant="outline"
                  className="bg-purple-800/50 text-purple-200 border-purple-400 shadow-[0_0_5px_rgba(147,51,234,0.5)]"
                >
                  <Trophy className="h-3 w-3 mr-1 text-yellow-300" /> Achiever
                </Badge>
              )}
              {stats.badges.includes("week-streak") && (
                <Badge
                  variant="outline"
                  className="bg-orange-800/50 text-orange-200 border-orange-400 shadow-[0_0_5px_rgba(249,115,22,0.5)]"
                >
                  <Flame className="h-3 w-3 mr-1 text-orange-300" /> 7-Day Streak
                </Badge>
              )}
              {stats.badges.includes("month-streak") && (
                <Badge
                  variant="outline"
                  className="bg-red-800/50 text-red-200 border-red-400 shadow-[0_0_5px_rgba(239,68,68,0.5)]"
                >
                  <Flame className="h-3 w-3 mr-1 text-red-300" /> 30-Day Streak
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Habit */}
      <div className="flex gap-2 mb-6">
        <Input
          type="text"
          placeholder="Add a new quest..."
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addHabit()
          }}
          className="flex-1 bg-blue-900/30 border-blue-500 text-blue-100 placeholder:text-blue-300/70 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
        />
        <Button
          onClick={addHabit}
          className="bg-blue-600 hover:bg-blue-500 text-white border border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      {/* Habits List */}
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-blue-900/50 border border-blue-500">
          <TabsTrigger value="today" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Today's Quests
          </TabsTrigger>
          <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            All Quests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {habits.length === 0 ? (
            <div className="text-center py-8 text-blue-200 bg-blue-900/20 rounded-lg border border-blue-800 backdrop-blur-sm">
              No quests yet. Add your first quest to get started!
            </div>
          ) : (
            habits.map((habit) => (
              <Card
                key={habit.id}
                className={cn(
                  "transition-all duration-300 border-2 backdrop-blur-sm",
                  habit.completed
                    ? "bg-green-900/30 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                    : "bg-blue-900/30 border-blue-600 hover:border-blue-400",
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "relative flex h-10 w-10 shrink-0 overflow-hidden items-center justify-center rounded-full",
                          habit.completed
                            ? "bg-green-600 text-white"
                            : "bg-blue-800 text-blue-200 border-2 border-blue-400",
                        )}
                        onClick={(e) => toggleHabit(habit.id, e)}
                      >
                        {habit.completed && <Check className="h-6 w-6 text-white" />}
                        {habit.completed && (
                          <span className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-75"></span>
                        )}
                      </div>
                      <div>
                        <Label
                          htmlFor={habit.id}
                          className={cn(
                            "text-base font-medium",
                            habit.completed ? "line-through text-green-300" : "text-blue-100",
                          )}
                        >
                          {habit.name}
                        </Label>
                        {habit.streak > 0 && (
                          <div className="flex items-center text-xs text-orange-300 mt-1">
                            <Flame className="h-3 w-3 mr-1" />
                            <span>{habit.streak} day streak</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteHabit(habit.id)}
                      className="text-blue-300 hover:text-red-300 hover:bg-red-900/30"
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {habits.length === 0 ? (
            <div className="text-center py-8 text-blue-200 bg-blue-900/20 rounded-lg border border-blue-800 backdrop-blur-sm">
              No quests yet. Add your first quest to get started!
            </div>
          ) : (
            habits.map((habit) => (
              <Card key={habit.id} className="bg-blue-900/30 border-2 border-blue-600 text-blue-100 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-blue-100">{habit.name}</h3>
                      <div className="flex items-center text-xs text-blue-300 mt-1">
                        <Flame className="h-3 w-3 mr-1 text-orange-400" />
                        <span>Current streak: {habit.streak} days</span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteHabit(habit.id)}
                      className="text-blue-300 hover:text-red-300 hover:bg-red-900/30"
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 bg-blue-900/80 border-2 border-blue-400 text-blue-100 px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.7)] backdrop-blur-sm animate-slideInRight">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-400" />
            <span>{notificationMessage}</span>
          </div>
        </div>
      )}

      {/* Reward Animation */}
      {showReward && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 backdrop-blur-sm">
          {isLevelUp ? (
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-lg blur-xl animate-pulse opacity-50"></div>
              <div className="bg-blue-900 border-4 border-blue-400 rounded-lg p-12 text-center shadow-[0_0_30px_rgba(59,130,246,0.8)] relative z-10 animate-scaleIn">
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute bg-blue-300 rounded-full"
                        style={{
                          width: `${Math.random() * 10 + 5}px`,
                          height: `${Math.random() * 10 + 5}px`,
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          opacity: Math.random(),
                          animation: `float ${Math.random() * 3 + 2}s linear infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-200 mb-4 animate-pulse">
                  LEVEL UP!
                </div>
                <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-6 relative">
                  <span className="text-6xl font-bold text-white">{stats.level}</span>
                  <div className="absolute inset-0 rounded-full border-4 border-blue-300 animate-ping"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-blue-300 animate-spin"></div>
                </div>
                <h2 className="text-3xl font-bold mb-4 text-blue-100">You've reached a new level!</h2>
                <p className="text-xl text-blue-200">Continue your journey to unlock more achievements</p>
              </div>
            </div>
          ) : (
            <div className="bg-blue-900 border-2 border-blue-400 rounded-lg p-8 text-center shadow-[0_0_15px_rgba(59,130,246,0.7)] animate-slideInUp">
              <Trophy className="h-16 w-16 text-yellow-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-blue-100">Congratulations!</h2>
              <p className="text-lg text-blue-200">{rewardMessage}</p>
            </div>
          )}
        </div>
      )}

      {/* Audio elements */}
      <div className="fixed bottom-2 left-2 text-xs text-blue-400/70">
        Note: Add audio files to /public directory for sound effects
      </div>
    </div>
  )
}

