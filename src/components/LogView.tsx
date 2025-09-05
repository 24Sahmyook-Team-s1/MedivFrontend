/** @jsxImportSource @emotion/react */
import React from 'react'
import styled from '@emotion/styled'
import { useAdminStore, type LogLevel } from '../stores/useAdminStore'
import { useLogStore } from '../stores/useLogStore'

const Card = styled.div`
  background: linear-gradient(180deg,#0d1520,#0a0f16);
  border: 1px solid #1b2a42;
  border-radius: 14px;
  padding: 12px;
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
`

const Controls = styled.div`
  display: grid;
  grid-template-columns: 120px 120px 1fr 120px 120px auto;
  gap: 8px;
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
  tbody td{ border-top: 1px solid #132036; padding: 8px; vertical-align: top; }
  tbody tr:hover{ background: #0b1420; }
  code{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
`

export default function LogsView(){
  const {totalLogs, isLoadingLogs} = useAdminStore()
  const [keyword, setKeyword] = React.useState('')
  const [level, setLevel] = React.useState<LogLevel | 'ALL'>('ALL')
  const [dateFrom, setDateFrom] = React.useState('')
  const [dateTo, setDateTo] = React.useState('')
  const { Logs, getLogs } = useLogStore();

  React.useEffect(() => { getLogs() }, [])

  return (
    <Card>
      <Row>
        <div>총 {totalLogs}건</div>
        <div><Btn onClick={() => getLogs()} disabled={isLoadingLogs}>새로고침</Btn></div>
      </Row>

      <Controls>
        <Select value={level} onChange={e => setLevel(e.target.value as any)}>
          <option value="ALL">ALL</option>
          <option value="INFO">INFO</option>
          <option value="WARN">WARN</option>
          <option value="ERROR">ERROR</option>
          <option value="DEBUG">DEBUG</option>
        </Select>
        <Input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} />
        <Input type="text" placeholder="키워드(메시지/행위자/IP)" value={keyword} onChange={e=>setKeyword(e.target.value)} />
        <Input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} />
        <Btn disabled={isLoadingLogs}>검색</Btn>
      </Controls>

      <div style={{maxHeight: '62vh', overflow: 'auto'}}>
        <Table>
          <thead>
            <tr>
              <th style={{width: 180}}>시간</th>
              <th style={{width: 80}}>행위자</th>
              <th style={{width: 160}}>대상자</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {Logs.map((log, idx) => (
              <tr key={idx}>
                <td><code>{new Date(log.createdAt).toLocaleString()}</code></td>
                <td>{log.actor || '-'}</td>
                <td>
                  <div>{log.target}</div>
                </td>
                <td>{log.logAction}</td>
              </tr>
            ))}
            {!Logs.length && (
              <tr><td colSpan={4} style={{opacity:.7, padding:20}}>표시할 로그가 없습니다.</td></tr>
            )}
          </tbody>
        </Table>
      </div>
    </Card>
  )
}
