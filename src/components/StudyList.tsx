/** @jsxImportSource @emotion/react */
import React, { useMemo, useState } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import {
  Search,
  Settings,
  LogOut,
  FileSearch,
  Images,
  History,
  ClipboardList,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import CustomInput from "./Common/InputArea";
import { useStudyStore } from "../stores/useStudyStore";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuth";

// ============== Styled ==============
const Container = styled.div`
  display: grid;
  grid-template-columns: 72px 1fr;
  height: 100vh;
  background: #121212;
  color: #f5f5f5;
`;

const Sidebar = styled.aside`
  background: #161616;
  border-right: 1px solid #2a2a2a;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0;
  gap: 0.75rem;
`;

const SidebarBtn = styled.button`
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #aaa;
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
  }
`;

const Main = styled.main`
  padding: 1.5rem;
  overflow: auto;
`;

const Section = styled.section`
  background: #171717;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-weight: 600;
  color: #ddd;
`;

const SearchRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 280px auto;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
`;

const Label = styled.div`
  font-size: 0.85rem;
  min-width: 72px;
  color: #ccc;
`;

const PeriodBox = styled.div`
  position: relative;
  flex: 1;
  height: 40px;
  border-radius: 6px;
  background: #222;
  border: 1px solid #333;
  color: #f5f5f5;
  display: flex;
  align-items: center;
  padding: 0 0.75rem;
`;

const Pills = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

const Pill = styled.button<{ active?: boolean }>`
  border-radius: 9999px;
  height: 36px;
  padding: 0 1rem;
  font-size: 0.85rem;
  border: 1px solid ${({ active }) => (active ? "#dc2626" : "#3a3a3a")};
  background: ${({ active }) => (active ? "#b91c1c" : "#2a2a2a")};
  color: ${({ active }) => (active ? "#fff" : "#e5e5e5")};
  &:hover {
    background: ${({ active }) => (active ? "#b91c1c" : "#343434")};
  }
`;

const Table = styled.div<{ columns: number }>`
  display: grid;
  grid-template-columns: repeat(${({ columns }) => columns}, minmax(0, 1fr));
  border: 1px solid #343434;
  border-radius: 8px;
  overflow: hidden;
`;

const Th = styled.div`
  background: #191919;
  color: #aaa;
  text-transform: uppercase;
  font-size: 0.75rem;
  padding: 0.5rem;
  border-right: 1px solid #2b2b2b;
  &:last-of-type {
    border-right: none;
  }
`;

const Td = styled.div`
  padding: 0.6rem 0.75rem;
  border-top: 1px solid #2b2b2b;
  font-size: 0.92rem;
  text-overflow: clip;
`;

const Row = styled.div<{ columns: number }>`
  display: contents;
  grid-template-columns: repeat(${({ columns }) => columns}, minmax(0, 1fr));
`;

const Empty = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 2rem;
  color: #666;
`;

// optional: emotion css to pass into CustomInput
const inputAccent = css`
  background-color: #222;
  color: #f5f5f5;
  border: 1px solid #333;
  &:focus-within {
    outline: 1px solid #dc2626;
  }
`;

// ============== Types ==============
interface Study {
  studyKey: number;
  studyInsUid: string;
  pid: string;
  pname: string;
  modality: string;
  studyDesc: string;
  studyDate: string;
  seriesCnt: number;
  imageCnt: number;
}

// ============== Component ==============
const StudiesSearchUI: React.FC = () => {
  const [pid, setPid] = useState("");
  const [pname, setPname] = useState("");
  const navigate = useNavigate();
  const { StudyList, getSeriesList, getDicomImage } = useStudyStore();
  const {logout} = useAuthStore();

const handleStudyClick = async (studyInsUid: string) => { await getDicomImage(studyInsUid, navigate); };

  const handleSearch = async () => {
    // 현재 스토어 시그니처가 patientId만 받는 것으로 보였음
    await getSeriesList(pid);
  };

  const flatStudies: Study[] = useMemo(() => {
    // StudyList가 중첩 배열 형태로 저장되는 패턴을 반영
    try {
      return (StudyList?.flat?.() ?? []).filter(Boolean);
    } catch {
      // flat 미지원 환경 대비
      return [].concat(...(StudyList || []));
    }
  }, [StudyList]);

  const columns = [
    "환자ID",
    "이름",
    "검사장비",
    "설명",
    "검사일시",
    "시리즈",
    "이미지",
  ];

  return (
    <Container>
      {/* Sidebar */}
      <Sidebar>
        <div
          css={css`
            width: 44px;
            height: 44px;
            display: grid;
            place-items: center;
            background: #222;
            border-radius: 8px;
            font-weight: 900;
            color: #dc2626;
          `}
        >
          P+
        </div>
        {[FileSearch, Search, Images, History, ClipboardList, ShieldCheck].map(
          (Ic, i) => (
            <SidebarBtn key={i} title="menu">
              <Ic size={18} />
            </SidebarBtn>
          )
        )}
        <div style={{ marginTop: "auto" }} />
        <SidebarBtn title="설정">
          <Settings size={18} />
        </SidebarBtn>
        <SidebarBtn title="로그아웃" onClick={() => logout()}>
          <LogOut size={18} />
        </SidebarBtn>
      </Sidebar>

      {/* Main */}
      <Main>
        {/* Search */}
        <Section>
          <SectionTitle>검색</SectionTitle>
          <SearchRow>
            <InputWrapper>
              <Label>환자 아이디</Label>
              <CustomInput
                inputName="환자 ID"
                inputType="text"
                onChange={(e: any) => setPid(e.target.value)}
                CustomStyle={inputAccent}
              />
            </InputWrapper>
            <InputWrapper>
              <Label>환자 이름</Label>
              <CustomInput
                inputName="환자 이름"
                inputType="text"
                onChange={(e: any) => setPname(e.target.value)}
                CustomStyle={inputAccent}
              />
            </InputWrapper>
            <InputWrapper>
              <Label>기간</Label>
              <PeriodBox>
                전체
                <ChevronDown
                  size={18}
                  style={{ position: "absolute", right: 8 }}
                />
              </PeriodBox>
            </InputWrapper>
            <Pills>
              <Pill
                onClick={() => {
                  /* today */
                }}
              >
                오늘
              </Pill>
              <Pill>2일</Pill>
              <Pill>3일</Pill>
              <Pill>1주일</Pill>
              <Pill>재설정</Pill>
              <Pill active onClick={handleSearch}>
                <Search size={14} /> 검색
              </Pill>
            </Pills>
          </SearchRow>
        </Section>

        {/* Results */}
        <Section>
          <SectionTitle>검사 목록</SectionTitle>
          <div style={{ marginTop: "0.75rem" }}>
            <Table columns={columns.length}>
              {columns.map((c, i) => (
                <Th key={i}>{c}</Th>
              ))}
              {flatStudies.length === 0 ? (
                <Empty>검색 결과가 없습니다.</Empty>
              ) : (
                flatStudies.map((s, idx) => (
                  <Row key={`${s.studyInsUid}-${idx}`} columns={columns.length} onClick={() => handleStudyClick(s.studyInsUid)}>
                    <Td>{s.pid}</Td>
                    <Td>{s.pname}</Td>
                    <Td>{s.modality}</Td>
                    <Td title={s.studyDesc}>{s.studyDesc || "-"}</Td>
                    <Td>{s.studyDate}</Td>
                    <Td>{s.seriesCnt}</Td>
                    <Td>{s.imageCnt}</Td>
                  </Row>
                ))
              )}
            </Table>
          </div>
        </Section>
      </Main>
    </Container>
  );
};

export default StudiesSearchUI;
