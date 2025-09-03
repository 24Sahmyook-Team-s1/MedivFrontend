/** @jsxImportSource @emotion/react */
import React from 'react'
import styled from '@emotion/styled'
import { useAdminStore, type UserRole, type UserStatus } from '../stores/useAdminStore'

const Card = styled.div`
  background: linear-gradient(180deg,#0d1520,#0a0f16);
  border: 1px solid #1b2a42;
  border-radius: 14px;
  padding: 12px;
`

const Controls = styled.div`
  display: grid;
  grid-template-columns: 1fr 140px 140px auto;
  gap: 8px;
  margin-bottom: 10px;
`

const Input = styled.input`
  background: #0a111a;
  border: 1px solid #1a2b45;
  color: #d7e7fb;
  padding: 8px 10px;
  border-radius: 10px;
  outline: none;
`

const Select = styled.select`
  background: #0a111a;
  border: 1px solid #1a2b45;
  color: #d7e7fb;
  padding: 8px 10px;
  border-radius: 10px;
  outline: none;
`

const Btn = styled.button`
  background: #10355d;
  border: 1px solid #1f3e66;
  color: #e5f1ff;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  &:disabled{ opacity:.6; cursor: default; }
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  font-size: 13px;
  thead th{ position: sticky; top: 0; background: #0f1a27; border-bottom: 1px solid #1a2b45; padding: 8px; text-align: left; }
  tbody td{ border-top: 1px solid #132036; padding: 8px; vertical-align: middle; }
  tbody tr:hover{ background: #0b1420; }
  code{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
`

export default function UsersView(){
  const { users, usersTotal, isLoadingUsers, fetchUsers, updateUser, resetPassword } = useAdminStore()
  const [keyword, setKeyword] = React.useState('')
  const [role, setRole] = React.useState<UserRole | 'ALL'>('ALL')
  const [status, setStatus] = React.useState<UserStatus | 'ALL'>('ALL')

  React.useEffect(() => { fetchUsers({ page: 1, size: 20 }) }, [])
  const onSearch = () => fetchUsers({ page: 1, size: 20, keyword, role, status })

  const onRoleChange = (userId: string, next: UserRole, displayName: string, dept: string, status: UserStatus) => updateUser(userId, next, displayName, dept, status)
  const onToggle = (userId: string, userRole: UserRole, displayName: string, dept: string, cur: UserStatus) => updateUser(userId, userRole, displayName, dept, cur === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')
  const onReset = async (userId: string) => {
    const res = await resetPassword(userId)
    if(res?.tempPassword){
      alert(`임시 비밀번호: ${res.tempPassword}`)
    }
  }

  return (
    <Card>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
        <div>총 {usersTotal}명</div>
        <div>{isLoadingUsers && <span style={{opacity:.7}}>불러오는 중...</span>}</div>
      </div>

      <Controls>
        <Input placeholder="이름/ID/이메일 검색" value={keyword} onChange={e=>setKeyword(e.target.value)} />
        <Select value={role} onChange={e=>setRole(e.target.value as any)}>
          <option value="ALL">모든 권한</option>
          <option value="ADMIN">ADMIN</option>
          <option value="STAFF">STAFF</option>
        </Select>
        <Select value={status} onChange={e=>setStatus(e.target.value as any)}>
          <option value="ALL">모든 상태</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="DISABLED">DISABLED</option>
        </Select>
        <Btn onClick={onSearch} disabled={isLoadingUsers}>검색</Btn>
      </Controls>

      <div style={{maxHeight:'62vh', overflow:'auto'}}>
        <Table>
          <thead>
            <tr>
                
              <th style={{width:220}}>이메일</th>
              <th style={{width:140}}>이름</th>
              <th style={{width:120}}>권한</th>
              <th style={{width:120}}>상태</th>
              <th style={{width:200}}>생성일</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.displayName}</td>
                <td>
                  <Select value={u.role} onChange={(e)=>onRoleChange(u.id, e.target.value as UserRole, u.displayName, "null", u.status)}>
                    <option value="ADMIN">ADMIN</option>
                    <option value="STAFF">STAFF</option>
                  </Select>
                </td>
                <td>
                  <Btn onClick={()=>onToggle(u.id,u.role, u.displayName, "null" ,u.status)}>{u.status === 'ACTIVE' ? 'ACITVE' : 'INACTIVE'}</Btn>
                </td>
                <td><code>{new Date(u.createdAt).toLocaleString()}</code></td>
                <td style={{display:'flex', gap:8}}>
                  <Btn onClick={()=>onReset(u.id)}>비번초기화</Btn> 
                </td>
              </tr>
            ))}
            {!users.length && (
              <tr><td colSpan={7} style={{opacity:.7, padding:20}}>표시할 유저가 없습니다.</td></tr>
            )}
          </tbody>
        </Table>
      </div>
    </Card>
  )
}