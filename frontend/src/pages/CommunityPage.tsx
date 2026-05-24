import { useCallback, useEffect, useRef, useState } from 'react'
import api, { apiErrorMessage } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { AddGroupMembersPanel, MemberPickerList, type StudentPick } from '@/components/AddGroupMembersPanel'
import { ChangePasswordCard } from '@/components/ChangePasswordCard'
import { OfficialChannelsCard } from '@/components/OfficialChannelsCard'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ArrowLeft, Ban, Mail, MessageCircle, Plus, RefreshCw, Send, Shield, Trophy, UserPlus, UserRoundPlus, Users } from 'lucide-react'

interface Profile {
  userId: number
  email?: string | null
  phone?: string | null
  displayName: string
  anonymousAlias?: string
  useAnonymousDisplay: boolean
  bio?: string
  avatarEmoji: string
  mocksAttempted: number
  allowDirectMessages: boolean
  showInDirectory: boolean
}

interface Student {
  userId: number
  displayName: string
  avatarEmoji: string
  bio?: string
  mocksAttempted: number
  allowDirectMessages: boolean
  blockedByMe: boolean
  blockedMe: boolean
  canMessage: boolean
}

interface Conversation {
  id: number
  type: string
  name: string
  description?: string
  lastMessagePreview: string
  unreadCount: number
  members: { userId: number; displayName: string; avatarEmoji: string }[]
}

interface ScoreCard {
  attemptId: number
  mockTitle: string
  netScore: number
  maxMarks: number
  correctCount: number
  wrongCount: number
  uniqueRank: number
  uniquePercentile: number
  uniqueStudents: number
  clearedCutoff: boolean
  cutoffMarks: number
}

interface Message {
  id: number
  conversationId: number
  senderId: number
  senderDisplayName: string
  senderAvatarEmoji: string
  messageType: string
  body: string
  scoreCard?: ScoreCard
  createdAt: string
}

