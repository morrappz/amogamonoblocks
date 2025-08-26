"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

interface ConnectionSettingsProps {
  connectionString: string
  allowedTables: string[]
  onUpdate: (connectionString: string, allowedTables: string[]) => void
  onClose: () => void
}

export default function ConnectionSettings({
  connectionString,
  allowedTables,
  onUpdate,
  onClose,
}: ConnectionSettingsProps) {
  const [connection, setConnection] = useState(connectionString)
  const [tables, setTables] = useState(allowedTables.join(", "))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const tablesList = tables
      .split(",")
      .map((table) => table.trim())
      .filter((table) => table.length > 0)
    onUpdate(connection, tablesList)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Database Connection Settings</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="connection-string">Connection String</Label>
              <Input
                id="connection-string"
                value={connection}
                onChange={(e) => setConnection(e.target.value)}
                placeholder="postgresql://username:password@host:port/database"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allowed-tables">Allowed Tables (comma-separated)</Label>
              <Input
                id="allowed-tables"
                value={tables}
                onChange={(e) => setTables(e.target.value)}
                placeholder="table1, table2, table3"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
