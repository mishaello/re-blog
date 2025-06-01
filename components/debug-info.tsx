"use client"

import { useEffect, useState } from "react"
import { testConnection } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugInfo() {
  const [connectionTest, setConnectionTest] = useState<any>(null)

  useEffect(() => {
    testConnection().then(setConnectionTest)
  }, [])

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <Card className="glass-card border-yellow-500/20 mt-8">
      <CardHeader>
        <CardTitle className="text-yellow-400">Debug Information</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-gray-300">
        <div className="space-y-2">
          <p>
            <strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing"}
          </p>
          <p>
            <strong>Supabase Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing"}
          </p>
          <p>
            <strong>Connection Test:</strong>{" "}
            {connectionTest ? (connectionTest.success ? "✅ Success" : "❌ Failed") : "⏳ Testing..."}
          </p>
          {connectionTest && (
            <pre className="bg-black/20 p-2 rounded text-xs overflow-auto">
              {JSON.stringify(connectionTest, null, 2)}
            </pre>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