export function CommunityPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'inbox' | 'students' | 'profile' | 'channels'>('inbox')
  const [inbox, setInbox] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [searchQ, setSearchQ] = useState('')
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [groupName, setGroupName] = useState('')
  const [groupDesc, setGroupDesc] = useState('')
  const [createPickerOpen, setCreatePickerOpen] = useState(false)
  const [createMemberIds, setCreateMemberIds] = useState<Set<number>>(new Set())
  const [pickerStudents, setPickerStudents] = useState<StudentPick[]>([])
  const [showAddMembers, setShowAddMembers] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [actionError, setActionError] = useState('')
  const [inboxLoading, setInboxLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const lastPoll = useRef<string>(new Date().toISOString())
  const messagesEnd = useRef<HTMLDivElement>(null)

  const loadInbox = useCallback(() => {
    setInboxLoading(true)
    api
      .get('/social/inbox')
      .then((r) => {
        setInbox(r.data)
        setActionError('')
      })
      .catch((e) => setActionError(apiErrorMessage(e, 'Could not load conversations')))
      .finally(() => setInboxLoading(false))
  }, [])

  const loadStudents = useCallback(() => {
    api.get('/social/users').then((r) => {
      setStudents(r.data)
      setPickerStudents(
        r.data.map((s: Student) => ({
          userId: s.userId,
          displayName: s.displayName,
          avatarEmoji: s.avatarEmoji,
          canMessage: s.canMessage,
        }))
      )
    }).catch(() => {
      setStudents([])
      setPickerStudents([])
    })
  }, [])

  const loadMessages = useCallback((convId: number, since?: string) => {
    if (!since) setMessagesLoading(true)
    api
      .get(`/social/conversations/${convId}/messages`, { params: since ? { since } : {} })
      .then((r) => {
        if (since) setMessages((prev) => [...prev, ...r.data])
        else setMessages(r.data)
        setTimeout(() => messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      })
      .catch((e) => setActionError(apiErrorMessage(e, 'Could not load messages')))
      .finally(() => !since && setMessagesLoading(false))
  }, [])

  const poll = useCallback(() => {
    api
      .get('/social/poll', { params: { since: lastPoll.current } })
      .then((r) => {
        lastPoll.current = r.data.serverTime
        if (activeId && r.data.newMessages?.length) {
          const forConv = r.data.newMessages.filter((m: Message) => m.conversationId === activeId)
          if (forConv.length) {
            setMessages((prev) => {
              const ids = new Set(prev.map((p) => p.id))
              return [...prev, ...forConv.filter((m: Message) => !ids.has(m.id))]
            })
            messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
          }
        }
      })
      .catch(() => {})
  }, [activeId])

  useEffect(() => {
    loadInbox()
    api.get('/social/profile/me').then((r) => setProfile(r.data)).catch(() => {})
    loadStudents()
  }, [loadInbox, loadStudents])

  useEffect(() => {
    const pollTimer = setInterval(poll, 12000)
    const inboxTimer = setInterval(loadInbox, 45000)
    return () => {
      clearInterval(pollTimer)
      clearInterval(inboxTimer)
    }
  }, [poll, loadInbox])

  useEffect(() => {
    if (activeId) {
      lastPoll.current = new Date().toISOString()
      loadMessages(activeId)
    }
  }, [activeId, loadMessages])

  useEffect(() => {
    if (tab === 'students') loadStudents()
  }, [tab, loadStudents])

  const send = async () => {
    if (!activeId || !text.trim()) return
    setActionError('')
    try {
      const { data } = await api.post(`/social/conversations/${activeId}/messages`, { body: text })
      setMessages((prev) => [...prev, data])
      setText('')
      loadInbox()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setActionError(msg || 'Could not send message')
    }
  }

  const shareFromUrl = async () => {
    const params = new URLSearchParams(window.location.search)
    const attemptId = params.get('shareAttempt')
    if (!activeId || !attemptId) return
    const { data } = await api.post(`/social/conversations/${activeId}/messages`, {
      scoreCardAttemptId: Number(attemptId),
    })
    setMessages((prev) => [...prev, data])
    window.history.replaceState({}, '', '/community')
  }

  useEffect(() => {
    if (activeId && new URLSearchParams(window.location.search).get('shareAttempt')) {
      shareFromUrl()
    }
  }, [activeId])

  const saveProfile = async () => {
    if (!profile) return
    setActionError('')
    const { data } = await api.put('/social/profile/me', {
      anonymousAlias: profile.anonymousAlias,
      useAnonymousDisplay: profile.useAnonymousDisplay,
      bio: profile.bio,
      avatarEmoji: profile.avatarEmoji,
      allowDirectMessages: profile.allowDirectMessages,
      showInDirectory: profile.showInDirectory,
    })
    setProfile(data)
    loadStudents()
  }

  const startDm = async (userId: number) => {
    setActionError('')
    try {
      const { data } = await api.post(`/social/conversations/direct/${userId}`)
      setActiveId(data.id)
      loadInbox()
      setTab('inbox')
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setActionError(msg || 'Cannot start conversation')
    }
  }

  const blockUser = async (userId: number) => {
    await api.post(`/social/users/${userId}/block`)
    loadStudents()
  }

  const unblockUser = async (userId: number) => {
    await api.delete(`/social/users/${userId}/block`)
    loadStudents()
  }

  const createGroup = async () => {
    if (!groupName.trim()) return
    setActionError('')
    try {
      const { data } = await api.post('/social/groups', {
        name: groupName,
        description: groupDesc,
        memberIds: Array.from(createMemberIds),
      })
      setGroupName('')
      setGroupDesc('')
      setCreateMemberIds(new Set())
      setCreatePickerOpen(false)
      setShowCreateGroup(false)
      loadInbox()
      setActiveId(data.id)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setActionError(msg || 'Could not create group')
    }
  }

  const toggleCreateMember = (id: number) => {
    setCreateMemberIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const searchUsers = () => {
    if (searchQ.length < 2) return
    api.get('/social/users/search', { params: { q: searchQ } }).then((r) => setSearchResults(r.data))
  }

  const activeConv = inbox.find((c) => c.id === activeId)
  const isGroup = activeConv?.type === 'GROUP'
  const memberIds = activeConv?.members.map((m) => m.userId) ?? []

  return (
    <div className="max-w-[90rem] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      <div className="flex flex-col gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Mail className="h-7 w-7 sm:h-8 sm:w-8 text-neon-cyan shrink-0" /> Prep Mail
          </h1>
          <p className="text-slate-400 text-sm md:text-base mt-1">Direct messages, prep groups, and score cards</p>
        </div>
        <div className="flex gap-2 flex-wrap items-center overflow-x-auto pb-1 -mx-1 px-1">
          {tab === 'inbox' && (
            <Button
              size="sm"
              className="cursor-pointer gap-1"
              onClick={() => setShowCreateGroup(true)}
            >
              <Plus className="h-4 w-4" /> Add group
            </Button>
          )}
          {(['inbox', 'students', 'profile', 'channels'] as const).map((t) => (
            <Button
              key={t}
              size="sm"
              variant={tab === t ? 'default' : 'outline'}
              className="cursor-pointer capitalize"
              onClick={() => setTab(t)}
            >
              {t === 'students' ? 'Students' : t === 'inbox' ? 'Inbox' : t === 'channels' ? 'Updates' : 'Privacy'}
            </Button>
          ))}
        </div>
      </div>

      {actionError && (
        <p className="mb-4 text-sm text-red-400 bg-red-950/30 border border-red-800/50 rounded-lg px-4 py-2">
          {actionError}
        </p>
      )}

      {tab === 'channels' && (
        <OfficialChannelsCard className="max-w-xl" />
      )}

      {tab === 'profile' && profile && (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle className="text-lg">Profile & privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl">{profile.avatarEmoji}</div>
            {(profile.email || profile.phone) && (
              <div className="text-sm text-slate-500 space-y-1 rounded-lg border border-cyber-700 bg-cyber-900/50 p-3">
                {profile.email && <p>Email: <span className="text-slate-300">{profile.email}</span></p>}
                {profile.phone && <p>Mobile: <span className="text-slate-300">{profile.phone}</span></p>}
              </div>
            )}
            <div>
              <Label>Avatar emoji</Label>
              <Input
                value={profile.avatarEmoji}
                onChange={(e) => setProfile({ ...profile, avatarEmoji: e.target.value })}
              />
            </div>
            <div>
              <Label>Anonymous name (optional)</Label>
              <Input
                placeholder="e.g. CyberWizard_42"
                value={profile.anonymousAlias || ''}
                onChange={(e) => setProfile({ ...profile, anonymousAlias: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={profile.useAnonymousDisplay}
                onChange={(e) => setProfile({ ...profile, useAnonymousDisplay: e.target.checked })}
              />
              Use anonymous name on leaderboard & chat
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={profile.showInDirectory}
                onChange={(e) => setProfile({ ...profile, showInDirectory: e.target.checked })}
              />
              Show me in the student directory
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={profile.allowDirectMessages}
                onChange={(e) => setProfile({ ...profile, allowDirectMessages: e.target.checked })}
              />
              Allow direct messages from other students
            </label>
            <div>
              <Label>Bio</Label>
              <textarea
                className="w-full h-24 rounded-lg border border-cyber-700 bg-cyber-900/80 p-3 text-sm"
                placeholder="Preparing for IBPS SO IT..."
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              />
            </div>
            <Button className="cursor-pointer" onClick={saveProfile}>
              Save settings
            </Button>
          </CardContent>
        </Card>
      )}

      {tab === 'profile' && profile && (
        <ChangePasswordCard className="max-w-lg mt-6" />
      )}

      {tab === 'students' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Student directory</CardTitle>
            <Button size="sm" variant="outline" className="cursor-pointer" onClick={loadStudents}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-400">
              Students who opted in to the directory. Search by name if you know someone; block users you do not want
              to hear from.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Search by name (min 2 chars)..."
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
              />
              <Button variant="outline" className="cursor-pointer shrink-0" onClick={searchUsers}>
                Search
              </Button>
            </div>
            {searchResults.length > 0 && (
              <ul className="border border-cyber-700 rounded-lg divide-y divide-cyber-800">
                {searchResults.map((u) => (
                  <li key={u.userId} className="flex items-center justify-between p-3 text-sm">
                    <span>
                      {u.avatarEmoji} {u.displayName}
                    </span>
                    <Button size="sm" className="cursor-pointer" onClick={() => startDm(u.userId)}>
                      Message
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            {students.length === 0 ? (
              <p className="text-slate-500 text-sm py-8 text-center">No students in the directory yet.</p>
            ) : (
              <ul className="border border-cyber-700 rounded-lg divide-y divide-cyber-800 max-h-[60vh] overflow-y-auto">
                {students.map((s) => (
                  <li key={s.userId} className="p-4 flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">
                        {s.avatarEmoji} {s.displayName}
                      </p>
                      {s.bio && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{s.bio}</p>}
                      <p className="text-xs text-slate-500 mt-1">{s.mocksAttempted} mock(s) submitted</p>
                      {s.blockedMe && (
                        <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                          <Shield className="h-3 w-3" /> This user has blocked you
                        </p>
                      )}
                      {!s.allowDirectMessages && !s.blockedByMe && (
                        <p className="text-xs text-slate-500 mt-1">Direct messages disabled</p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        className="cursor-pointer"
                        disabled={!s.canMessage}
                        onClick={() => startDm(s.userId)}
                      >
                        <UserPlus className="h-4 w-4" /> Message
                      </Button>
                      {s.blockedByMe ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="cursor-pointer"
                          onClick={() => unblockUser(s.userId)}
                        >
                          Unblock
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="cursor-pointer text-red-400 border-red-800/50"
                          onClick={() => blockUser(s.userId)}
                        >
                          <Ban className="h-4 w-4" /> Block
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'inbox' && (
        <div className="grid lg:grid-cols-[minmax(280px,340px)_1fr] gap-4 min-h-0 lg:min-h-[560px] lg:h-[calc(100dvh-12rem)]">
          <Card className={cn('flex flex-col overflow-hidden', activeId && 'hidden lg:flex')}>
            <CardHeader className="py-3 border-b border-cyber-700 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Conversations</CardTitle>
              <Button
                size="sm"
                variant="outline"
                className="cursor-pointer h-8 text-xs lg:hidden"
                onClick={() => setShowCreateGroup(true)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-2 space-y-1 min-h-[240px]">
              {inboxLoading && (
                <p className="text-sm text-slate-500 text-center py-8">Loading conversations...</p>
              )}
              {!inboxLoading && inbox.length === 0 && (
                <div className="text-sm text-slate-500 text-center py-8 px-2 space-y-3">
                  <p>No chats yet.</p>
                  <Button size="sm" className="cursor-pointer" onClick={() => setShowCreateGroup(true)}>
                    <Plus className="h-4 w-4" /> Create a prep group
                  </Button>
                </div>
              )}
              {inbox.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveId(c.id)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg cursor-pointer transition-colors',
                    activeId === c.id ? 'bg-neon-blue/15 border border-cyber-600' : 'hover:bg-cyber-800/80'
                  )}
                >
                  <div className="flex justify-between gap-2">
                    <span className="font-medium text-sm truncate">{c.name}</span>
                    {c.unreadCount > 0 && (
                      <span className="bg-neon-purple text-xs px-1.5 rounded-full shrink-0">{c.unreadCount}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-1">{c.lastMessagePreview}</p>
                </button>
              ))}
            </CardContent>
            <div className="p-3 border-t border-cyber-700">
              <Button
                size="sm"
                variant="outline"
                className="w-full cursor-pointer text-xs"
                onClick={() => setTab('students')}
              >
                Browse student directory
              </Button>
            </div>
          </Card>

          <Card className={cn('flex flex-col overflow-hidden min-h-[min(70dvh,560px)] lg:min-h-0', !activeId && 'hidden lg:flex')}>
            {activeConv ? (
              <>
                <CardHeader className="py-3 border-b border-cyber-700 space-y-2 shrink-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="lg:hidden shrink-0 h-9 w-9 p-0 cursor-pointer -ml-1"
                        onClick={() => setActiveId(null)}
                        aria-label="Back to conversations"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                      <div className="min-w-0">
                      <CardTitle className="text-base break-words">{activeConv.name}</CardTitle>
                      {activeConv.description && (
                        <p className="text-xs text-slate-500 line-clamp-2">{activeConv.description}</p>
                      )}
                      </div>
                    </div>
                    {isGroup && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="cursor-pointer shrink-0"
                        onClick={() => setShowAddMembers(true)}
                      >
                        <UserRoundPlus className="h-4 w-4" /> Add friends
                      </Button>
                    )}
                  </div>
                  {isGroup && activeConv.members.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {activeConv.members.map((m) => (
                        <span
                          key={m.userId}
                          className="text-xs px-2 py-0.5 rounded-full bg-cyber-800 border border-cyber-600 text-slate-300"
                        >
                          {m.avatarEmoji} {m.displayName}
                        </span>
                      ))}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 text-base">
                  {messagesLoading && (
                    <p className="text-sm text-slate-500 text-center py-8">Loading messages...</p>
                  )}
                  {!messagesLoading && messages.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-8">No messages yet. Say hello!</p>
                  )}
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn('max-w-[min(100%,42rem)]', m.senderId === user?.userId ? 'ml-auto text-right' : '')}
                    >
                      <p className="text-xs text-slate-500 mb-1">
                        {m.senderAvatarEmoji} {m.senderDisplayName}
                      </p>
                      {m.messageType === 'SCORE_CARD' && m.scoreCard ? (
                        <div className="p-4 rounded-lg border border-cyber-600 bg-cyber-900/80 text-left">
                          <p className="font-bold text-neon-cyan flex items-center gap-2">
                            <Trophy className="h-4 w-4" /> Score card
                          </p>
                          <p className="text-sm mt-2">{m.scoreCard.mockTitle}</p>
                          <p className="text-2xl font-bold mt-1 tabular-nums">
                            {m.scoreCard.netScore.toFixed(2)} / {m.scoreCard.maxMarks}
                          </p>
                          <p className="text-sm text-green-400">
                            Rank #{m.scoreCard.uniqueRank} · {m.scoreCard.uniquePercentile}%ile
                          </p>
                        </div>
                      ) : (
                        <p
                          className={cn(
                            'p-4 rounded-xl text-base inline-block text-left leading-relaxed',
                            m.messageType === 'SYSTEM'
                              ? 'bg-cyber-800/50 text-slate-400 italic'
                              : 'bg-cyber-800',
                            m.senderId === user?.userId && 'bg-neon-blue/15'
                          )}
                        >
                          {m.body}
                        </p>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEnd} />
                </CardContent>
                <div className="p-3 sm:p-4 border-t border-cyber-700 flex gap-2 sm:gap-3 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                  <Input
                    className="text-base min-h-[44px] flex-1"
                    placeholder="Type a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && send()}
                  />
                  <Button className="cursor-pointer shrink-0 min-h-[44px] min-w-[44px] px-3" onClick={send} aria-label="Send">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <CardContent className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2">
                <MessageCircle className="h-10 w-10 opacity-30" />
                <p className="text-sm">Select a conversation or open the student directory</p>
                <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => setTab('students')}>
                  View students
                </Button>
              </CardContent>
            )}
          </Card>
        </div>
      )}

      <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
        <DialogContent className="mobile-dialog-sheet border-cyber-600 bg-cyber-950 sm:max-w-md overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-neon-cyan" /> New prep group
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Group name" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
            <Input
              placeholder="Description (optional)"
              value={groupDesc}
              onChange={(e) => setGroupDesc(e.target.value)}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-full cursor-pointer"
              onClick={() => setCreatePickerOpen(!createPickerOpen)}
            >
              <UserRoundPlus className="h-4 w-4" />
              {createMemberIds.size > 0
                ? `${createMemberIds.size} friend(s) selected`
                : 'Add friends (optional)'}
            </Button>
            {createPickerOpen && (
              <MemberPickerList
                students={pickerStudents}
                selected={createMemberIds}
                onToggle={toggleCreateMember}
              />
            )}
            <Button className="w-full cursor-pointer" onClick={createGroup} disabled={!groupName.trim()}>
              Create group
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {activeId && isGroup && (
        <AddGroupMembersPanel
          open={showAddMembers}
          onClose={() => setShowAddMembers(false)}
          conversationId={activeId}
          existingMemberIds={memberIds}
          onAdded={() => {
            loadInbox()
            loadMessages(activeId)
          }}
        />
      )}
    </div>
  )
}
