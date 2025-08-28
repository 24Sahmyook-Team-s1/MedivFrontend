import StudyList from "../components/StudyList";
import styled from "@emotion/styled";

const Wrapper = styled.div`
    padding: 10px;
    box-sizing: border-box;
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
`

const StudyView:React.FC = () => {
    return (
        <Wrapper>
        <StudyList />
        </Wrapper>
    )
}

export default StudyView;