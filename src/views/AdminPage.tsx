/** @jsxImportSource @emotion/react */
import React from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import LogsView from '../components/LogView' 
import IssueIdView from '../components/IssueId' 

const Shell = styled.div`
  display: grid;
  grid-template-columns: 240px 1fr;
  height: 100vh;
  background: #0f1216;
  color: #e5eef7;
`

const Sidebar = styled.aside`
  background: #0b0e12;
  border-right: 1px solid #1a2330;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Brand = styled.div`
  font-weight: 700;
  letter-spacing: 0.5px;
  font-size: 18px;
  padding: 8px 12px;
  margin-bottom: 8px;
  color: #9dd0ff;
  border-bottom: 1px solid #172031;
`

const NavBtn = styled.button<{active?: boolean}>`
  text-align: left;
  padding: 10px 12px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: ${({active}) => active ? 'linear-gradient(180deg,#122032,#0d1520)' : 'transparent'};
  color: ${({active}) => active ? '#e6f2ff' : '#c6d6ea'};
  outline: none;
  cursor: pointer;
  transition: 120ms ease;
  &:hover { background: #0e1621; border-color: #1a2b45; }
`

const Main = styled.main`
  display: grid;
  grid-template-rows: 56px 1fr;
`

const Topbar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid #162235;
  background: linear-gradient(180deg,#0f1520,#0b0f17);
`

const Title = styled.h1`
  font-size: 16px;
  font-weight: 600;
  color: #cfe6ff;
`

const Content = styled.section`
  padding: 16px;
  overflow: auto;
`

type Tab = 'logs' | 'issue'

export default function AdminPage() {
  const [tab, setTab] = React.useState<Tab>('logs')
  return (
    <Shell>
      <Sidebar>
        <Brand>PACS PLUS · Admin</Brand>
        <NavBtn active={tab==='logs'} onClick={() => setTab('logs')}>📜 로그 확인</NavBtn>
        <NavBtn active={tab==='issue'} onClick={() => setTab('issue')}>👤 아이디 발급</NavBtn>
      </Sidebar>
      <Main>
        <Topbar>
          <Title>{tab === 'logs' ? '시스템 로그' : '아이디 발급'}</Title>
          <div css={css`opacity:.8;font-size:12px;`}>ADMIN</div>
        </Topbar>
        <Content>
          {tab === 'logs' ? <LogsView/> : <IssueIdView/>}
        </Content>
      </Main>
    </Shell>
  )
}