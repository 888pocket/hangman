import MetaConfig from "@/components/MetaConfig";
import { domain } from "@/constants/domain";
import { Help } from "@mui/icons-material";
import { Backdrop, Button, CircularProgress, Tooltip } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const alphabets = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

export async function getServerSideProps(context: any) {
  console.log("server side");
  const { query } = context;
  const category = query.category || "all";

  const response = await fetch(`${domain}/api/openAi?category=${category}`);
  const data = await response.json();

  return {
    props: {
      initialData: data.result,
    },
  };
}

export default function Test({ initialData }: { initialData: string }) {
  const router = useRouter();
  const { mode, category } = router.query;
  const { asPath } = useRouter();

  const [selected, setSeleted] = useState([] as string[]);
  const [wrong, setWrong] = useState([] as string[]);
  const [right, setRight] = useState([] as string[]);
  const [answerChar, setAnswerChar] = useState([] as string[]);
  const [toggleBackDrop, setToggleBackDrop] = useState(true);

  const regex = /[a-zA-Z]+(?![^a-zA-Z]*[a-zA-Z])/g;
  const matches = initialData.toUpperCase().match(regex);
  const answer =
    matches && matches.length > 0 ? matches[matches.length - 1] : "all";

  useEffect(() => {
    const temp: string[] = [];
    for (let i = 0; i < answer.length; i++) {
      temp.push(answer.charAt(i));
    }
    setAnswerChar(temp);
    setToggleBackDrop(false);
  }, []);

  const onClick = (alphabet: string) => {
    console.log(answerChar);
    setSeleted([...selected, alphabet]);
    if (answerChar.indexOf(alphabet) > -1) {
      // 정답
      setRight([...right, alphabet]);
    } else {
      // 오답
      setWrong([...wrong, alphabet]);
    }
  };

  useEffect(() => {
    if (wrong.length >= 8) {
      alert("실패!");
    }
    if (
      answerChar.length > 0 &&
      answerChar.filter((answer) => right.indexOf(answer) < 0).length < 1
    ) {
      alert("성공!");
    }
  }, [selected]);

  const meta = {
    title: "행맨 | 플레이",
    image: "/og_800.png",
    description: `행맨 플레이하기 / 카테고리 : ${category}`,
    url: domain + asPath,
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-4 lg:p-12">
      <MetaConfig {...meta} />
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={toggleBackDrop}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <div className="dashboard-section flex-row lg:flex-col justify-between">
        <div>틀린 횟수 : {wrong.length}</div>
        <div>
          디버깅을 위한 정답{" "}
          <Tooltip title={answer} sx={{ fontSize: "14px" }}>
            <span
              style={{
                top: "2px",
                marginLeft: "3px",
                position: "relative",
                cursor: "pointer",
              }}
            >
              <Help />
            </span>
          </Tooltip>
        </div>
      </div>
      <div className="image-section"></div>
      <div className="answer-section flex gap-1 text-3xl">
        {answerChar.map((answer, index) => (
          <span key={answer + index}>
            {right.indexOf(answer) > -1 ? answer : "_"}
          </span>
        ))}
      </div>
      <div className="alphabet-section grid grid-cols-5 lg:grid-cols-8 gap-2">
        {alphabets.map((alphabet, index) => (
          <Button
            key={index}
            onClick={() => onClick(alphabet)}
            disabled={
              wrong.length >= 8 ||
              (answerChar.length > 0 &&
                answerChar.filter((answer) => right.indexOf(answer) < 0)
                  .length < 1) ||
              selected.indexOf(alphabet) > -1
            }
            className={
              selected.indexOf(alphabet) < 0
                ? ""
                : wrong.indexOf(alphabet) > -1
                ? "bg-red-100"
                : "bg-blue-100"
            }
          >
            {alphabet}
          </Button>
        ))}
      </div>
      {mode == "single" &&
      (wrong.length >= 8 ||
        (answerChar.length > 0 &&
          answerChar.filter((answer) => right.indexOf(answer) < 0).length <
            1)) ? (
        <div>
          <div className="flex gap-4">
            <Button onClick={() => router.push("/")}>처음으로</Button>
            <Button onClick={() => router.reload()}>다시하기</Button>
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}