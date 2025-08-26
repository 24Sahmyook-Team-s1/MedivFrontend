/** @jsxImportSource @emotion/react */
// src/layouts/BaseLayout.tsx
import { css } from "@emotion/react";
import type { ReactNode } from "react";

const ArticleStyle = css`
  width: 100vw;
  height: 100dvh;
  display: flex;
  flex-direction: column;
`;

interface ArticleProps {
    children: ReactNode;
}

const Article: React.FC<ArticleProps> = ({children}) => {
    return <article css={ArticleStyle}>{children}</article>
};

export default Article;