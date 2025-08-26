import styled from "@emotion/styled";

export const Button = styled.button`
  width: 300px;
  height: 40px;
  background-color: white;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: black;

  &:active {
    transform: scale(0.95);
  }
`;

