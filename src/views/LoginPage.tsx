import styled from "@emotion/styled";
import CustomInput from "../components/Common/InputArea";
import { Button } from "../components/Common/SubmitButton";

const Wrapper = styled.div`
  display: grid;
  height: 50%;
  aspect-ratio: 1/1;
  justify-self: center;
  align-self: center;

  background-color: #ffffff1c;
  backdrop-filter: blur(20px);
  border-radius: 20px;

  align-items: center;
  justify-items: center;
  box-sizing: border-box;
  padding: 30px 0px;
`;

const LogoArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 300px;
    height: auto;
  }
`;

export default function LoginPage() {
  return (
    <>
      <Wrapper>
        <LogoArea>
          <img src="/Logo.svg" />
        </LogoArea>
        <CustomInput inputName={"ID"} inputType="text" />
        <CustomInput inputName={"Password"} inputType="password" />
        <Button>로그인</Button>
      </Wrapper>
    </>
  );
}
