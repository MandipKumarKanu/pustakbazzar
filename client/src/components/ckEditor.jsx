import { useState, useEffect, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import PrimaryBtn from "./PrimaryBtn";
import { FiTrash2, FiFileText } from "react-icons/fi";
import {
  ClassicEditor,
  AccessibilityHelp,
  Autosave,
  BalloonToolbar,
  Bold,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  Highlight,
  Italic,
  List,
  ListProperties,
  Paragraph,
  SelectAll,
  SpecialCharacters,
  Strikethrough,
  Subscript,
  Superscript,
  TodoList,
  Underline,
  Undo,
  Table,
  TableToolbar,
  TableCaption,
  TableCellProperties,
  TableProperties,
  TableColumnResize,
  Link,
  AutoLink,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";
import "./ck.css";

const WordCount = ({ content }) => {
  const text = content.replace(/<[^>]*>/g, "").trim();
  const count = text ? text.split(/\s+/).length : 0;
  return <div className="text-sm text-gray-600">Word Count: {count}</div>;
};

export const CKEditorComp = ({ content, setContent, disableCK }) => {
  const editorRef = useRef(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  useEffect(() => {
    setIsLayoutReady(true);
    return () => setIsLayoutReady(false);
  }, []);

  const editorConfig = {
    toolbar: {
      items: [
        "undo",
        "redo",
        "|",
        "selectAll",
        "|",
        "fontSize",
        "fontFamily",
        "fontColor",
        "fontBackgroundColor",
        "|",
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "subscript",
        "superscript",
        "|",
        "specialCharacters",
        "highlight",
        "|",
        "link",
        "|",
        "bulletedList",
        "numberedList",
        "todoList",
        "|",
        "insertTable",
        "|",
        "accessibilityHelp",
      ],
      shouldNotGroupWhenFull: false,
    },
    plugins: [
      AccessibilityHelp,
      Autosave,
      BalloonToolbar,
      Bold,
      Essentials,
      FontBackgroundColor,
      FontColor,
      FontFamily,
      FontSize,
      Highlight,
      Italic,
      List,
      ListProperties,
      Paragraph,
      SelectAll,
      SpecialCharacters,
      Strikethrough,
      Subscript,
      Superscript,
      TodoList,
      Underline,
      Undo,
      Table,
      TableToolbar,
      TableCaption,
      TableCellProperties,
      TableProperties,
      TableColumnResize,
      Link,
      AutoLink,
    ],
    balloonToolbar: ["bold", "italic", "|", "bulletedList", "numberedList"],
    fontFamily: {
      supportAllValues: true,
    },
    fontSize: {
      options: [10, 12, 14, "default", 18, 20, 22],
      supportAllValues: true,
    },
    initialData: content,
    list: {
      properties: {
        styles: true,
        startIndex: true,
        reversed: true,
      },
    },
    table: {
      contentToolbar: [
        "tableColumn",
        "tableRow",
        "mergeTableCells",
        "tableCellProperties",
        "tableProperties",
        "toggleTableCaption",
      ],
      tableToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
    },
    placeholder: "Type or paste your content here!",
  };

  return (
    <div className="editor-container editor-container_classic-editor ">
      <div className="editor-container__editor">
        {isLayoutReady && (
          <>
            <CKEditor
              editor={ClassicEditor}
              data={content}
              config={editorConfig}
              disabled={disableCK}
              onReady={(editor) => {
                editorRef.current = editor;
              }}
              onChange={(_, editor) => {
                const data = editor.getData();
                setContent(data);
              }}
            />
            {content && (
              <div className="flex items-center justify-end mt-4 px-1">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2.5 rounded-xl text-sm text-gray-700 font-medium border border-blue-100 flex items-center gap-2 shadow-sm">
                  <FiFileText className="text-blue-600" />
                  <WordCount content={content} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
