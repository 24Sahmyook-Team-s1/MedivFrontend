/** src/components/ReportPanel.tsx */
/** @jsxImportSource @emotion/react */
import React, { useEffect, useMemo, useState } from "react";
import styled from "@emotion/styled";
import { http } from "../lib/http"; // axios 인스턴스 가정 (withCredentials 설정된 것)

type Props = {
  pid?: string | null;
  modality?: string | null;
  bodyPart?: string | null;
  studyKey: number;               // ← 이 값으로 서버에서 리포트 조회
  className?: string;
  onSaved?: (payload: { studyKey: string; report: string }) => void;
};

type ReportDto = {
  studyKey: string;
  report: string;
  updatedAt?: string;
};

const Panel = styled.section`
  background: #111417;
  border: 1px solid #232a33;
  border-radius: 16px;
  padding: 22px 24px;
  color: #e9f0f7;
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  gap: 16px;
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0.02em;
`;

const LabelBar = styled.div`
  font-size: 14px;
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: 18px;
  span.k {
    color: #a9b7c6;
    margin-right: 6px;
  }
  b.v {
    color: #f1f5f9;
    font-weight: 600;
  }
`;

const FieldTitle = styled.div`
  font-size: 16px;
  opacity: 0.9;
  &:before { content: "[ "; opacity: .6 }
  &:after { content: " ]"; opacity: .6 }
`;

const TextAreaWrap = styled.div`
  position: relative;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 240px;
  resize: vertical;
  background: #0c1014;
  color: #e6edf5;
  border: 1px solid #202a36;
  border-radius: 14px;
  padding: 16px 18px;
  line-height: 1.5;
  font-size: 15px;
  outline: none;
  &:focus {
    border-color: #3a73ff;
    box-shadow: 0 0 0 3px rgba(58, 115, 255, 0.18);
  }
`;

const FootBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
`;

const Meta = styled.div`
  margin-right: auto;
  font-size: 12px;
  opacity: 0.7;
`;

const Btn = styled.button<{ variant?: "primary" | "ghost" }>`
  appearance: none;
  border: none;
  border-radius: 12px;
  padding: 12px 22px;
  font-weight: 600;
  cursor: pointer;
  background: ${({ variant }) =>
    variant === "primary" ? "#d9dbe1" : "transparent"};
  color: ${({ variant }) => (variant === "primary" ? "#0b0e12" : "#d9dbe1")};
  border: ${({ variant }) => (variant === "ghost" ? "1px solid #2a3440" : "none")};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? "none" : "auto")};
`;

export default function ReportPanel({
  pid,
  modality,
  bodyPart,
  studyKey,
  className,
  onSaved,
}: Props) {
  const [serverReport, setServerReport] = useState<string>("");
  const [draft, setDraft] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isDirty = useMemo(() => draft !== serverReport, [draft, serverReport]);

  // 서버에서 리포트 불러오기
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // API 예시: GET /reports/{studyKey}
        const res = await http.get<ReportDto>(`/reports/${encodeURIComponent(studyKey)}`);
        const text = res?.data?.report ?? "";
        if (!alive) return;
        setServerReport(text);
        setDraft(text);
      } catch (e: any) {
        if (!alive) return;
        // 404면 없는 리포트 → 빈초기값 허용
        if (e?.response?.status === 404) {
          setServerReport("");
          setDraft("");
        } else {
          setError("리포트를 불러오지 못했습니다.");
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [studyKey]);


  return (
    <Panel className={className} aria-busy={loading || saving}>
      <Title>리포트</Title>

      <LabelBar aria-label="Study metadata">
        <span><span className="k">PID</span><b className="v">{pid ?? "-"}</b></span>
        <span><span className="k">Modality</span><b className="v">{modality ?? "-"}</b></span>
        <span><span className="k">BodyPart</span><b className="v">{bodyPart ?? "-"}</b></span>
        <span><span className="k">StudyKey</span><b className="v">{studyKey ?? "-"}</b></span>
      </LabelBar>

      <div>
        <FieldTitle>코멘트</FieldTitle>
      </div>

      <TextAreaWrap>
        <TextArea
          placeholder={loading ? "불러오는 중..." : "리포트를 입력하세요."}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={loading}
          aria-label="리포트 입력"
        />
      </TextAreaWrap>

      <FootBar>
        <Meta>
          {error ? error : loading ? "불러오는 중..." : isDirty ? "수정됨(미저장)" : "최신 상태"}
        </Meta>
        <Btn
          variant="ghost"
          onClick={() => setDraft(serverReport)}
          disabled={!isDirty || saving}
        >
          되돌리기
        </Btn>
        <Btn
          variant="primary"
          disabled={!isDirty || saving}
        >
          {saving ? "저장 중..." : "저장"}
        </Btn>
      </FootBar>
    </Panel>
  );
}
