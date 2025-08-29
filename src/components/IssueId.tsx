/** @jsxImportSource @emotion/react */
import React from 'react'
import styled from '@emotion/styled'
import { useAdminStore } from '../stores/useAdminStore'

const Card = styled.div`
  background: #0d1520;
  border: 1px solid #1b2a42;
  border-radius: 14px;
  padding: 12px;
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 16px;
  @media (max-width: 1080px){ grid-template-columns: 1fr; }
`

const Field = styled.div`
  display: grid; gap: 6px; margin-bottom: 10px;
  label{ font-size: 12px; opacity:.9 }
  input,select{ background:#0a111a; border:1px solid #1a2b45; color:#d7e7fb; padding:8px 10px; border-radius:10px; }
`

const Btn = styled.button`
  background: #0f4a2f; border:1px solid #1d6a49; color:#e7fff5; padding:10px 12px; border-radius:10px; cursor:pointer;
  &:disabled{ opacity:.6; cursor: default; }
`

function genTempPassword(){
  const base = Math.random().toString(36).slice(2, 8)
  const up = String.fromCharCode(65 + Math.floor(Math.random()*26))
  const sp = '!@#$%&*'[Math.floor(Math.random()*7)]
  return up + base + sp
}

export default function IssueIdView(){
  const { isIssuing, issueResult, issueId } = useAdminStore()
  const [userId, setUserId] = React.useState('')
  const [displayName, setDisplayName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [role, setRole] = React.useState<'ADMIN'|'RAD'|'TECH'|'STAFF'>('STAFF')
  const [passWord, setPassWord] = React.useState(genTempPassword())
  const status = 'ACTIVE';

  const valid = userId && displayName && email.includes('@')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if(!valid) return
    await issueId({ userId, displayName, email, role, passWord, status })
  }

  return (
    <Card>
      <form onSubmit={onSubmit}>
        <Field>
          <label>로그인 ID</label>
          <input value={userId} onChange={e=>setUserId(e.target.value)} placeholder="예: staff001" />
        </Field>
        <Field>
          <label>이름</label>
          <input value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="홍길동" />
        </Field>
        <Field>
          <label>이메일</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="user@hospital.org" />
        </Field>
        <Field>
          <label>권한(Role)</label>
          <select value={role} onChange={e=>setRole(e.target.value as any)}>
            <option value="ADMIN">ADMIN</option>
            <option value="RAD">RAD</option>
            <option value="TECH">TECH</option>
            <option value="STAFF">STAFF</option>
          </select>
        </Field>
        <Field>
          <label>임시 비밀번호</label>
          <div style={{display:'flex', gap:8}}>
            <input value={passWord} onChange={e=>setPassWord(e.target.value)} />
            <Btn type="button" onClick={()=>setPassWord(genTempPassword())}>재생성</Btn>
          </div>
        </Field>
        <div style={{display:'flex', gap:8}}>
          <Btn type="submit" disabled={!valid || isIssuing}>발급</Btn>
        </div>
      </form>

      <div>
        <h3 style={{margin:'6px 0 10px'}}>발급 결과</h3>
        {!issueResult && <div style={{opacity:.7}}>아직 발급 내역이 없습니다.</div>}
        {issueResult && (
          <div style={{background:'#0b1420', border:'1px solid #1a2b45', borderRadius:12, padding:12}}>
            <div>✅ <b>{issueResult.userId}</b> 계정이 발급되었습니다.</div>
            <div style={{opacity:.8}}>발급 시각: {new Date(issueResult.issuedAt).toLocaleString()}</div>
            <hr style={{borderColor:'#152338', margin:'10px 0'}}/>
            <div style={{fontSize:12, opacity:.9}}>임시 비밀번호는 <code>{passWord}</code> 입니다.</div>
          </div>
        )}
      </div>
    </Card>
  )
}
