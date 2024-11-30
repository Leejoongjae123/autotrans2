"use client";
import React from "react";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import {
  Image,
  Input,
  Chip,
  CardHeader,
  CardFooter,
  Divider,
  Link,
  Card,
  Spinner,
  Tabs,
  Tab,
  CardBody,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";

import { Textarea } from "@nextui-org/input";
import ChapterLists from "./components/ChapterLists";
import DictionaryList from "./components/DictionaryList";
import { ToastContainer, toast } from "react-toastify";

export default function Page({ params }) {
  const unwrappedParams = React.use(params);
  const { articleId } = unwrappedParams;
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [article, setArticle] = useState(null);
  const [selectedTab, setSelectedTab] = useState("회차목록");
  const [titleKR, setTitleKR] = useState("");
  const [titleEN, setTitleEN] = useState("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const getArticle = async () => {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("id", articleId)
      .single();
    setArticle(data);
    setTitleKR(data?.titleKR);
    setTitleEN(data?.titleEN);
    setIsLoading(false);
  };

  useEffect(() => {
    getArticle();
  }, []);

  const handleEditTitle = async () => {
    const { error } = await supabase.from("books").update({
      titleKR: titleKR,
      titleEN: titleEN,
    }).eq("id", articleId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("제목 수정 완료");
      getArticle();
    }
  }

  return (
    <div className="flex flex-col">
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <Spinner color="primary" />
        </div>
      ) : (
        <>
          <div className="flex flex-row justify-between">
            <div>
              <p className="text-2xl text-start">{article?.titleKR}</p>
              <p className="text-lg text-gray-500 text-start">
                {article?.titleEN}
              </p>
              <p>생성일 : {formatTimestamp(article?.created_at)}</p>
            </div>
            <div>
              <Button onPress={onOpen} color="primary">수정하기</Button>
            </div>
          </div>
          <div className="flex flex-row w-full h-16 rounded-2xl my-5 border border-gray-200">
            <div className="w-1/2 h-full relative  flex flex-col justify-center">
              <p className="text-center">작가</p>
              <p className="text-center">{article?.authorKR}</p>
              <div className="absolute right-0 top-[15%] bottom-[15%] w-[1px] bg-gray-300"></div>
            </div>
            <div className="w-1/2 h-full  flex flex-col justify-center">
              <p className="text-center">장르</p>
              <p className="text-center">{article?.genre?.join(" | ")}</p>
            </div>
          </div>
          <div className="w-full">
            <Tabs
              fullWidth
              aria-label="Options"
              defaultSelectedKey={selectedTab}
              onSelectionChange={setSelectedTab}
            >
              <Tab key="회차목록" title="회차목록"></Tab>
              <Tab key="용어집" title="용어집"></Tab>
              <Tab key="등장인물" title="등장인물"></Tab>
            </Tabs>
          </div>
          {selectedTab === "회차목록" && (
            <ChapterLists articleId={articleId}></ChapterLists>
          )}
          {selectedTab === "용어집" && (
            <DictionaryList articleId={articleId}></DictionaryList>
          )}
        </>
      )}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                제목 수정하기
              </ModalHeader>
              <ModalBody>
                <h1>제목(한글)</h1>
                <Input className="w-full" value={titleKR} onValueChange={(value) => setTitleKR(value)}></Input>
                <h1>제목(영문)</h1>
                <Input className="w-full" value={titleEN} onValueChange={(value) => setTitleEN(value)}></Input>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  취소
                </Button>
                <Button color="primary" onPress={()=>{
                  onClose();
                  handleEditTitle();
                }}>
                  확인
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
