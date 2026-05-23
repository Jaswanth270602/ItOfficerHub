import { Link } from 'react-router-dom'
import { Seo } from '@/components/Seo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TOPIC_SHORT } from '@/lib/topics'

const SYLLABUS = [
  { code: 'NETWORKING', name: 'Computer Networks', points: ['OSI/TCP-IP', 'IP addressing & subnetting', 'Routing, switching, VLANs', 'DNS, DHCP, firewalls'] },
  { code: 'DBMS', name: 'DBMS & SQL', points: ['Normalization', 'SQL queries & joins', 'Indexing, transactions', 'ACID properties'] },
  { code: 'OPERATING_SYSTEMS', name: 'Operating Systems', points: ['Process & threads', 'Scheduling & deadlocks', 'Memory management', 'File systems'] },
  { code: 'SECURITY', name: 'Cyber Security', points: ['Encryption basics', 'Malware & attacks', 'OWASP / secure coding', 'Authentication'] },
  { code: 'WEB_TECHNOLOGIES', name: 'Web Technologies', points: ['HTTP/REST', 'HTML/CSS/JS basics', 'APIs & middleware', 'Web servers'] },
  { code: 'DATA_STRUCTURES', name: 'Data Structures', points: ['Arrays, stacks, queues', 'Trees & graphs', 'Sorting', 'Complexity'] },
  { code: 'COMPUTER_ORGANIZATION', name: 'Computer Organization', points: ['CPU & registers', 'Cache & memory', 'I/O', 'Instruction cycles'] },
  { code: 'SOFTWARE_ENGINEERING', name: 'Software Engineering', points: ['SDLC & Agile', 'Testing types', 'UML basics', 'Maintenance'] },
  { code: 'CLOUD_COMPUTING', name: 'Cloud Computing', points: ['IaaS/PaaS/SaaS', 'Virtualization', 'AWS/Azure basics', 'Containers intro'] },
  { code: 'DIGITAL_ELECTRONICS', name: 'Digital Electronics', points: ['Boolean algebra', 'Logic gates', 'Combinational circuits', 'Number systems'] },
]

const EXAMS = [
  'IBPS Specialist Officer (IT Officer)',
  'NIACL / LIC / GIC IT Officer',
  'Other PSU IT professional knowledge papers',
]

export function SyllabusPage() {
  return (
    <>
      <Seo
        path="/syllabus"
        title="IBPS SO IT Officer Syllabus — PSU IT Professional Knowledge"
        description="Complete IBPS SO IT Officer and PSU IT syllabus — Computer Networks, DBMS, OS, Security, Web, Data Structures, Cloud. Subject-wise mock test preparation on ItOfficerHub."
        keywords="IBPS SO IT syllabus, IT Officer syllabus, PSU IT Officer syllabus, computer networks syllabus, DBMS for IBPS IT, IT officer professional knowledge topics"
      />
    <div className="page-container py-10 pb-20">
      <h1 className="page-title mb-2">IBPS SO IT &amp; PSU IT syllabus</h1>
      <p className="page-subtitle max-w-3xl mb-10">
        ItOfficerHub mocks focus on <strong className="text-white">professional knowledge (IT)</strong> — the
        technical section bank IT Officer and PSU IT exams use. Filter mocks by subject on the Mocks page.
      </p>

      <Card className="mb-10 border-neon-cyan/30">
        <CardHeader>
          <CardTitle>Exams we target</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside text-slate-300 space-y-1">
            {EXAMS.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <p className="text-sm text-slate-500 mt-4">
            Non-IT sections (reasoning, English, GA) are not covered here — use banking prep apps for those.
          </p>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mb-4">IT professional knowledge topics</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        {SYLLABUS.map((t) => (
          <Card key={t.code} className="border-cyber-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyber-800 text-neon-cyan">
                  {TOPIC_SHORT[t.code]}
                </span>
                {t.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-400 space-y-0.5">
                {t.points.map((p) => (
                  <li key={p}>• {p}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-4 mt-12">TCS NQT · Aptitude (campus)</h2>
      <Card className="mb-10 border-sky-500/30">
        <CardContent className="pt-6">
          <p className="text-slate-300 mb-3">Quant, logical reasoning and verbal — set exam target TCS NQT when importing.</p>
          <Link to="/tcs-nqt" className="text-sky-400 text-sm hover:underline">
            Go to TCS NQT mocks →
          </Link>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link to="/mocks">
          <Button className="cursor-pointer">Practice by subject</Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="outline" className="cursor-pointer">Dashboard</Button>
        </Link>
      </div>
    </div>
    </>
  )
}
