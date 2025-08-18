import React from "react";

const Createnotes = ({ inputTitle, setInputTitle, inputText, setInputText, saveHandler, isExpanded, cancelHandler, isEditor }) => {
  const contentRef = React.useRef(null);

  const exec = (command) => {
    const el = contentRef.current;
    if (!el) return;
    el.focus();
    document.execCommand(command, false);
    // keep state in sync
    setInputText(el.innerHTML);
  };

  const applyBold = () => exec("bold");
  const applyItalic = () => exec("italic");
  const applyList = () => exec("insertUnorderedList");

  // initialize content on mount only to avoid caret jump while typing
  React.useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.innerHTML = inputText || "";
  }, []);

  return (
    <div className={`note card ${isExpanded ? "expanded" : ""} ${isEditor ? "editor" : ""}`}>
      {/* Title is now edited in the page header; removed from editor card */}
      <div className="editor-toolbar d-flex" style={{ gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
        <button className="category-menu-trigger editor-btn" title="Bold (Ctrl+B)" aria-label="Bold" onClick={applyBold}>
          <span style={{fontWeight:700}}>B</span>
        </button>
        <button className="category-menu-trigger editor-btn" title="Italic (Ctrl+I)" aria-label="Italic" onClick={applyItalic}>
          <span style={{fontStyle:'italic'}}>I</span>
        </button>
        <button className="category-menu-trigger editor-btn" title="Bullet list (Ctrl+L)" aria-label="Bullet list" onClick={applyList}>
          <span>•</span>
        </button>
      </div>
      <div
        className="editor-textarea editor-content"
        contentEditable
        role="textbox"
        aria-multiline="true"
        ref={contentRef}
        data-placeholder="Write here..."
        onInput={() => {
          const el = contentRef.current;
          if (!el) return;
          setInputText(el.innerHTML);
        }}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B')) {
            e.preventDefault();
            applyBold();
            return;
          }
          if ((e.ctrlKey || e.metaKey) && (e.key === 'i' || e.key === 'I')) {
            e.preventDefault();
            applyItalic();
            return;
          }
          if ((e.ctrlKey || e.metaKey) && (e.key === 'l' || e.key === 'L')) {
            e.preventDefault();
            applyList();
            return;
          }
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            saveHandler();
          }
          if (e.key === 'Escape' && typeof cancelHandler === 'function') {
            e.preventDefault();
            cancelHandler();
          }
        }}
        suppressContentEditableWarning={true}
      ></div>
      <div
        className="note_footer d-flex align-items-center"
        style={{ justifyContent: "space-between" }}
      >
        <span className="label">{(inputText || '').replace(/<[^>]*>/g, '').length} chars</span>
        <div className="d-flex" style={{ gap: "0.5rem" }}>
          {cancelHandler && (
            <button className="notesave btn" onClick={cancelHandler}>
              Cancel
            </button>
          )}
          <button className="notesave btn" onClick={saveHandler}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Createnotes;
