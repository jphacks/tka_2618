import { useEffect, useState } from 'react'

type Connection =
  | { status: 'loading' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }

export default function App() {
  const [connection, setConnection] = useState<Connection>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 10000)
    let active = true
    setConnection({ status: 'loading' })

    async function connect() {
      try {
        const response = await fetch('/api/hello', { signal: controller.signal })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data: unknown = await response.json()
        if (!data || typeof data !== 'object' || !('message' in data) || typeof data.message !== 'string') {
          throw new Error('APIのレスポンスが不正です')
        }
        if (active) setConnection({ status: 'success', message: data.message })
      } catch {
        if (active) setConnection({ status: 'error', message: '接続できませんでした。バックエンドの起動状態を確認してください。' })
      } finally {
        window.clearTimeout(timeout)
      }
    }
    void connect()
    return () => {
      active = false
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [attempt])

  return (
    <main>
      <p className="eyebrow">JPHACK / DEVELOPMENT</p>
      <h1>開発をはじめよう。</h1>
      <p className="intro">React + TypeScript と Python の開発環境です。</p>
      <section aria-labelledby="connection-title">
        <h2 id="connection-title">バックエンド接続</h2>
        <p role="status" className={connection.status}>
          {connection.status === 'loading' ? '接続を確認しています…' : connection.message}
        </p>
        <button disabled={connection.status === 'loading'} onClick={() => setAttempt(value => value + 1)}>
          再接続
        </button>
      </section>
      <p className="hint">ファイルを編集すると、変更が自動で反映されます。</p>
    </main>
  )
}
