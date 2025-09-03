/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import type { ComponentType, SVGProps } from "react";
import type { SerializedStyles } from "@emotion/react";

export const InputArea = styled.div`
  width: 300px;
  height: 45px;
  background-color: White;
  border: 1px solid gray;
  border-radius: 10px;

  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 2px 12px;
  box-sizing: border-box;
  flex-direction: column;
  font-family: Pretendard;
  font-weight: bold;
`;

export const InputAreaText = styled.span`
  font-size: 10px;
  color: #fff;
`;

export const InputAreaField = styled.input`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background-color: transparent;
  border: none;
  font-size: 16px;
`;

const InputAreaDivider = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  width: 100%;
  gap: 5px;
`;

const OptionButton = styled.button`
  background-color: transparent;
  padding: 0;
  margin: 0;
`

interface Props {
  inputName: string;
  inputType: string;
  Icon?: ComponentType<SVGProps<SVGSVGElement>>;
  IconJob?: () => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  CustomStyle?:SerializedStyles;
}

const CustomInput: React.FC<Props> = ({ inputName, Icon, IconJob, onChange, inputType, CustomStyle }) => {
  return (
    <>
      <InputArea css={CustomStyle}>
        <InputAreaText>{inputName}</InputAreaText>
          <InputAreaDivider>
          <InputAreaField type={inputType} onChange={onChange}/>
          {Icon && IconJob && (<OptionButton onClick={() => IconJob()}><Icon color="black"/></OptionButton>)}
          </InputAreaDivider>
      </InputArea>
    </>
  );
};

export default CustomInput;