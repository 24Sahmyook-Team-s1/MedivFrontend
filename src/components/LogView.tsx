/** @jsxImportSource @emotion/react */
import React from 'react'
import styled from '@emotion/styled'
import { useAdminStore, type LogLevel } from '../stores/useAdminStore'

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
  const { logs, total, isLoadingLogs, lastQuery, fetchLogs } = useAdminStore()
  const [keyword, setKeyword] = React.useState(lastQuery.keyword || '')
  const [level, setLevel] = React.useState<LogLevel | 'ALL'>(lastQuery.level || 'ALL')
  const [dateFrom, setDateFrom] = React.useState<string>(lastQuery.dateFrom || '')
  const [dateTo, setDateTo] = React.useState<string>(lastQuery.dateTo || '')

  React.useEffect(() => { fetchLogs({ page: 1 }) }, [])

  const onSearch = () => fetchLogs({ page: 1, keyword, level, dateFrom, dateTo })

  return (
    <Card>
      <Row>
        <div>총 {total}건</div>
        <div>
          <Btn onClick={() => fetchLogs()} disabled={isLoadingLogs}>새로고침</Btn>
        </div>
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
        <Btn onClick={onSearch} disabled={isLoadingLogs}>검색</Btn>
      </Controls>

      <div style={{maxHeight: '62vh', overflow: 'auto'}}>
        <Table>
          <thead>
            <tr>
              <th style={{width: 180}}>시간</th>
              <th style={{width: 80}}>레벨</th>
              <th style={{width: 160}}>행위자 / IP</th>
              <th>메시지</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td><code>{new Date(log.time).toLocaleString()}</code></td>
                <td>
                  <span style={{
                    display:'inline-block', padding:'2px 8px', borderRadius:8,
                    background: log.level==='ERROR' ? '#3a1020' : log.level==='WARN' ? '#35240e' : log.level==='DEBUG' ? '#10283a' : '#102034',
                    border: '1px solid #223a5a'
                  }}>{log.level}</span>
                </td>
                <td>{log.actor || '-'}{log.ip ? ` / ${log.ip}` : ''}</td>
                <td>
                  <div>{log.message}</div>
                  {log.meta && <details><summary>meta</summary><pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(log.meta,null,2)}</pre></details>}
                </td>
              </tr>
            ))}
            {!logs.length && (
              <tr><td colSpan={4} style={{opacity:.7, padding:20}}>표시할 로그가 없습니다.</td></tr>
            )}
          </tbody>
        </Table>
      </div>
    </Card>
  )
}