"use client";
import React from "react";
import { Select, SelectItem, Listbox, ListboxItem } from "@nextui-org/react";
import { GoDotFill, GoPencil } from "react-icons/go";
import { FaRegTrashCan } from "react-icons/fa";
import { MdOutlineCancel } from "react-icons/md";
import { useSelectedChunk } from "@/store/useSelectedChunk";
import { createClient } from "@/utils/supabase/client";
import { useDictionary } from "@/store/useDictionary";
import { useSelectedDictionary } from "@/store/useSelectedDictionary";
import { useChunk } from "@/store/useChunk";
import { useEffect, useState } from "react";
import { Button } from "@nextui-org/react";
function ItemList() {
  const { selectedChunk, setSelectedChunk } = useSelectedChunk();
  const { chunks, setChunks } = useChunk();
  const { dictionary, setDictionary } = useDictionary();
  const { selectedDictionary, setSelectedDictionary } = useSelectedDictionary();
  const [selectedItem, setSelectedItem] = useState([]);
  const [itemList, setItemList] = useState([]);
  const supabase = createClient();


  const filterDictionaryOld = async () => {
    // Get chunks that match selectedChunk ids
    const selectedChunks = chunks?.filter((chunk) =>
      selectedChunk.includes(chunk.chunkId.id)
    );

    // Extract dictionaryList from each chunk and flatten into single array
    const allDictionaryItems = selectedChunks?.flatMap(
      (chunk) => chunk.dictionaryList || []
    );

    // Remove duplicates by converting to Set and back to array
    const uniqueDictionaryItems = [...new Set(allDictionaryItems)];

    // Get full dictionary items for the unique IDs
    const itemList = dictionary?.filter((item) =>
      uniqueDictionaryItems.includes(item.id)
    );

    // Sort itemList by titleKR in ascending order
    const sortedItemList = itemList?.sort((a, b) => 
      a.titleKR.localeCompare(b.titleKR, 'ko')
    );

    setItemList(itemList);
  };

  useEffect(() => {
    filterDictionaryOld();
  }, [selectedChunk]);

  const handleCancelItem = (item) => {
    // Filter out the selected chunks that contain the item.id in their dictionaryList
    const updatedChunks = chunks.map(chunk => {
      if (selectedChunk.includes(chunk.chunkId.id)) {
        return {
          ...chunk,
          dictionaryList: chunk.dictionaryList.filter(dictItem => dictItem !== item.id)
        };
      }
      return chunk;
    });

    // Update the chunks state with the filtered chunks
    setChunks(updatedChunks);

    // Update the itemList to reflect the changes
    const updatedItemList = itemList.filter(listItem => listItem.id !== item.id);
    setItemList(updatedItemList);
  };

  

  return (
    <div className="w-full h-[calc(100vh-200px)] flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-y-3">
          {itemList?.map((item, index) => (
            <div
              className="border-2 border-yellow-500 rounded-lg p-2 text-sm relative"
              key={index}
            >
              <div className="w-auto h-full absolute top-1 right-1">
                <MdOutlineCancel className="text-yellow-500 cursor-pointer hover:text-red-500 transition-transform" onClick={() => (handleCancelItem(item))} />
              </div>
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <div className="flex items-center gap-x-1">
                    {item.isNew === true ? (
                      <GoDotFill
                        className={`${item.isFixed ? "text-green-500" : "text-red-500"}`}
                      />
                    ) : (
                      <></>
                    )}
                    <span className="text-[10px] text-default-400">
                      {item.categoryLarge} / {item.categoryMiddle} /{" "}
                      {item.categorySmall}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs">{item.titleKR}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="h-16 flex items-center ">
        <Button color="primary" className="w-full">
          적용하기
        </Button>
      </div>
    </div>
  );
}

export default ItemList;
